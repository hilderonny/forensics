import * as Hilfsfunktionen from '../hilfsfunktionen.mjs'
import Notiz from '../types/Notiz.mjs'

export default {
    data() {
        return {
            aktiveNotiz: undefined,
            aktiveNotizWurdeGeaendert: false,
            notizen: undefined,
        }
    },
    props: {
        spurenId: String,
        vorgangsId: String,
    },
    async created() {
        if (this.vorgangsId) {
            this.notizen = await Notiz.query(`SELECT * FROM Notizen WHERE VorgangsId = '${this.vorgangsId}' ORDER BY Datum DESC`)
        } else {
            this.notizen = await Notiz.query(`SELECT * FROM Notizen WHERE SpurenId = '${this.spurenId}' ORDER BY Datum DESC`)
        }
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        formatiereDatum: Hilfsfunktionen.formatiereDatum,
        formatiereDatumFuerInput: Hilfsfunktionen.formatiereDatumFuerInput,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
        async behandleLoeschenButtonKlick() {
            await this.aktiveNotiz.delete()
            this.notizen.splice(this.notizen.indexOf(this.aktiveNotiz), 1)
            this.behandleSchliessenButtonKlick()
        },
        async behandleNeueNotizButtonKlick() {
            this.aktiveNotiz = new Notiz({
                Datum: Date.now(),
                SpurenId: this.spurenId,
                Text: '',
                VorgangsId: this.vorgangsId,
            })
            await this.aktiveNotiz.save()
            this.notizen.push(this.aktiveNotiz)
        },
        behandleSchliessenButtonKlick() {
            this.aktiveNotiz = undefined
            this.aktiveNotizWurdeGeaendert = false
        },
        async behandleSpeichernButtonKlick() {
            await this.aktiveNotiz.save()
            this.behandleSchliessenButtonKlick()
        },
    },
    template: `
        <div class="panel notizen">
            <div class="panel-header">
                <div class="panel-title">Notizen</div>
                <div class="button-group">
                    <button class="button" @click="behandleNeueNotizButtonKlick">+ Neue Notiz</button>
                </div>
            </div>

            <table class="panel-table">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Notiz</th>
                        <th v-if="aktiveNotiz"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(notiz, index) in notizen">
                        <template v-if="notiz == aktiveNotiz">
                            <td class="nobreak topalign">
                                <input type="date" :value="formatiereDatumFuerInput(aktiveNotiz.Datum)" @change="event => { aktiveNotiz.datum = new Date(event.target.value).getTime(); aktiveNotizWurdeGeaendert = true; }" />
                            </td>
                            <td class="topalign">
                                <textarea v-model="aktiveNotiz.Text" @input="aktiveNotizWurdeGeaendert = true"></textarea>
                            </td>
                            <td>
                                <button class="button" :class="{ blue: aktiveNotizWurdeGeaendert }" @click="behandleSpeichernButtonKlick">Speichern</button>
                                <button class="button" @click="behandleSchliessenButtonKlick">Schließen</button>
                                <button class="button red" @click="behandleLoeschenButtonKlick">Löschen</button>
                            </td>
                        </template>
                        <template v-if="notiz != aktiveNotiz">
                            <td class="topalign link nobreak" @click="aktiveNotiz = notiz">{{ formatiereDatum(notiz.Datum) }}</td>
                            <td class="mark" @click="aktiveNotiz = notiz" v-html="formatiereMarkDown(notiz.Text)"></td>
                            <td v-if="aktiveNotiz"></td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
