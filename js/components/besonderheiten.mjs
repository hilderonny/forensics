import * as Arrange from '/arrange/js/arrange.mjs'
import * as Hilfsfunktionen from '../hilfsfunktionen.mjs'

export default {
    computed: {
        gefilterteUndSortierteSpuren() {
            return this.spuren.filter(spur => spur.Besonderheiten?.length > 0).sort((spur1, spur2) => {
                const spurnummer1fuerVergleich = spur1.Spurnummer.replace(/\d+/g, match => match.padStart(4, '0').slice(-4))
                const spurnummer2fuerVergleich = spur2.Spurnummer.replace(/\d+/g, match => match.padStart(4, '0').slice(-4))
                return spurnummer1fuerVergleich.localeCompare(spurnummer2fuerVergleich)
            })
        },
    },
    data() {
        return {
            spuren: [],
        }
    },
    async created() {
        this.spuren = await Arrange.queryDatabase('Forensics', `SELECT Id, Spurnummer, Besonderheiten FROM Spuren WHERE VorgangsId='${this.vorgangsId}'`)
    },
    emits: [
        'spurAngeklickt'
    ],
    methods: {
        formatiereMarkDown: Hilfsfunktionen.formatiereMarkDown,
    },
    props: {
        vorgangsId: Array,
    },
    template: `
        <div class="panel besonderheiten">
            <div class="panel-header">
                <div class="panel-title">Besonderheiten</div>
            </div>

            <table class="panel-table">
                <thead>
                    <tr>
                        <th>Spur</th>
                        <th>Besonderheit</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(spur, index) in gefilterteUndSortierteSpuren">
                        <td class="topalign link nobreak" @click="$emit('spurAngeklickt', spur)">{{ spur.Spurnummer }}</td>
                        <td class="mark" v-html="formatiereMarkDown(spur.Besonderheiten)"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
}
