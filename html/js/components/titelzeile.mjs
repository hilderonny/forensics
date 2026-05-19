import * as Arrange from '/arrange/js/arrange.mjs'
import Dienststelle from '../types/Dienststelle.mjs'

export default {
    data() {
        return {
            dienststelle: undefined,
        }
    },
    async created() {
        this.dienststelle = (await Dienststelle.query(`SELECT Dienststellen.* FROM Benutzer JOIN Dienststellen ON Dienststellen.Id = Benutzer.DienststellenId WHERE Benutzer.Id = '${localStorage.getItem('userid')}'`))[0]
    },
    methods: {
        abmelden() {
            Arrange.logout()
        },
    },
    props: {
        fuerEinstellungen: Boolean,
    },
    template: `
        <div class="app-titlebar">
            <div class="app-logo" :style="{'background-image': dienststelle ? 'url(' + dienststelle.Logo + ')' : 'none'}"></div>
            <div class="button-group">
                <a v-if="fuerEinstellungen" class="button" href="index.html">Vorgangsübersicht</a>
                <a v-if="!fuerEinstellungen" class="button" href="persoenlicheEinstellungen.html">Einstellungen</a>
                <button class="button" @click="abmelden">Abmelden</button>
            </div>
        </div>
    `,
}
