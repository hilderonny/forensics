import Vorgang from '../../types/Vorgang.mjs'
import Vorgangstyp from '../../types/Vorgangstyp.mjs'

export default {
    data() {
        return {
            vorgangsnummer: undefined,
            typId: undefined,
            vorgangstypen: undefined,
            zeigeDialog: false,
        }
    },
    async created() {
        this.vorgangstypen = await Vorgangstyp.query('SELECT * FROM Vorgangstypen ORDER BY Name')
    },
    methods: {
        behandleNeuerVorgangButtonKlick() {
            this.vorgangsnummer = '430.000-2843-00000/00'
            this.typId = this.vorgangstypen[0].Id
            this.zeigeDialog = true
        },
        async behandleVorgangErstellenButtonKlick() {
            const neuerVorgang = new Vorgang()
            neuerVorgang.UserId = localStorage.getItem('userid')
            neuerVorgang.Status = this.vorgangsstatus.id
            neuerVorgang.VorgangstypenId = this.typId
            neuerVorgang.Vorgangsnummer = this.vorgangsnummer
            await neuerVorgang.save()
            location.href = 'vorgangsdetails.html?' + neuerVorgang.Id
        },
    },
    props: {
        vorgangsstatus: Object,
    },
    template: `
        <button class="button" @click="behandleNeuerVorgangButtonKlick">+ Neuer Vorgang</button>

        <div v-if="zeigeDialog" class="dialog-background">

            <div class="dialog">
            
                <button class="button dialog-close-button" @click="zeigeDialog = false">X</button>

                <div class="dialog-header">Vorgang erstellen</div>

                <div class="dialog-content">

                    <div>Bitte geben Sie die Vorgangsnummer und den Typ für den neuen Vorgang an.</div>

                    <div class="forminput">
                        <label>Vorgangsnummer <sup class="circle" title="Üblicherweise im Format 430.000-2843-00000/00">?</sup></label>
                        <input v-model="vorgangsnummer" />
                    </div>
                    
                    <div class="forminput" style="grid-column: 1; grid-row: 2">
                        <label>Typ <sup class="circle" title="Betimmt die Aufgaben, die für den Vorgang und dessen Spuren verfügbar sind">?</sup></label>
                        <select v-model="typId">
                            <option v-for="vorgangstyp in vorgangstypen" :value="vorgangstyp.Id">{{ vorgangstyp.Name }}</option>
                        </select>
                    </div>

                </div>

                <div class="dialog-footer">
                    <span></span>
                    <button class="button blue" @click="behandleVorgangErstellenButtonKlick">Vorgang erstellen</button>
                </div>

            </div>

        </div>
    `,
}