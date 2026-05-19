import * as Arrange from '/arrange/js/arrange.mjs'

import Aufgabe from './types/Aufgabe.mjs'
import Benutzer from './types/Benutzer.mjs'
import Datenbankvorlage from './templates/Datenbank.mjs'
import Dienststelle from './types/Dienststelle.mjs'
import EinstellungenToolbar from './components/einstellungen-toolbar.mjs'
import Titelzeile from './components/titelzeile.mjs'
import Vorgangstyp from './types/Vorgangstyp.mjs'

const vueApp = {
    components: {
        EinstellungenToolbar,
        Titelzeile,
    },
    data() {
        return {
            aktuelleEinrichtungsdialogseite: 1,
            benutzer: undefined,
            benutzername: undefined,
            datenbankaktualisierungsprotokoll: [],
            datenbankschemaWurdeAltualisiert: false,
            dienststelle: undefined,
            dienststellenname: undefined,
            vorgangstyp: undefined,
            vorgangstypname: undefined,
            vorgangstypenimportprotokoll: [],
            zeigeEinrichtungsdialog: false,
        }
    },
    async created() {
        try {
            this.benutzer = await Benutzer.load(localStorage.getItem('userid'))
        } catch {}
        if (!this.benutzer) {
            // Datenbankabfrage schlug trotz erfolgreicher Anmeldung fehl.
            // Das bedeutet, dass das System noch nicht eingerichtet ist, also Einrichtungsdialog in den Datenbank-Einstellungen zeigen
            this.zeigeEinrichtungsdialog = true
        }
    },
    methods: {
        abmelden() {
            Arrange.logout()
        },
        async behandleEinrichtungsdialogBenutzerSpeichernUndBeendenButtonKlick() {
            if (!this.benutzer) {
                this.benutzer = new Benutzer({
                    Id: localStorage.getItem('userid'),
                    Benutzername: localStorage.getItem('username'),
                })
            }
            this.benutzer.Name = this.benutzername
            this.benutzer.DienststellenId = this.dienststelle.Id
            await this.benutzer.save()
            this.zeigeEinrichtungsdialog = false
            location.href = './'
        },
        async behandleEinrichtungsdialogDienststelleSpeichernUndWeiterButtonKlick() {
            if (!this.dienststelle) {
                this.dienststelle = new Dienststelle()
            }
            this.dienststelle.Name = this.dienststellenname
            await this.dienststelle.save()
            this.aktuelleEinrichtungsdialogseite = 4
        },
        async behandleEinrichtungsdialogVorgangstypSpeichernUndWeiterButtonKlick() {
            if (!this.vorgangstyp) {
                this.vorgangstyp = new Vorgangstyp()
            }
            this.vorgangstyp.Name = this.vorgangstypname
            await this.vorgangstyp.save()
            this.aktuelleEinrichtungsdialogseite = 3
        },
        async behandleDatenbankSchemaAktualisierenButtonKlick() {
            this.datenbankaktualisierungsprotokoll = []
            // Datenbankschema aktualisieren
            for (const [ datenbankname, datenbankschema ] of Object.entries(Datenbankvorlage)) {
                this.datenbankaktualisierungsprotokoll.push(`Aktualisiere Schema für Datenbank "${datenbankname}" ...`)
                await Arrange.updateDatabase(datenbankname, datenbankschema)
            }
            this.datenbankaktualisierungsprotokoll.push('Aktualisierung des Datenbankschemas abgeschlossen.')
            this.datenbankschemaWurdeAltualisiert = true
        },
        async behandleVorgangstypenExportButtonKlick() {
            const datenstruktur = {
                Aufgaben: await Aufgabe.query(`SELECT * FROM Aufgaben`),
                Vorgangstypen: await Vorgangstyp.query('SELECT * FROM Vorgangstypen'),
            }
            const link = document.createElement('a')
            const file = new Blob([JSON.stringify(datenstruktur, undefined, '\t')], { type: 'application/json' })
            link.href = URL.createObjectURL(file)
            link.download = 'vorgangstypen.json'
            link.click()
            URL.revokeObjectURL(link.href)
        },
        async behandleVorgangstypenImportDateiSelektiert(event) {
            this.vorgangstypenimportprotokoll = []
            const file = event.target.files[0]
            const datenstruktur = JSON.parse(await file.text())
            for (const vorgangstyp of datenstruktur.Vorgangstypen) {
                this.vorgangstypenimportprotokoll.push(`Impotiere Vorgangstyp "${vorgangstyp.Name}" ...`)
                await (new Vorgangstyp(vorgangstyp)).save()
            }
            for (const aufgabe of datenstruktur.Aufgaben) {
                this.vorgangstypenimportprotokoll.push(`Impotiere ${aufgabe.Typ} "${aufgabe.Titel}" ...`)
                await (new Aufgabe(aufgabe)).save()
            }
            this.vorgangstypenimportprotokoll.push('Fertig.')
        },
    }
}

Vue.createApp(vueApp).mount('body')