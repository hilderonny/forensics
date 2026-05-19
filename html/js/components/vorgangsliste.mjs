import * as Hilfsfunktionen from '../hilfsfunktionen.mjs'
import VorgangErstellenDialog from './Dialoge/VorgangErstellenDialog.mjs'

export default {
    components: {
        VorgangErstellenDialog,
    },
    computed: {
        sortierteVorgaenge: function() {
            return this.vorgaenge.sort((vorgang1, vorgang2) => vorgang2.Vorgangsnummer.localeCompare(vorgang1.Vorgangsnummer))
        }
    },
    methods: {
        formatiereDatum: Hilfsfunktionen.formatiereDatum,
        prioritaetsbezeichnung: Hilfsfunktionen.prioritaetsbezeichnung,
        prioritaetsfarbe: Hilfsfunktionen.prioritaetsfarbe,
    },
    props: {
        vorgangsstatus: Object,
        vorgaenge: Array,
        zeigeBenutzer: Boolean,
    },
    template: `
        <div class="panel vorgangsliste">
            <div class="panel-header">
                <div class="panel-title">{{ vorgangsstatus.bezeichnung }}</div>
                <div class="button-group">
                    <vorgang-erstellen-dialog :vorgangsstatus="vorgangsstatus"></vorgang-erstellen-dialog>
                </div>
            </div>
            <table class="panel-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Vorgangsnummer</th>
                        <th>Priorität</th>
                        <th v-if="zeigeBenutzer">Sachbearbeiter</th>
                        <th>Aktenzeichen</th>
                        <th>Auftragsdatum</th>
                        <th>Ansprechpartner</th>
                        <th>Beschreibung</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(vorgang, index) in sortierteVorgaenge">
                        <td class="index nobreak">{{ index + 1 }}</td>
                        <td class="nobreak"><a :href="'vorgangsdetails.html?' + vorgang.Id">{{ vorgang.Vorgangsnummer || '_' }}</a></td>
                        <td class="nobreak" :style="'background-color:' + prioritaetsfarbe(vorgang.Prioritaet)">{{ prioritaetsbezeichnung(vorgang.Prioritaet) }}</td>
                        <td class="nobreak" v-if="zeigeBenutzer">{{ vorgang.Sachbearbeiter }}</td>
                        <td class="nobreak">{{ vorgang.Aktenzeichen }}</td>
                        <td class="nobreak">{{ formatiereDatum(vorgang.Auftragsdatum) }}</td>
                        <td class="nobreak">{{ vorgang.Ansprechpartner }}</td>
                        <td>{{ vorgang.Beschreibung }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
