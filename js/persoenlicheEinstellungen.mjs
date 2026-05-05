import * as Arrange from '/arrange/js/arrange.mjs'
import * as Hilfsfunktionen from './hilfsfunktionen.mjs'
import Benutzer from './types/Benutzer.mjs'
import Dienststelle from './types/Dienststelle.mjs'
import EinstellungenToolbar from './components/einstellungen-toolbar.mjs'
import Titelzeile from './components/titelzeile.mjs'

const vueApp = {
    components: {
        EinstellungenToolbar,
        Titelzeile,
    },
    data() {
        return {
            aenderungVorhanden: false,
            benutzer: undefined,
            dienststellen: undefined,
        }
    },
    async created() {
        this.dienststellen = await Dienststelle.query('SELECT * FROM Dienststellen ORDER BY Name')
        this.benutzer = await Benutzer.load(localStorage.getItem('userid'))
        if (!this.benutzer) {
            this.benutzer = new Benutzer({
                Id: localStorage.getItem('userid'),
                Benutzername: localStorage.getItem('username'),
                DienststellenId: this.dienststellen[0].Id,
            })
            await this.benutzer.save()
        }
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        abmelden() {
            Arrange.logout()
        },
        async behandleSpeichernButtonKlick() {
            await this.benutzer.save()
            this.aenderungVorhanden = false
        },
    }
}

Vue.createApp(vueApp).mount('body')