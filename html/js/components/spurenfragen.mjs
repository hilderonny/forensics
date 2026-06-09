import * as Hilfsfunktionen from '../hilfsfunktionen.mjs'
import Spurenfrage from '../types/Spurenfrage.mjs'

export default {
    data() {
        return {
            fragen: undefined,
        }
    },
    props: {
        spurenId: String,
    },
    async created() {
        this.fragen = await Spurenfrage.query(`SELECT * FROM Spurenfragen JOIN Vorgangsfragen ON Vorgangsfragen.Id = Spurenfragen.VorgangsfragenId WHERE SpurenId = '${this.spurenId}' ORDER BY CAST(Vorgangsfragen.Nummer AS INTEGER) ASC`)
    },
    methods: {
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
    },
    template: `
        <div v-if="fragen" class="panel spurenfragen">
            <div class="panel-header">
                <div class="panel-title">Relevante Fragen</div>
            </div>

            <table class="panel-table">
                <thead>
                    <tr>
                        <th>Nummer</th>
                        <th>Frage</th>
                        <th>Antwort</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="frage in fragen">
                        <td>{{ frage.Nummer }}</td>
                        <td class="mark" v-html="formatiereMarkDown(frage.Frage)"></td>
                        <td class="mark" v-html="formatiereMarkDown(frage.Antwort)"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
