import * as Hilfsfunktionen from '../hilfsfunktionen.mjs'
import Aufgabenstatus from '../types/Aufgabenstatus.mjs'
import Taetigkeit from '../types/Taetigkeit.mjs'
import Vorgang from '../types/Vorgang.mjs'
import Spur from '../types/Spur.mjs'

export default {
    computed: {
        sortierteTaetigkeiten() {
            return this.taetigkeiten.sort((taetigkeit1, taetigkeit2) => taetigkeit2.Startzeit - taetigkeit1.Startzeit)
        },
    },
    data() {
        return {
            aufgabenstatuses: undefined,
            taetigkeiten: undefined,
            vorgang: undefined,
        }
    },
    props: {
        spurenId: String,
    },
    async created() {
        this.aufgabenstatuses = await Aufgabenstatus.query(`SELECT * FROM Aufgabenstatuses WHERE SpurenId = '${this.spurenId}'`)
        const spur = await Spur.load(this.spurenId)
        this.vorgang = await Vorgang.load(spur.VorgangsId)
        this.taetigkeiten = await Taetigkeit.query(`SELECT Taetigkeiten.*, Aufgaben.Titel AS Aufgabentitel, Aufgaben.Id AS AufgabenId FROM Taetigkeiten JOIN Aufgabenstatuses ON Aufgabenstatuses.Id = Taetigkeiten.AufgabenstatusId JOIN Aufgaben ON Aufgaben.Id = Aufgabenstatuses.AufgabenId WHERE AufgabenstatusId IN (${this.aufgabenstatuses.map(aufgabenstatus => "'" + aufgabenstatus.Id + "'").join(',')})`)
    },
    methods: {
        aufgabenstatusFuerTaetigkeit(taetigkeit) {
            return this.aufgabenstatuses.find(aufgabenstatus => aufgabenstatus.Id === taetigkeit.AufgabenstatusId)
        },
        aufgabentitelFuerTaetigkeit(taetigkeit) {
            const aufgabenstatusFuerTaetigkeit = this.aufgabenstatusFuerTaetigkeit(taetigkeit)
            return this.spurenaufgabendefinitionen.find(spurenaufgabendefinition => spurenaufgabendefinition.id === aufgabenstatusFuerTaetigkeit.AufgabenId).titel
        },
        formatiereDatum: Hilfsfunktionen.formatiereDatum,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
        formatiereZeit: Hilfsfunktionen.formatiereZeit,
    },
    template: `
        <div v-if="taetigkeiten" class="panel spurentaetigkeiten">
            <div class="panel-header">
                <div class="panel-title">Tätigkeiten</div>
            </div>

            <table class="panel-table">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Beginn</th>
                        <th>Ende</th>
                        <th>Aufgabe</th>
                        <th>Tätigkeit</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="taetigkeit in sortierteTaetigkeiten">
                        <td class="topalign nobreak">{{ formatiereDatum(taetigkeit.Startzeit) }}</td>
                        <td class="topalign nobreak">{{ formatiereZeit(taetigkeit.Startzeit) }}</td>
                        <td class="topalign nobreak">{{ formatiereZeit(taetigkeit.Endzeit) }}</td>
                        <td class="topalign link nobreak"><a :href="'spurenaufgabe.html?' + vorgang.Id + '&' + spurenId + '&' + taetigkeit.AufgabenId">{{ taetigkeit.Aufgabentitel }}</a></td>
                        <td class="mark" v-html="formatiereMarkDown(taetigkeit.Text)"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
