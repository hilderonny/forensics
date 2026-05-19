import * as Hilfsfunktionen from './hilfsfunktionen.mjs'
import Aufgabe from './types/Aufgabe.mjs'
import Aufgabenstatus from './types/Aufgabenstatus.mjs'
import Aufgabenstatuses from './templates/Aufgabenstatuses.mjs'
import Benutzer from './types/Benutzer.mjs'
import Spur from './types/Spur.mjs'
import Taetigkeit from './types/Taetigkeit.mjs'
import Taetigkeitenliste from './components/taetigkeitenliste.mjs'
import Titelzeile from './components/titelzeile.mjs'
import Vorgang from './types/Vorgang.mjs'

const vueApp = {
    components: {
        Taetigkeitenliste,
        Titelzeile,
    },
    data() {
        const [vorgangsId, spurenId, aufgabenId] = location.search.substring(1).split('&')
        return {
            aufgabe: undefined,
            aufgabenId: aufgabenId,
            aufgabenstatus: undefined,
            aufgabenstatuses: Aufgabenstatuses,
            benutzerdaten: undefined,
            spur: undefined,
            spurenId: spurenId,
            spurentaetigkeiten: undefined,
            taetigkeiten: undefined,
            vorgang: undefined,
            vorgangsId: vorgangsId,
        }
    },
    async created() {
        this.vorgang = await Vorgang.load(this.vorgangsId)
        this.spur = await Spur.load(this.spurenId)
        const matchingStatuses = await Aufgabenstatus.query(`SELECT * FROM Aufgabenstatuses WHERE SpurenId='${this.spurenId}' AND AufgabenId='${this.aufgabenId}'`)
        if (matchingStatuses.length > 0) {
            this.aufgabenstatus = matchingStatuses[0]
        } else {
            this.aufgabenstatus = new Aufgabenstatus({ SpurenId: this.spurenId, VorgangsId: this.vorgangsId, AufgabenId: this.aufgabenId, Status: 'offen' })
            await this.aufgabenstatus.save()
        }
        this.aufgabe = await Aufgabe.load(this.aufgabenId)
        this.taetigkeiten = await Taetigkeit.query(`SELECT * FROM Taetigkeiten WHERE AufgabenstatusId='${this.aufgabenstatus.Id}'`)
        this.benutzerdaten = await Benutzer.load(localStorage.getItem('userid'))
        document.title = this.aufgabe.Titel
    },
    methods: {
        ersetzePlatzhalter: Hilfsfunktionen.ersetzePlatzhalter,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
    }
}

Vue.createApp(vueApp).mount('body')