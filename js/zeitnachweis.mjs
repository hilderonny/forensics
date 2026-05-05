import * as Arrange from '/arrange/js/arrange.mjs'
import * as Hilfsfunktionen from './hilfsfunktionen.mjs'
import Benutzer from './types/Benutzer.mjs'
import Taetigkeit from './types/Taetigkeit.mjs'
import Vorgang from './types/Vorgang.mjs'

const vueApp = {
    computed: {
        gesamtDauer() {
            let dauer = 0
            for (const zeiteintrag of this.zeiteintraege) {
                dauer += zeiteintrag.dauer
            }
            return dauer
        },
    },
    data() {
        return {
            benutzer: undefined,
            userId: localStorage.getItem('userid'),
            vorgang: undefined,
            vorgangsId: location.search.substring(1),
            zeiteintraege: undefined,
        }
    },
    async created() {
        this.benutzer = await Benutzer.load(this.userId)
        this.vorgang = await Vorgang.load(this.vorgangsId)
        const taetigkeiten = await Taetigkeit.query(`SELECT Taetigkeiten.Text, Taetigkeiten.Startzeit, Taetigkeiten.Endzeit, Aufgabenstatuses.AufgabenId, Spuren.Spurnummer, Spuren.Id, Aufgaben.Titel AS Aufgabentitel FROM Taetigkeiten JOIN Aufgabenstatuses ON Aufgabenstatuses.Id = Taetigkeiten.AufgabenstatusId JOIN Aufgaben ON Aufgaben.Id = Aufgabenstatuses.AufgabenId LEFT JOIN Spuren ON Spuren.Id = Aufgabenstatuses.SpurenId WHERE Aufgabenstatuses.VorgangsId = '${this.vorgang.Id}' ORDER BY Taetigkeiten.Startzeit ASC`)
        this.zeiteintraege = []
        for (const taetigkeit of taetigkeiten) {
            this.zeiteintraege.push({
                beginn: taetigkeit.Startzeit,
                datum: Math.floor(taetigkeit.Startzeit / 86400000) * 86400000,
                dauer: taetigkeit.Endzeit - taetigkeit.Startzeit,
                ende: taetigkeit.Endzeit,
                kurzbeschreibung: taetigkeit.Aufgabentitel,
            })
        }
        // Datum filtern
        let letztesDatum = 0
        for (const zeiteintrag of this.zeiteintraege) {
            if (zeiteintrag.datum == letztesDatum) {
                zeiteintrag.datum = undefined
            } else {
                letztesDatum = zeiteintrag.datum
            }
        }
        document.title = Hilfsfunktionen.dateinameFuerZeitnachweis(this.vorgang, this.benutzer)
        await Vue.nextTick() // Nach dem Rendern erst aufhübschen
        const previewer = new Paged.Previewer()
        await previewer.preview()
    },
    methods: {
        formatiereDatum: Hilfsfunktionen.formatiereDatum,
        formatiereDauer: Hilfsfunktionen.formatiereDauer,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
        formatiereZeit: Hilfsfunktionen.formatiereZeit,
    },
}

Vue.createApp(vueApp).mount('body')