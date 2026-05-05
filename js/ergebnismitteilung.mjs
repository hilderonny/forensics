import * as Hilfsfunktionen from './hilfsfunktionen.mjs'
import Benutzer from './types/Benutzer.mjs'
import Dienststelle from './types/Dienststelle.mjs'
import Spur from './types/Spur.mjs'
import Vorgang from './types/Vorgang.mjs'
import Vorgangsfrage from './types/Vorgangsfrage.mjs'

const vueApp = {
    computed: {
        spurenMitBesonderheiten() {
            return this.sortierteSpuren.filter(spur => spur.Besonderheiten?.length > 0)
        },
        sortierteSpuren: function() {
            return this.spuren.sort((spur1, spur2) => {
                const spurnummer1fuerVergleich = spur1.Spurnummer.replace(/\d+/g, match => match.padStart(4, '0').slice(-4))
                const spurnummer2fuerVergleich = spur2.Spurnummer.replace(/\d+/g, match => match.padStart(4, '0').slice(-4))
                return spurnummer1fuerVergleich.localeCompare(spurnummer2fuerVergleich)
            })
        }
    },
    data() {
        return {
            aktuellesDatum: Date.now(),
            benutzer: undefined,
            dienststelle: undefined,
            spuren: undefined,
            userId: localStorage.getItem('userid'),
            vorgang: undefined,
            vorgangsId: location.search.substring(1),
            vorgangsfragen: undefined,
        }
    },
    async created() {
        this.benutzer = await Benutzer.load(this.userId)
        this.dienststelle = (await Dienststelle.query(`SELECT Dienststellen.* FROM Benutzer JOIN Dienststellen ON Dienststellen.Id = Benutzer.DienststellenId WHERE Benutzer.Id = '${this.userId}'`))[0]
        this.spuren = await Spur.query(`SELECT Besonderheiten, Dasiplatte, Spurname, Spurnummer FROM Spuren WHERE VorgangsId='${this.vorgangsId}'`)
        this.vorgang = await Vorgang.load(this.vorgangsId)
        this.vorgangsfragen = await Vorgangsfrage.query(`SELECT Antwort, Frage, Nummer FROM Vorgangsfragen WHERE VorgangsId='${this.vorgangsId}' ORDER BY Nummer`)
        document.title = Hilfsfunktionen.dateinameFuerErgebnismitteilung(this.vorgang, this.benutzer)
        await Vue.nextTick() // Nach dem Rendern erst aufhübschen
        const previewer = new Paged.Previewer()
        await previewer.preview()
    },
    methods: {
        ersetzePlatzhalter: Hilfsfunktionen.ersetzePlatzhalter,
        formatiereDatum: Hilfsfunktionen.formatiereDatum,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
    },
}

Vue.createApp(vueApp).mount('body')