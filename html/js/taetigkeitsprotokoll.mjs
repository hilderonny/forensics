import * as Arrange from '/arrange/js/arrange.mjs'
import * as Hilfsfunktionen from './hilfsfunktionen.mjs'
import Benutzer from './types/Benutzer.mjs'
import Spur from './types/Spur.mjs'
import Vorgang from './types/Vorgang.mjs'

const vueApp = {
    computed: {
        sortierteSpuren() {
            return this.spuren.sort((spur1, spur2) => {
                const spurnummer1fuerVergleich = spur1.Spurnummer.replace(/\d+/g, match => match.padStart(4, '0').slice(-4))
                const spurnummer2fuerVergleich = spur2.Spurnummer.replace(/\d+/g, match => match.padStart(4, '0').slice(-4))
                return spurnummer1fuerVergleich.localeCompare(spurnummer2fuerVergleich)
            })
        },
        spurenTaetigkeiten() {
            return this.spuren.map(spur => { return {
                spur: spur,
                taetigkeiten: this.taetigkeiten.filter(taetigkeit => taetigkeit.SpurenId === spur.Id).sort((taetigkeit1, taetigkeit2) => taetigkeit1.startzeit - taetigkeit2.startzeit)
            } })
        },
        vorgangsTaetigkeiten() {
            return this.taetigkeiten.filter(taetigkeit => !taetigkeit.SpurenId).sort((taetigkeit1, taetigkeit2) => taetigkeit1.startzeit - taetigkeit2.startzeit)
        },
    },
    data() {
        return {
            benutzer: undefined,
            notizen: undefined,
            spuren: undefined,
            taetigkeiten: undefined,
            userId: localStorage.getItem('userid'),
            vorgang: undefined,
            vorgangsId: location.search.substring(1),
        }
    },
    async created() {
        this.vorgang = await Vorgang.load(this.vorgangsId)
        this.spuren = await Spur.query(`SELECT Id, Dasiplatte, Spurname, Spurnummer FROM Spuren WHERE VorgangsId='${this.vorgangsId}'`)
        this.taetigkeiten = await Arrange.queryDatabase('Forensics', `SELECT Taetigkeiten.Text, Taetigkeiten.Startzeit, Taetigkeiten.Endzeit, Aufgabenstatuses.AufgabenId, Aufgabenstatuses.SpurenId FROM Taetigkeiten JOIN Aufgabenstatuses ON Aufgabenstatuses.Id = Taetigkeiten.AufgabenstatusId WHERE Aufgabenstatuses.VorgangsId = '${this.vorgang.Id}' ORDER BY Taetigkeiten.Startzeit ASC`)
        this.notizen = await Spur.query(`SELECT Notizen.Datum, Notizen.SpurenId, Notizen.Text FROM Notizen LEFT JOIN Spuren ON Spuren.Id = Notizen.SpurenId WHERE Notizen.VorgangsId='${this.vorgangsId}' OR Spuren.VorgangsId='${this.vorgangsId}' ORDER BY Datum`)
        this.benutzer = await Benutzer.load(this.userId)
        document.title = Hilfsfunktionen.dateinameFuerTaetigkeitsprotokoll(this.vorgang, this.benutzer)
        await Vue.nextTick() // Nach dem Rendern erst aufhübschen
        const previewer = new Paged.Previewer()
        await previewer.preview()
    },
    methods: {
        formatiereDatum: Hilfsfunktionen.formatiereDatum,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
        formatiereZeit: Hilfsfunktionen.formatiereZeit,
    },
}

Vue.createApp(vueApp).mount('body')