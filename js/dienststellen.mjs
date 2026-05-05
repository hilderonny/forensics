import * as Arrange from '/arrange/js/arrange.mjs'
import * as Hilfsfunktionen from './hilfsfunktionen.mjs'

import Aufgabe from './types/Aufgabe.mjs'
import Dienststelle from './types/Dienststelle.mjs'
import EinstellungenToolbar from './components/einstellungen-toolbar.mjs'
import Titelzeile from './components/titelzeile.mjs'

const vueApp = {
    components: {
        EinstellungenToolbar,
        Titelzeile,
    },
    computed: {
        kabBarcodeBild() {
            return this.neuerKABBarcode ? URL.createObjectURL(this.neuerKABBarcode) : this.selektierteDienststelle.KAB_Barcode
        },
        kabLogoBild() {
            return this.neuesKABLogo ? URL.createObjectURL(this.neuesKABLogo) : this.selektierteDienststelle.KAB_Logo
        },
        logoBild() {
            return this.neuesLogo ? URL.createObjectURL(this.neuesLogo) : this.selektierteDienststelle.Logo
        },
        sortierteDienststellen() {
            return this.dienststellen.sort((dienststelle1, dienststelle2) => dienststelle1.Name?.localeCompare(dienststelle2.Name))
        },
    },
    data() {
        return {
            aenderungVorhanden: false,
            neuerKABBarcode: undefined,
            neuesKABLogo: undefined,
            neuesLogo: undefined,
            selektierteDienststelle: undefined,
            dienststellen: undefined,
        }
    },
    async created() {
        this.dienststellen = await Dienststelle.query('SELECT * FROM Dienststellen')
        const selektierteDienststellenId = location.search.substring(1)
        if (selektierteDienststellenId) {
            this.selektierteDienststelle = this.dienststellen.find(dienststelle => dienststelle.Id === selektierteDienststellenId)
        }
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        abmelden() {
            Arrange.logout()
        },
        async behandleLoeschenButtonKlick() {
            // TODO: Prüfen, ob löschbar oder in Verwendung
            if (!confirm('Dienststelle wirklich löschen?')) return
            await this.selektierteDienststelle.delete()
            this.dienststellen.splice(this.dienststellen.indexOf(this.selektierteDienststelle), 1)
            this.selektierteDienststelle = undefined
        },
        async behandleKABBarcodeInputSelektiert(event) {
            this.neuerKABBarcode = event.target.files[0]
            this.aenderungVorhanden = true
        },
        async behandleKABLogoInputSelektiert(event) {
            this.neuesKABLogo = event.target.files[0]
            this.aenderungVorhanden = true
        },
        async behandleLogoInputSelektiert(event) {
            this.neuesLogo = event.target.files[0]
            this.aenderungVorhanden = true
        },
        async behandleNeueDienststelleButtonKlick() {
            this.selektierteDienststelle = new Dienststelle()
            await this.selektierteDienststelle.save()
            this.dienststellen.push(this.selektierteDienststelle)
        },
        async behandleSpeichernButtonKlick() {
            if (this.neuerKABBarcode) {
                await Arrange.uploadPublicBinaryFile(`/forensics/${this.selektierteDienststelle.Id}/${this.neuerKABBarcode.name}`, this.neuerKABBarcode)
                this.selektierteDienststelle.KAB_Barcode = `/api/files/public/forensics/${this.selektierteDienststelle.Id}/${this.neuerKABBarcode.name}`
            }
            if (this.neuesKABLogo) {
                await Arrange.uploadPublicBinaryFile(`/forensics/${this.selektierteDienststelle.Id}/${this.neuesKABLogo.name}`, this.neuesKABLogo)
                this.selektierteDienststelle.KAB_Logo = `/api/files/public/forensics/${this.selektierteDienststelle.Id}/${this.neuesKABLogo.name}`
            }
            if (this.neuesLogo) {
                await Arrange.uploadPublicBinaryFile(`/forensics/${this.selektierteDienststelle.Id}/${this.neuesLogo.name}`, this.neuesLogo)
                this.selektierteDienststelle.Logo = `/api/files/public/forensics/${this.selektierteDienststelle.Id}/${this.neuesLogo.name}`
            }
            await this.selektierteDienststelle.save()
            this.aenderungVorhanden = false
        },
    }
}

Vue.createApp(vueApp).mount('body')