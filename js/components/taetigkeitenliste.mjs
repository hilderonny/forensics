import * as Hilfsfunktionen from '../hilfsfunktionen.mjs'
import Taetigkeit from '../types/Taetigkeit.mjs'

export default {
    computed: {
        sortierteTaetigkeiten() {
            return this.taetigkeiten?.sort((taetigkeit1, taetigkeit2) => taetigkeit1.Startzeit - taetigkeit2.Startzeit)
        },
    },
    data() {
        return {
            aktiveTaetigkeit: undefined,
            aktiveTaetigkeitskopie: undefined,
            aktiveTaetigkeitWurdeGeaendert: false,
        }
    },
    props: {
        aufgabenstatus: Object,
        taetigkeiten: Array,
    },
    created() {
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        behandleDatumGeaendert(event) {
            const startZeitpunkt = new Date(this.aktiveTaetigkeitskopie.Startzeit)
            const neuesDatum = new Date(event.target.value)
            startZeitpunkt.setFullYear(neuesDatum.getFullYear())
            startZeitpunkt.setMonth(neuesDatum.getMonth())
            startZeitpunkt.setDate(neuesDatum.getDate())
            this.aktiveTaetigkeitskopie.Startzeit = startZeitpunkt.getTime()
            this.aktiveTaetigkeitWurdeGeaendert = true
        },
        behandleStartzeitGeaendert(event) {
            const startZeitpunkt = new Date(this.aktiveTaetigkeitskopie.Startzeit)
            const [stunden, minuten] = event.target.value.split(':').map(teil => parseInt(teil))
            startZeitpunkt.setHours(stunden)
            startZeitpunkt.setMinutes(minuten)
            this.aktiveTaetigkeitskopie.Startzeit = startZeitpunkt.getTime()
            this.aktiveTaetigkeitWurdeGeaendert = true
        },
        behandleEndzeitGeaendert(event) {
            const endZeitpunkt = new Date(this.aktiveTaetigkeitskopie.Startzeit) // Am selben Tag wie der Start
            const [stunden, minuten] = event.target.value.split(':').map(teil => parseInt(teil))
            endZeitpunkt.setHours(stunden)
            endZeitpunkt.setMinutes(minuten)
            this.aktiveTaetigkeitskopie.Endzeit = endZeitpunkt.getTime()
            this.aktiveTaetigkeitWurdeGeaendert = true
        },
        async behandleLoeschenButtonKlick() {
            if (!confirm('Soll die Tätigkeit wirklich gelöscht werden?')) return
            await this.aktiveTaetigkeit.delete()
            this.taetigkeiten.splice(this.taetigkeiten.indexOf(this.aktiveTaetigkeit), 1)
            this.aktiveTaetigkeit = undefined
            this.aktiveTaetigkeitskopie = undefined
            this.aktiveTaetigkeitWurdeGeaendert = false
        },
        async behandleNeueTaetigkeitButtonKlick() {
            const neueTaetigkeit = Object.assign(new Taetigkeit(), {
                AufgabenstatusId: this.aufgabenstatus.Id,
                Startzeit: Date.now(),
            })
            await neueTaetigkeit.save()
            this.taetigkeiten.push(neueTaetigkeit)
            this.selektiereTaetigkeit(neueTaetigkeit)
            this.aktiveTaetigkeitWurdeGeaendert = false
        },
        behandleSchliessenButtonKlick() {
            this.aktiveTaetigkeit = undefined
            this.aktiveTaetigkeitskopie = undefined
            this.aktiveTaetigkeitWurdeGeaendert = false
        },
        async behandleSpeichernButtonKlick() {
            this.aktiveTaetigkeit.Endzeit = this.aktiveTaetigkeitskopie.Endzeit
            this.aktiveTaetigkeit.Startzeit = this.aktiveTaetigkeitskopie.Startzeit
            this.aktiveTaetigkeit.Text = this.aktiveTaetigkeitskopie.Text
            await this.aktiveTaetigkeit.save()
            this.behandleSchliessenButtonKlick()
        },
        formatiereDatum: Hilfsfunktionen.formatiereDatum,
        formatiereDatumFuerInput: Hilfsfunktionen.formatiereDatumFuerInput,
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
        formatiereZeit: Hilfsfunktionen.formatiereZeit,
        formatiereZeitFuerInput: Hilfsfunktionen.formatiereZeitFuerInput,
        selektiereTaetigkeit(taetigkeit) {
            this.aktiveTaetigkeit = taetigkeit
            // Arbeitskopie, falls doch nicht gespeichert wird
            this.aktiveTaetigkeitskopie = JSON.parse(JSON.stringify(taetigkeit))
        },
    },
    template: `
        <div class="panel taetigkeiten">
            <div class="panel-header">
                <div class="panel-title">Tätigkeiten</div>
                <div class="button-group">
                    <button class="button" @click="behandleNeueTaetigkeitButtonKlick">+ Neue Tätigkeit</button>
                </div>
            </div>

            <table class="panel-table">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Beginn</th>
                        <th>Ende</th>
                        <th>Tätigkeit</th>
                        <th v-if="aktiveTaetigkeit"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(taetigkeit, index) in sortierteTaetigkeiten">
                        <template v-if="taetigkeit == aktiveTaetigkeit">
                            <td class="nobreak topalign">
                                <input type="date" :value="formatiereDatumFuerInput(aktiveTaetigkeitskopie.Startzeit)" @change="behandleDatumGeaendert" />
                            </td>
                            <td class="nobreak topalign">
                                <input type="time" :value="formatiereZeitFuerInput(aktiveTaetigkeitskopie.Startzeit)" @change="behandleStartzeitGeaendert" />
                            </td>
                            <td class="nobreak topalign">
                                <input type="time" :value="formatiereZeitFuerInput(aktiveTaetigkeitskopie.Endzeit)" @change="behandleEndzeitGeaendert" />
                            </td>
                            <td class="topalign half">
                                <textarea v-model="aktiveTaetigkeitskopie.Text" @input="aktiveTaetigkeitWurdeGeaendert = true"></textarea>
                            </td>
                            <td>
                                <button class="button" :class="{ blue: aktiveTaetigkeitWurdeGeaendert }" @click="behandleSpeichernButtonKlick">Speichern</button>
                                <button class="button" @click="behandleSchliessenButtonKlick">Schließen</button>
                                <button class="button red" @click="behandleLoeschenButtonKlick">Löschen</button>
                            </td>
                        </template>
                        <template v-if="taetigkeit != aktiveTaetigkeit">
                            <td class="topalign link nobreak" @click="selektiereTaetigkeit(taetigkeit)">{{ formatiereDatum(taetigkeit.Startzeit) }}</td>
                            <td class="topalign nobreak">{{ formatiereZeit(taetigkeit.Startzeit) }}</td>
                            <td class="topalign nobreak">{{ formatiereZeit(taetigkeit.Endzeit) }}</td>
                            <td class="mark" v-html="formatiereMarkDown(taetigkeit.Text)"></td>
                            <td v-if="aktiveTaetigkeit"></td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
