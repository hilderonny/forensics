import * as Hilfsfunktionen from '../hilfsfunktionen.mjs'
import Spur from '../types/Spur.mjs'
import Spurenfrage from '../types/Spurenfrage.mjs'
import Vorgangsfrage from '../types/Vorgangsfrage.mjs'

export default {
    computed: {
        sortierteVorgangsfragen() {
            return this.vorgangsfragen.sort((vorgangsfrage1, vorgangsfrage2) => parseInt(vorgangsfrage1.Nummer) - parseInt(vorgangsfrage2.Nummer))
        }
    },
    data() {
        return {
            aktiveVorgangsfrage: undefined,
            aktiveVorgangsfragenkopie: undefined,
            aktiveVorgangsfrageWurdeGeaendert: false,
            spuren: undefined,
            spurenfragen: undefined,
            vorgangsfragen: undefined,
        }
    },
    async created() {
        this.spuren = await Spur.query(`SELECT * FROM Spuren WHERE VorgangsId = '${this.vorgangsId}'`)
        this.vorgangsfragen = await Vorgangsfrage.query(`SELECT * FROM Vorgangsfragen WHERE VorgangsId = '${this.vorgangsId}'`)
        this.spurenfragen = await Spurenfrage.query(`SELECT Spurenfragen.* FROM Spurenfragen LEFT JOIN Spuren on Spuren.Id = Spurenfragen.SpurenId WHERE VorgangsfragenId IN (SELECT Id FROM Vorgangsfragen WHERE VorgangsId = '${this.vorgangsId}')`)
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        async aendereVorgangsfragenSpurenzuordnung(vorgangsfrage, spur, istZugeordnet) {
            if (istZugeordnet) {
                const neueSpurenfrage = new Spurenfrage({
                    SpurenId: spur.Id,
                    VorgangsfragenId: vorgangsfrage.Id,
                })
                await neueSpurenfrage.save()
                this.spurenfragen.push(neueSpurenfrage)
            } else {
                const spurenfrage = this.spurenfragen.find(spurenfrage => spurenfrage.SpurenId === spur.Id && spurenfrage.VorgangsfragenId === vorgangsfrage.Id)
                await spurenfrage.delete()
                this.spurenfragen.splice(this.spurenfragen.indexOf(spurenfrage), 1)
            }
        },
        async behandleLoeschenButtonKlick() {
            if (!confirm('Frage wirklich löschen?')) return
            await this.aktiveVorgangsfrage.delete()
            this.vorgangsfragen.splice(this.vorgangsfragen.indexOf(this.aktiveVorgangsfrage), 1)
            this.spurenfragen = this.spurenfragen.filter(spurenfrage => spurenfrage.VorgangsfragenId !== this.aktiveVorgangsfrage.Id)
            this.aktiveVorgangsfrage = undefined
        },
        async behandleNeueFrageButtonKlick() {
            this.aktiveVorgangsfrage = new Vorgangsfrage({
                Nummer: this.vorgangsfragen.length + 1
            })
            await this.aktiveVorgangsfrage.save()
            this.vorgangsfragen.push(this.aktiveVorgangsfrage)
        },
        behandleSchliessenButtonKlick() {
            this.aktiveVorgangsfrage = undefined
            this.aktiveVorgangsfragenkopie = undefined
            this.aktiveVorgangsfrageWurdeGeaendert = false
        },
        async behandleSpeichernButtonKlick() {
            this.aktiveVorgangsfrage.Antwort = this.aktiveVorgangsfragenkopie.Antwort
            this.aktiveVorgangsfrage.Frage = this.aktiveVorgangsfragenkopie.Frage
            this.aktiveVorgangsfrage.Nummer = this.aktiveVorgangsfragenkopie.Nummer
            await this.aktiveVorgangsfrage.save()
            this.behandleSchliessenButtonKlick()
        },
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
        selektiereVorgangsfrage(vorgangsfrage) {
            this.aktiveVorgangsfrage = vorgangsfrage
            this.aktiveVorgangsfragenkopie = JSON.parse(JSON.stringify(this.aktiveVorgangsfrage))
        },
        spurenfragenFuerVorgangsfrage(vorgangsfrage) {
            return this.spurenfragen.filter(spurenfrage => spurenfrage.VorgangsfragenId === vorgangsfrage.Id)
        },
        spurennummernFuerVorgangsfrage(vorgangsfrage) {
            const relevanteSpurenfragen = this.spurenfragenFuerVorgangsfrage(vorgangsfrage)
            return relevanteSpurenfragen.map(spurenfrage => this.spuren.find(spur => spur.Id === spurenfrage.SpurenId).Spurnummer).join(', ')
        },
    },
    props: {
        vorgangsId: String,
    },
    template: `
        <div v-if="spuren && spurenfragen && vorgangsfragen" class="panel fragen">
            <div class="panel-header">
                <div class="panel-title">Fragen</div>
                <div class="button-group">
                    <button class="button" @click="behandleNeueFrageButtonKlick">+ Neue Frage</button>
                </div>
            </div>

            <table class="panel-table">
                <thead>
                    <tr>
                        <th>Nummer</th>
                        <th>Frage</th>
                        <th>Antwort</th>
                        <th>Spuren</th>
                        <th v-if="aktiveVorgangsfrage"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(vorgangsfrage, index) in sortierteVorgangsfragen">
                        <template v-if="vorgangsfrage == aktiveVorgangsfrage">
                            <td class="nobreak topalign">
                                <input type="number" v-model.lazy="aktiveVorgangsfragenkopie.Nummer" @input="aktiveVorgangsfrageWurdeGeaendert = true" />
                            </td>
                            <td class="topalign half">
                                <textarea v-model="aktiveVorgangsfragenkopie.Frage" @input="aktiveVorgangsfrageWurdeGeaendert = true"></textarea>
                            </td>
                            <td class="topalign half">
                                <textarea v-model="aktiveVorgangsfragenkopie.Antwort" @input="aktiveVorgangsfrageWurdeGeaendert = true"></textarea>
                            </td>
                            <td class="topalign half">
                                <div v-for="spur in spuren">
                                    <input :id="'fragezuspur' + vorgangsfrage.Id + spur.Id" type="checkbox" :checked="spurenfragen.find(spurenfrage => spurenfrage.SpurenId === spur.Id && spurenfrage.VorgangsfragenId === vorgangsfrage.Id)" @change="event => aendereVorgangsfragenSpurenzuordnung(vorgangsfrage, spur, event.target.checked)" />
                                    <label :for="'fragezuspur' + vorgangsfrage.Id + spur.Id">{{ spur.Spurnummer }}</label>
                                </div>
                            </td>
                            <td>
                                <button class="button" :class="{ blue: aktiveVorgangsfrageWurdeGeaendert }" @click="behandleSpeichernButtonKlick">Speichern</button>
                                <button class="button" @click="behandleSchliessenButtonKlick">Schließen</button>
                                <button class="button red" @click="behandleLoeschenButtonKlick">Löschen</button>
                            </td>
                        </template>
                        <template v-if="vorgangsfrage != aktiveVorgangsfrage">
                            <td class="topalign link nobreak" @click="selektiereVorgangsfrage(vorgangsfrage)">{{ vorgangsfrage.Nummer || '_' }}</td>
                            <td class="mark" v-html="formatiereMarkDown(vorgangsfrage.Frage)"></td>
                            <td class="mark" v-html="formatiereMarkDown(vorgangsfrage.Antwort)"></td>
                            <td class="topalign">{{ spurennummernFuerVorgangsfrage(vorgangsfrage) }}</td>
                            <td v-if="aktiveVorgangsfrage"></td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
