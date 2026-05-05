import * as Hilfsfunktionen from '../hilfsfunktionen.mjs'

import Aufgabe from '../types/Aufgabe.mjs'
import Taetigkeit from '../types/Taetigkeit.mjs'

export default {
    data() {
        return {
            aufgaben: undefined,
            taetigkeiten: undefined,
        }
    },
    emits: [
        'aufgabeAngeklickt',
        'spurAngeklickt',
    ],
    async created() {
        this.aufgaben = await Aufgabe.query(`SELECT * FROM Aufgaben ORDER BY Reihenfolge`)
        this.taetigkeiten = await Taetigkeit.query(`SELECT Taetigkeiten.Text, Taetigkeiten.Startzeit, Taetigkeiten.Endzeit, Aufgabenstatuses.AufgabenId, Spuren.Spurnummer, Spuren.Id AS SpurenId, Aufgaben.Titel AS Aufgabentitel FROM Taetigkeiten JOIN Aufgabenstatuses ON Aufgabenstatuses.Id = Taetigkeiten.AufgabenstatusId JOIN Aufgaben ON Aufgaben.Id = Aufgabenstatuses.AufgabenId LEFT JOIN Spuren ON Spuren.Id = Aufgabenstatuses.SpurenId WHERE Aufgabenstatuses.VorgangsId = '${this.vorgang.Id}' ORDER BY Taetigkeiten.Startzeit DESC LIMIT ${this.anzahl}`)
    },
    methods: {
        formatiereDatum: Hilfsfunktionen.formatiereDatum,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
        formatiereZeit: Hilfsfunktionen.formatiereZeit,
    },
    props: {
        anzahl: Number,
        vorgang: Object,
    },
    template: `
        <div class="panel letzte-taetigkeiten">
            <div class="panel-header">
                <div class="panel-title">Letzte Tätigkeiten</div>
            </div>

            <table class="panel-table">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Beginn</th>
                        <th>Ende</th>
                        <th>Spur</th>
                        <th>Aufgabe</th>
                        <th>Tätigkeit</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(taetigkeit, index) in taetigkeiten">
                        <td class="topalign nobreak">{{ formatiereDatum(taetigkeit.Startzeit) }}</td>
                        <td class="topalign nobreak">{{ formatiereZeit(taetigkeit.Startzeit) }}</td>
                        <td class="topalign nobreak">{{ formatiereZeit(taetigkeit.Endzeit) }}</td>
                        <td class="topalign link nobreak" @click="$emit('spurAngeklickt', taetigkeit.SpurenId)">{{ taetigkeit.Spurnummer }}</td>
                        <td class="topalign link" @click="$emit('aufgabeAngeklickt', taetigkeit.SpurenId, taetigkeit.AufgabenId)">{{ taetigkeit.Aufgabentitel }}</td>
                        <td class="mark" v-html="formatiereMarkDown(taetigkeit.Text)"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
