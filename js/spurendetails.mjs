import * as Hilfsfunktionen from './hilfsfunktionen.mjs'
import Aufgabenleiste from './components/aufgabenleiste.mjs'
import Aufgabenstatus from './types/Aufgabenstatus.mjs'
import Geraetearten from './templates/Geraetearten.mjs'
import Notizenliste from './components/notizenliste.mjs'
import Spurenfragen from './components/spurenfragen.mjs'
import Spurentaetigkeiten from './components/spurentaetigkeiten.mjs'
import Spur from './types/Spur.mjs'
import Titelzeile from './components/titelzeile.mjs'
import Vorgang from './types/Vorgang.mjs'

const vueApp = {
    components: {
        Aufgabenleiste,
        Notizenliste,
        Spurenfragen,
        Spurentaetigkeiten,
        Titelzeile,
    },
    data() {
        const [vorgangsId, spurenId] = location.search.substring(1).split('&')
        return {
            aenderungVorhanden: false,
            aufgabenstatuses: undefined,
            geraetearten: Geraetearten,
            spur: undefined,
            spurenId: spurenId,
            vorgang: undefined,
            vorgangsId: vorgangsId,
        }
    },
    async created() {
        this.spur = await Spur.load(this.spurenId)
        this.vorgang = await Vorgang.load(this.vorgangsId)
        document.title = this.spur.Spurnummer
        this.aufgabenstatuses = await Aufgabenstatus.query(`SELECT * FROM Aufgabenstatuses WHERE SpurenId = '${this.spurenId}'`)
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        async behandleLoeschenButtonKlick() {
            if (!confirm('Spur wirklich löschen?')) return
            await this.spur.delete()
            location.href = 'vorgangsdetails.html?' + this.vorgangsId
        },
        async behandleSpeichernButtonKlick() {
            await this.spur.save()
            this.aenderungVorhanden = false
        },
    }
}

Vue.createApp(vueApp).mount('body')