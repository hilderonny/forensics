import * as Arrange from '/arrange/js/arrange.mjs'

import Benutzer from './types/Benutzer.mjs'
import Vorgangsliste from './components/vorgangsliste.mjs'
import Vorgangsstatuses from './templates/Vorgangsstatuses.mjs'
import Titelzeile from './components/titelzeile.mjs'

const vueApp = {
    components: {
        Vorgangsliste,
        Titelzeile,
    },
    data() {
        return {
            anzuzeigendeVorgaenge: [],
            vorgangsstatuses: Vorgangsstatuses,
            zeigeBenutzer: false,

            selectedTab: 'meinevorgaenge',
            userId: localStorage.getItem('userid'),
        }
    },
    async created() {
        await this.handleMeineVorgaengeTabButtonClick()
    },
    methods: {
        abmelden() {
            Arrange.logout()
        },
        async handleAlleVorgaengeTabButtonClick() {
            this.anzuzeigendeVorgaenge = await Arrange.queryDatabase('Forensics', `SELECT Vorgaenge.Aktenzeichen, Vorgaenge.Ansprechpartner, Vorgaenge.Auftragsdatum, Vorgaenge.Beschreibung, Vorgaenge.Id, Vorgaenge.Prioritaet, Vorgaenge.Status, Vorgaenge.Vorgangsnummer, Benutzer.Name AS Sachbearbeiter FROM Vorgaenge LEFT JOIN Benutzer ON Vorgaenge.UserId=Benutzer.Id`) || []
            this.selectedTab = 'allevorgaenge'
            this.zeigeBenutzer = true
        },
        async handleMeineVorgaengeTabButtonClick() {
            // Zuerst prüfen, ob nach Registrierung der Benutzer angelegt werden muss
            const benutzer = await Benutzer.load(this.userId)
            if (!benutzer) {
                location.href = 'persoenlicheEinstellungen.html'
            } else {
                try {
                    this.anzuzeigendeVorgaenge = await Arrange.queryDatabase('Forensics', `SELECT Vorgaenge.Aktenzeichen, Vorgaenge.Ansprechpartner, Vorgaenge.Auftragsdatum, Vorgaenge.Beschreibung, Vorgaenge.Id, Vorgaenge.Prioritaet, Vorgaenge.Status, Vorgaenge.Vorgangsnummer FROM Vorgaenge WHERE UserId = '${this.userId}'`) || []
                    this.selectedTab = 'meinevorgaenge'
                    this.zeigeBenutzer = false
                } catch (exception) {
                    // Datenbankabfrage schlug trotz erfolgreicher Anmeldung fehl.
                    // Das bedeutet, dass das System noch nicht eingerichtet ist, also Einrichtungsdialog in den Datenbank-Einstellungen zeigen
                    location.href = 'datenbank.html'
                }
            }
        },
    }
}

Vue.createApp(vueApp).mount('body')