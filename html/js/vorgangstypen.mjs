import * as Arrange from '/arrange/js/arrange.mjs'
import * as Hilfsfunktionen from './hilfsfunktionen.mjs'

import Aufgabe from './types/Aufgabe.mjs'
import EinstellungenToolbar from './components/einstellungen-toolbar.mjs'
import Vorgangstyp from './types/Vorgangstyp.mjs'
import Titelzeile from './components/titelzeile.mjs'

const vueApp = {
    components: {
        EinstellungenToolbar,
        Titelzeile,
    },
    computed: {
        sortierteSpurenaufgaben() {
            return this.spurenaufgaben.filter(aufgabe => aufgabe.VorgangstypenId === this.selektierterVorgangstyp.Id).sort((aufgabe1, aufgabe2) => aufgabe1.Reihenfolge - aufgabe2.Reihenfolge)
        },
        sortierteVorgangsaufgaben() {
            return this.vorgangsaufgaben.filter(aufgabe => aufgabe.VorgangstypenId === this.selektierterVorgangstyp.Id).sort((aufgabe1, aufgabe2) => aufgabe1.Reihenfolge - aufgabe2.Reihenfolge)
        },
        sortierteVorgangstypen() {
            return this.vorgangstypen.sort((vorgangstyp1, vorgangstyp2) => vorgangstyp1.Name?.localeCompare(vorgangstyp2.Name))
        },
    },
    data() {
        return {
            aenderungVorhanden: false,
            selektierterVorgangstyp: undefined,
            spurenaufgaben: undefined,
            vorgangsaufgaben: undefined,
            vorgangstypen: undefined,
        }
    },
    async created() {
        this.spurenaufgaben = await Aufgabe.query(`SELECT * FROM Aufgaben WHERE Typ='Spurenaufgabe'`)
        this.vorgangsaufgaben = await Aufgabe.query(`SELECT * FROM Aufgaben WHERE Typ='Vorgangsaufgabe'`)
        this.vorgangstypen = await Vorgangstyp.query('SELECT * FROM Vorgangstypen')
        const selektierteVorgangstypenId = location.search.substring(1)
        if (selektierteVorgangstypenId) {
            this.selektierterVorgangstyp = this.vorgangstypen.find(vorgangstyp => vorgangstyp.Id === selektierteVorgangstypenId)
        }
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        abmelden() {
            Arrange.logout()
        },
        async behandleLoeschenButtonKlick() {
            // TODO: Prüfen, ob löschbar oder in Verwendung
            if (!confirm('Vorgangstyp wirklich löschen?')) return
            await this.selektierterVorgangstyp.delete()
            this.vorgangstypen.splice(this.vorgangstypen.indexOf(this.selektierterVorgangstyp), 1)
            this.selektierterVorgangstyp = undefined
        },
        async behandleNeueSpurenaufgabeButtonKlick() {
            const neueSpurenaufgabe = new Aufgabe({ 
                Reihenfolge: this.sortierteSpurenaufgaben.length + 1,
                Typ: 'Spurenaufgabe',
                VorgangstypenId: this.selektierterVorgangstyp.Id,
            })
            neueSpurenaufgabe.save()
            location.href = 'aufgabeneditor.html?' + neueSpurenaufgabe.Id
        },
        async behandleNeueVorgangsaufgabeButtonKlick() {
            const neueVorgangsaufgabe = new Aufgabe({ 
                Reihenfolge: this.sortierteVorgangsaufgaben.length + 1,
                Typ: 'Vorgangsaufgabe',
                VorgangstypenId: this.selektierterVorgangstyp.Id,
            })
            neueVorgangsaufgabe.save()
            location.href = 'aufgabeneditor.html?' + neueVorgangsaufgabe.Id
        },
        async behandleNeuerVorgangstypButtonKlick() {
            this.selektierterVorgangstyp = new Vorgangstyp()
            await this.selektierterVorgangstyp.save()
            this.vorgangstypen.push(this.selektierterVorgangstyp)
        },
        async behandleSpeichernButtonKlick() {
            await this.selektierterVorgangstyp.save()
            this.aenderungVorhanden = false
        },
    }
}

Vue.createApp(vueApp).mount('body')