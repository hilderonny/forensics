import * as Arrange from '/arrange/js/arrange.mjs'
import * as Hilfsfunktionen from './hilfsfunktionen.mjs'

import Aufgabe from './types/Aufgabe.mjs'
import Titelzeile from './components/titelzeile.mjs'
import Vorgangstyp from './types/Vorgangstyp.mjs'

const vueApp = {
    components: {
        Titelzeile,
    },
    data() {
        return {
            aenderungVorhanden: false,
            aufgabe: undefined,
            aufgabenId: location.search.substring(1),
            vorgangstyp: undefined,
        }
    },
    async created() {
        this.aufgabe = await Aufgabe.load(this.aufgabenId)
        this.vorgangstyp = await Vorgangstyp.load(this.aufgabe.VorgangstypenId)
        document.title = this.aufgabe.Titel
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        abmelden() {
            Arrange.logout()
        },
        async behandleLoeschenButtonKlick() {
            // TODO: Prüfen, ob löschbar oder in Verwendung
            if (!confirm('Aufgabe wirklich löschen?')) return
            await this.aufgabe.delete()
            this.behandleVorgangstypenButtonKlick()
        },
        async behandleSpeichernButtonKlick() {
            await this.aufgabe.save()
            this.aenderungVorhanden = false
        },
        async behandleVorgangstypenButtonKlick() {
            location.href = 'vorgangstypen.html?' + this.aufgabe.VorgangstypenId
        },
        ersetzePlatzhalter: Hilfsfunktionen.ersetzePlatzhalter,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
    }
}

Vue.createApp(vueApp).mount('body')