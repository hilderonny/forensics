import Aufgabe from '../types/Aufgabe.mjs'
import Aufgabenstatus from '../types/Aufgabenstatus.mjs'
import Aufgabenstatuses from '../templates/Aufgabenstatuses.mjs'
import Geraetearten from '../templates/Geraetearten.mjs'
import Spur from '../types/Spur.mjs'

export default {
    computed: {
        sortierteSpuren: function() {
            return this.spuren?.sort((spur1, spur2) => {
                const spurnummer1fuerVergleich = spur1.Spurnummer?.replace(/\d+/g, match => match.padStart(4, '0').slice(-4))
                const spurnummer2fuerVergleich = spur2.Spurnummer?.replace(/\d+/g, match => match.padStart(4, '0').slice(-4))
                return spurnummer1fuerVergleich?.localeCompare(spurnummer2fuerVergleich)
            })
        },
        aufgabenFuerVorgangstyp: function() {
            return this.aufgaben.filter(aufgabe => aufgabe.VorgangstypenId === this.vorgang.Typ)
        },
    },
    data() {
        return {
            spuren: [],
            aufgaben: [],
            aufgabenstatuses: [],
        }
    },
    props: {
        vorgang: Object,
        zeigeNeueSpurButton: Boolean,
    },
    async created() {
        this.spuren = await Spur.query(`SELECT * FROM Spuren WHERE VorgangsId='${this.vorgang.Id}'`)
        this.aufgaben = await Aufgabe.query(`SELECT * FROM Aufgaben WHERE Typ='Spurenaufgabe' ORDER BY Reihenfolge`)
        this.aufgabenstatuses = await Aufgabenstatus.query(`SELECT Aufgabenstatuses.* FROM Aufgabenstatuses JOIN Spuren ON Spuren.Id = Aufgabenstatuses.SpurenId WHERE Spuren.VorgangsId = '${this.vorgang.Id}'`)
    },
    methods: {
        aufgabenstatusFuerAufgabe(spur, aufgabe) {
            return this.aufgabenstatuses.find(aufgabenstatus => aufgabenstatus.SpurenId === spur.Id && aufgabenstatus.AufgabenId === aufgabe.Id)
        },
        bezeichnungFuerGeraeteart(geraeteartId) {
            return Geraetearten.find(geraeteart => geraeteart.id === geraeteartId)?.bezeichnung || geraeteartId
        },
        async behandleNeueSpurButtonKlick() {
            const neueSpur = new Spur({
                VorgangsId: this.vorgang.Id
            })
            await neueSpur.save()
            location.href = `spurendetails.html?${this.vorgang.Id}&${neueSpur.Id}`
        },
        styleFuerAufgabe(spur, aufgabe) {
            let farbe = '#FAFAFA'
            const aufgabenstatus = this.aufgabenstatusFuerAufgabe(spur, aufgabe)
            if (aufgabenstatus) {
                const aufgabenstatusdefinition = Aufgabenstatuses.find(status => status.id === aufgabenstatus.Status)
                if (aufgabenstatusdefinition) {
                    farbe = aufgabenstatusdefinition.farbe
                }
            }
            return `background-color:${farbe};border-left-color:${farbe};`
        },
    },
    template: `
        <div class="panel spurenliste">
            <div class="panel-header">
                <div class="panel-title">Spuren</div>
                <div class="button-group">
                    <button v-if="zeigeNeueSpurButton" class="button" @click="behandleNeueSpurButtonKlick">+ Neue Spur</button>
                </div>
            </div>
            <table class="panel-table">
                <thead>
                    <tr>
                        <th colspan="2">Spur</th>
                        <th>Geräteart</th>
                        <th>HDD</th>
                        <th>GB</th>
                        <th v-for="aufgabe in aufgabenFuerVorgangstyp" :title="aufgabe.Titel">{{ aufgabe.Titel.substring(0, 2) }}</th>
                        <th title="Herausgegeben">He</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(spur, index) in sortierteSpuren" :class="{ specialnotes: spur.Besonderheiten }">
                        <td class="nobreak"><a :href="'spurendetails.html?' + vorgang.Id + '&' + spur.Id">{{ spur.Spurnummer || 'Unbenannt' }}</a></td>
                        <td>{{ spur.Spurname }}</td>
                        <td class="nobreak">{{ bezeichnungFuerGeraeteart(spur.Geraeteart) }}</td>
                        <td class="nobreak">{{ spur.Dasiplatte }}</td>
                        <td class="nobreak right">{{ spur.Datenumfang }}</td>
                        <td v-for="aufgabe in aufgabenFuerVorgangstyp" class="nobreak" :style="styleFuerAufgabe(spur, aufgabe)"></td>
                        <td class="nobreak">{{ spur.Herausgegeben ? '✓' : '' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
