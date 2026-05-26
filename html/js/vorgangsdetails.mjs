import * as Hilfsfunktionen from './hilfsfunktionen.mjs'
import * as PdfJs from './pdf.js'
import Aufgabenleiste from './components/aufgabenleiste.mjs'
import Aufgabenstatus from './types/Aufgabenstatus.mjs'
import Besonderheiten from './components/besonderheiten.mjs'
import Geraetearten from './templates/Geraetearten.mjs'
import LetzteTaetigkeiten from './components/letzte-taetigkeiten.mjs'
import Notizenliste from './components/notizenliste.mjs'
import Spur from './types/Spur.mjs'
import Spurenfrage from './types/Spurenfrage.mjs'
import Spurenliste from './components/spurenliste.mjs'
import Titelzeile from './components/titelzeile.mjs'
import Vorgang from './types/Vorgang.mjs'
import Vorgangsfrage from './types/Vorgangsfrage.mjs'
import Vorgangsfragen from './components/vorgangsfragen.mjs'
import Vorgangsprioritaeten from './templates/Vorgangsprioritaeten.mjs'
import Vorgangsstatuses from './templates/Vorgangsstatuses.mjs'
import Vorgangstyp from './types/Vorgangstyp.mjs'

PdfJs.GlobalWorkerOptions.workerSrc = './pdf.worker.js'

const vueApp = {
    components: {
        Aufgabenleiste,
        Besonderheiten,
        LetzteTaetigkeiten,
        Notizenliste,
        Spurenliste,
        Titelzeile,
        Vorgangsfragen,
    },
    data() {
        return {
            aenderungVorhanden: false,
            aufgabenstatuses: undefined,
            geraetearten: Geraetearten,
            spuren: undefined,
            vorgang: undefined,
            vorgangsId: location.search.substring(1),
            vorgangsfragen: undefined,
            vorgangsprioritaeten: Vorgangsprioritaeten,
            vorgangsstatuses: Vorgangsstatuses,
            vorgangstypen: undefined,
        }
    },
    async created() {
        this.vorgang = await Vorgang.load(this.vorgangsId)
        document.title = this.vorgang.Vorgangsnummer
        this.aufgabenstatuses = await Aufgabenstatus.query(`SELECT * FROM Aufgabenstatuses WHERE VorgangsId = '${this.vorgangsId}'`)
        this.vorgangstypen = await Vorgangstyp.query(`SELECT * FROM Vorgangstypen ORDER BY Name`)
        Hilfsfunktionen.lauscheAufStrgS(this.behandleSpeichernButtonKlick)
    },
    methods: {
        behandleAufgabeInTaetigkeitslisteAngeklickt(spurenId, aufgabenId) {
            if (spurenId) {
                location.href = `spurenaufgabe.html?${this.vorgangsId}&${spurenId}&${aufgabenId}`
            } else {
                location.href = `vorgangsaufgabe.html?${this.vorgangsId}&${aufgabenId}`
            }
        },
        async behandleKtuImportDateiSelektiert(event) {
            const dringlichkeiten = {
                'Haftsache': '2',
                'eilt': '3',
                'normal': '4',
            }
            const file = event.target.files[0]
            const buffer = await file.arrayBuffer()
            const pdf = await PdfJs.getDocument({ data: buffer }).promise
            const geparstesPdf = await Hilfsfunktionen.parseKtuPdf(pdf)
            this.vorgang.Auftraggeber = geparstesPdf['Dienststelle']
            this.vorgang.Aktenzeichen = geparstesPdf['Aktenzeichen']
            this.vorgang.Ansprechpartner = geparstesPdf['Sachbearbeitung durch (Name, Amtsbezeichnung)']
            this.vorgang.Auftragsnummer = geparstesPdf['Auftragsnummer']
            this.vorgang.Straftaten = geparstesPdf['Straftaten']
            this.vorgang.Prioritaet = dringlichkeiten[geparstesPdf['Dringlichkeit']]
            if (geparstesPdf['Datum']) {
                const [tag, monat, jahr] = geparstesPdf['Datum'].split('.')
                this.vorgang.Auftragsdatum = new Date(`${jahr}-${monat}-${tag}`).getTime()
            }
            if (geparstesPdf['Spuren']) {
                for (const geparsteSpur of geparstesPdf['Spuren']) {
                    const neueSpur = new Spur()
                    neueSpur.Spurnummer = geparsteSpur.spurnummer
                    neueSpur.Spurname = geparsteSpur.spurname
                    neueSpur.VorgangsId = this.vorgangsId
                    await neueSpur.save()
                    this.spuren.push(neueSpur)
                }
            }
            if (geparstesPdf['Fragen']) {
                for (const [index, geparsteFrage] of geparstesPdf['Fragen'].entries()) {
                    const neueVorgangsfrage = new Vorgangsfrage()
                    neueVorgangsfrage.Nummer = index + 1
                    neueVorgangsfrage.Frage = geparsteFrage.frage
                    neueVorgangsfrage.VorgangsId = this.vorgangsId
                    await neueVorgangsfrage.save()
                    this.vorgangsfragen.push(neueVorgangsfrage)
                    for (const spurnummer of geparsteFrage.spuren) {
                        const passendeSpur = this.spuren.find(spur => spur.Spurnummer === spurnummer)
                        if (passendeSpur) {
                            const neueSpurenfrage = new Spurenfrage()
                            neueSpurenfrage.SpurenId = passendeSpur.Id
                            neueSpurenfrage.VorgangsfragenId = neueVorgangsfrage.Id
                            neueSpurenfrage.save()
                            this.spurenfragen.push(neueSpurenfrage)
                        }
                    }
                }
            }
            this.aenderungVorhanden = true
        },
        async behandleLoeschenButtonKlick() {
            if (!confirm('Vorgang wirklich löschen?')) return
            await this.vorgang.delete()
            location.href = 'index.html'
        },
        async behandleSpeichernButtonKlick() {
            await this.vorgang.save()
            this.aenderungVorhanden = false
        },
        async behandleTypGeaendert() {
            await this.ladeVorgangsaufgabendefinitionen()
            this.aenderungVorhanden = true
        },
        behandleSpurAngeklickt(spur) {
            if (!spur) return
            location.href = `spurendetails.html?${this.vorgangsId}&${spur.Id}`
        },
        async erstelleNeueSpur() {
            const neueSpur = Hilfsfunktionen.bereiteNeueSpurVor()
            this.vorgang.spuren.push(neueSpur)
            await this.speichereVorgang()
            location.href = `spurendetails.html?${this.vorgangsId}&${neueSpur.id}`
        },
        formatiereDatumFuerInput: Hilfsfunktionen.formatiereDatumFuerInput,
        prioritaetsbezeichnung: Hilfsfunktionen.prioritaetsbezeichnung,
        prioritaetsfarbe: Hilfsfunktionen.prioritaetsfarbe,
    }
}

Vue.createApp(vueApp).mount('body')