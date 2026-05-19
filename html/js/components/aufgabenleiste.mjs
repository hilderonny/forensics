import Aufgabe from '../types/Aufgabe.mjs'
import Aufgabenstatuses from '../templates/Aufgabenstatuses.mjs'

export default {
    computed: {
        aufgabenFuerTyp() {
            return this.aufgaben.filter(aufgabe => aufgabe.VorgangstypenId === this.vorgangstypid)
        },
    },
    data() {
        return {
            aufgaben: undefined,
        }
    },
    props: {
        aufgabenstatuses: Array,
        aufgabentyp: String,
        vorgangstypid: String,
        zielUrl: String,
    },
    async created() {
        this.aufgaben = await Aufgabe.query(`SELECT Id, Titel, VorgangstypenId FROM Aufgaben WHERE Typ='${this.aufgabentyp}' AND (Archiviert IS NULL OR Archiviert=0) ORDER BY Reihenfolge`)
    },
    methods: {
        aufgabenstatusFuerAufgabe(aufgabe) {
            return this.aufgabenstatuses?.find(aufgabenstatus => aufgabenstatus.AufgabenId === aufgabe.Id)
        },
        styleFuerAufgabe(aufgabe) {
            const aufgabenstatus = this.aufgabenstatusFuerAufgabe(aufgabe)
            if (!aufgabenstatus) return ''
            const aufgabenstatusdefinition = Aufgabenstatuses.find(status => status.id === aufgabenstatus.Status)
            if (!aufgabenstatusdefinition) return ''
            return `background-color:${aufgabenstatusdefinition.farbe};border-left-color:${aufgabenstatusdefinition.farbe};`
        }
    },
    template: `
        <div v-if="aufgaben" class="forminput aufgabenleiste">
            <label>Aufgaben</label>
            <div class="path">
                <a v-for="aufgabe in aufgabenFuerTyp" class="pathstep" :style="styleFuerAufgabe(aufgabe)" :href="zielUrl + aufgabe.Id">{{aufgabe.Titel}}</a>
            </div>
        </div>
    `,
}
