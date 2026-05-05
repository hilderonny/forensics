import * as Arrange from '/arrange/js/arrange.mjs'
import { marked } from "./marked.esm.js"
import Vorgangsprioritaeten from './templates/Vorgangsprioritaeten.mjs'

const AUFGABENSTATUSES_PFAD = '/forensics/config/aufgabenstatuses.json'
const BENUTZERINFORMATIONEN_PFAD = '/forensics/benutzerinformationen.json'
const GERAETEARTEN_PFAD = '/forensics/config/geraetearten.json'
const SPURENAUFGABEN_PFAD = '/forensics/config/spurenaufgaben.json'
const VORGANGSAUFGABEN_PFAD = '/forensics/config/vorgangsaufgaben.json'
const VORGANGSTYPEN_PFAD = '/forensics/config/vorgangstypen.json'
const VORGANGSUEBERSICHT_PFAD = '/forensics/vorgangsuebersicht.json'

/********** Interne Hilfsfunktionen **********/

function berichtDateiname(vorgang, benutzer, berichtsart) {
    const vorgangsnummer = verzeichnisnameFuerVorgang(vorgang)
    const benutzername = verzeichnisnameFuerText(benutzer.Name)
    const datum = formatiereDatumUndZeitFuerBerichtsdateiname(Date.now())
    return `${vorgangsnummer}_${verzeichnisnameFuerText(berichtsart)}_${benutzername}_${datum}.pdf`
}

function ipedBatchDateiInhaltFuerVorgang(spuren) {
    if (!spuren) return
    const zeilen = [
        '.\\iped-4.2.0\\iped.exe --portable^',
        ` -profile Zusammenfassung^`,
    ]
    for (const spur of spuren) {
        const spurdateiname = verzeichnisnameFuerText(spur.Spurnummer + '_' + spur.Spurname)
        zeilen.push(` -data    ..\\..\\DaSi\\${spurdateiname}\\${spurdateiname}.E01^`)
    }
    zeilen.push(' -output  ..\\..\\Auswertung\\IPED\\Zusammenfassung^')
    zeilen.push(' -log     ..\\..\\Auswertung\\IPED\\Zusammenfassung.log')
    return zeilen.join('\n')
}

function ipedBatchDateiInhaltFuerSpur(spur) {
    const profildateiname = verzeichnisnameFuerText(spur.Spurnummer)
    const spurdateiname = verzeichnisnameFuerText(spur.Spurnummer + '_' + spur.Spurname)
    const zeilen = [
        '.\\iped-4.2.0\\iped.exe --portable^',
        ` -profile ${profildateiname}^`,
        ` -data    ..\\..\\DaSi\\${spurdateiname}\\${spurdateiname}.E01^`,
        ` -output  ..\\..\\Auswertung\\IPED\\${profildateiname}^`,
        ` -log     ..\\..\\Auswertung\\IPED\\${profildateiname}.log`,
    ]
    return zeilen.join('\n')
}

async function ladeJsonArrayAusDatei(pfad) {
    const response = await Arrange.getPublicFile(pfad)
    return response.ok ? await response.json() : undefined
}

async function ladeJsonArrayAusDateiOderErstelleEs(pfad, standardwert) {
    const response = await Arrange.getPublicFile(pfad)
    if (response.ok) {
        return await response.json()
    } else {
        await Arrange.postPublicTextFile(pfad, JSON.stringify(standardwert))
        return standardwert
    }
}

function mkdirBefehlFuerSpurenbilderverzeichnisse(spuren) {
    if (!spuren) return
    const spurenverzeichnisse = spuren.map(spur => verzeichnisnameFuerText(spur.Spurnummer))
    return `$dirs = ${spurenverzeichnisse.map(spurverzeichnisname => '"' + spurverzeichnisname + '"').join(',')}; $dirs | ForEach-Object { New-Item -ItemType Directory -Name $_ }`
}

/********** Öffentliche Funktionen **********/

function bereiteNeueFrageVor() {
    return {
        antwort: '',
        frage: '',
        nummer: 1,
        spuren: [],
    }
}

function bereiteNeueSpurVor() {
    return {
        aufgaben: [],
        besonderheiten: '',
        dasiplatte: '',
        datenumfang: 0,
        geraeteart: undefined,
        geraetebezeichnung: '',
        herausgegeben: false,
        id: Date.now().toString(),
        notizen: [],
        seriennummer: '',
        spurname: '',
        spurnummer: '',
    }
}

function ersetzePlatzhalter(text, vorgang, vorgangsspuren, spur, benutzer) {
    let ersetzterText = `${text || ''}` // Kopie erstellen
    if (vorgang) {
        ersetzterText = ersetzterText.replaceAll('##CASE_DATASIZE##', vorgang.Datenumfang)
        ersetzterText = ersetzterText.replaceAll('##CASE_DIRNAME##', verzeichnisnameFuerVorgang(vorgang))
        ersetzterText = ersetzterText.replaceAll('##CASE_ID##', verzeichnisnameFuerText(vorgang.Vorgangsnummer))
        ersetzterText = ersetzterText.replaceAll('##CASE_NUMBER##', vorgang.Vorgangsnummer)
        ersetzterText = ersetzterText.replaceAll('##CASE_REFERENCEDIRNAME##', verzeichnisnameFuerText(vorgang.Aktenzeichen))
        ersetzterText = ersetzterText.replaceAll('##IPED_BATCH_FILE_CONTENT##', ipedBatchDateiInhaltFuerVorgang(vorgangsspuren))
        ersetzterText = ersetzterText.replaceAll('##MD_IMAGE_DIR##', mkdirBefehlFuerSpurenbilderverzeichnisse(vorgangsspuren))
        ersetzterText = ersetzterText.replaceAll('##VORGANG_AUFTRAGSDATUM##', formatiereDatum(vorgang.Auftragsdatum))
    }
    if (spur) {
        ersetzterText = ersetzterText.replaceAll('##EVIDENCE_FILENAME##', verzeichnisnameFuerSpur(spur))
        ersetzterText = ersetzterText.replaceAll('##EVIDENCE_NAME##', spur.Spurname)
        ersetzterText = ersetzterText.replaceAll('##EVIDENCE_NUMBER##', spur.Spurnummer)
        ersetzterText = ersetzterText.replaceAll('##EVIDENCE_SHORTFILENAME##', verzeichnisnameFuerText(spur.Spurnummer))
        ersetzterText = ersetzterText.replaceAll('##IPED_EVIDENCE_BATCH_FILE_CONTENT##', ipedBatchDateiInhaltFuerSpur(spur))
    }
    if(benutzer) {
        ersetzterText = ersetzterText.replaceAll('##USER_NAME##', benutzer.Name)
    }
    if (vorgang && benutzer) {
        ersetzterText = ersetzterText.replaceAll('##ACTIVITYLOG_FILENAME##', dateinameFuerTaetigkeitsprotokoll(vorgang, benutzer))
        ersetzterText = ersetzterText.replaceAll('##RESULTS_FILENAME##', dateinameFuerErgebnismitteilung(vorgang, benutzer))
        ersetzterText = ersetzterText.replaceAll('##TIMERECORDINGS_FILENAME##', dateinameFuerZeitnachweis(vorgang, benutzer))
    }
    ersetzterText = ersetzterText.replace(/##BEGINSECTION## (.*?)\n/g, `<details><summary>$1</summary><div>\n`)
    ersetzterText = ersetzterText.replaceAll('##ENDSECTION##', '</div></details>')
    return ersetzterText
}

function dateinameFuerErgebnismitteilung(vorgang, benutzer) {
    return berichtDateiname(vorgang, benutzer, 'Kriminaltechnischer_Auswertungsbericht')
}

function dateinameFuerTaetigkeitsprotokoll(vorgang, benutzer) {
    return berichtDateiname(vorgang, benutzer, 'Taetigkeitsprotokoll')
}

function dateinameFuerZeitnachweis(vorgang, benutzer) {
    return berichtDateiname(vorgang, benutzer, 'Zeitnachweis')
}

function formatiereDatum(datumAlsZeitstempel) {
    if (!datumAlsZeitstempel) return ''
    const datum = new Date(datumAlsZeitstempel)
    const jahr = datum.getFullYear()
    const monat = ('0' + (datum.getMonth() + 1)).slice(-2)
    const tag = ('0' + datum.getDate()).slice(-2)
    return `${tag}.${monat}.${jahr}`
}

function formatiereDatumFuerInput(datumAlsZeitstempel) {
    if (!datumAlsZeitstempel) return ''
    const datum = new Date(datumAlsZeitstempel)
    const jahr = datum.getFullYear()
    const monat = ('0' + (datum.getMonth() + 1)).slice(-2)
    const tag = ('0' + datum.getDate()).slice(-2)
    return `${jahr}-${monat}-${tag}`
}

function formatiereDatumUndZeitFuerBerichtsdateiname(datumAlsZeitstempel) {
    if (!datumAlsZeitstempel) return ''
    const datum = new Date(datumAlsZeitstempel)
    const jahr = datum.getFullYear()
    const monat = ('0' + (datum.getMonth() + 1)).slice(-2)
    const tag = ('0' + datum.getDate()).slice(-2)
    const stunde = ('0' + datum.getHours()).slice(-2)
    const minute = ('0' + datum.getMinutes()).slice(-2)
    return `${jahr}-${monat}-${tag}_${stunde}-${minute}`
}

function formatiereDauer(dauerInMillisekunden) {
    if (!dauerInMillisekunden) return '00:00'
    const dauerInMinuten = Math.ceil(dauerInMillisekunden / 1000 / 60)
    const stunden = Math.floor(dauerInMinuten / 60)
    const minuten = dauerInMinuten - (stunden * 60)
    let formatierteStunden = stunden.toString()
    if (formatierteStunden.length < 2) formatierteStunden = '0' + formatierteStunden
    let formatierteMinuten = minuten.toString()
    if (formatierteMinuten.length < 2) formatierteMinuten = '0' + formatierteMinuten
    return `${formatierteStunden}:${formatierteMinuten}`
}

function formatiereMarkDown(text) {
    return text ? marked(text) : ''
}

function formatiereZeit(zeitAlsZeitstempel) {
    if (!zeitAlsZeitstempel) return ''
    const zeitpunkt = new Date(zeitAlsZeitstempel)
    const stunde = ('0' + zeitpunkt.getHours()).slice(-2)
    const minute = ('0' + zeitpunkt.getMinutes()).slice(-2)
    return `${stunde}:${minute}`
}

function formatiereZeitFuerInput(zeitAlsZeitstempel) {
    if (!zeitAlsZeitstempel) return ''
    const datum = new Date(zeitAlsZeitstempel)
    const stunden = ('0' + datum.getHours()).slice(-2)
    const minuten = ('0' + datum.getMinutes()).slice(-2)
    return `${stunden}:${minuten}`
}

async function ladeAufgabenstatuses() {
    return await ladeJsonArrayAusDatei(AUFGABENSTATUSES_PFAD)
}

async function ladeBenutzerinformationen() {
    const benutzerinformationen = await ladeJsonArrayAusDatei(BENUTZERINFORMATIONEN_PFAD)
    if (!benutzerinformationen) return undefined // Setup muss hier anlaufen
    const userId = localStorage.getItem('userid')
    if (!benutzerinformationen.find(benutzer => benutzer.id === userId)) {
        benutzerinformationen.push({
            id: userId,
            benutzername: localStorage.getItem('username'),
            name: '',
            telefonnummer: '',
            faxnummer: ''
        })
        await speichereBenutzerinformationen(benutzerinformationen)
    }
    return benutzerinformationen
}

async function ladeGeraetearten() {
    return await ladeJsonArrayAusDateiOderErstelleEs(GERAETEARTEN_PFAD, [])
}

async function ladeSpurenaufgaben() {
    return await ladeJsonArrayAusDateiOderErstelleEs(SPURENAUFGABEN_PFAD, [])
}

async function ladeVorgang(vorgangsId) {
    return await (await Arrange.getPublicFile(`/forensics/vorgaenge/${vorgangsId}/vorgang.json`)).json()
}

async function ladeVorgangsaufgaben() {
    return await ladeJsonArrayAusDateiOderErstelleEs(VORGANGSAUFGABEN_PFAD, [])
}

async function ladeVorgangstypen() {
    return await ladeJsonArrayAusDateiOderErstelleEs(VORGANGSTYPEN_PFAD, [])
}

async function ladeVorgangsuebersicht() {
    return await ladeJsonArrayAusDateiOderErstelleEs(VORGANGSUEBERSICHT_PFAD, [])
}

function lauscheAufStrgS(speichernFunktion) {
    document.body.addEventListener('keydown', async event => {
        if((event.ctrlKey || event.metaKey) && event.key==='s'){
            event.preventDefault()
            event.stopPropagation()
            await speichernFunktion()
        }
    })
}

async function parseKtuPdf(pdf) {
    const relevanteItems = []
    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1)
        const textContent = await page.getTextContent()
        for (const item of textContent.items) {
            relevanteItems.push({
                hoehe: item.height,
                text: item.str,
                y: item.transform[5],
            })
        }
    }

    const ergebnisObjekt = {}

    const istStopBedingungErfuellt = function(item, stopBedingung) {
        for (const [key, value] of Object.entries(stopBedingung)) {
            if (item[key] !== value) {
                return false
            }
        }
        return true
    }

    const extrahiereVonIndexBisStopBedingung = function(startIndex, stopBedingung) {
        const extrahierteItems = []
        for (let i = startIndex; i < relevanteItems.length; i++) {
            const item = relevanteItems[i]
            if (istStopBedingungErfuellt(item, stopBedingung)) {
                break
            } else {
                extrahierteItems.push(item)
            }
        }
        return extrahierteItems
    }

    for (let i = 0; i < relevanteItems.length; i++) {
        const item = relevanteItems[i]
        if (item.text === 'Dienststelle' && item.hoehe === 6) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: 'Aktenzeichen', hoehe: 6 })
            ergebnisObjekt['Dienststelle'] = extrahierteItems.map(item => item.text).join('\n')
            i += extrahierteItems.length
        } else if (item.text === 'Aktenzeichen' && item.hoehe === 6) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: 'Sammelaktenzeichen', hoehe: 6 })
            ergebnisObjekt['Aktenzeichen'] = extrahierteItems.map(item => item.text).join('')
            i += extrahierteItems.length
        } else if (item.text === 'Schlüssel' && item.hoehe === 6) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: 'Sachbearbeitung Telefon', hoehe: 6 })
            ergebnisObjekt['Sachbearbeitung durch (Name, Amtsbezeichnung)'] = extrahierteItems.map(item => item.text).join('')
            i += extrahierteItems.length
        } else if (item.text === 'Fax' && item.hoehe === 6) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: ' ', hoehe: 0 })
            ergebnisObjekt['Sachbearbeitung Telefon'] = extrahierteItems.map(item => item.text).join('')
            i += extrahierteItems.length
        } else if (item.text.startsWith('Untersuchungsauftrag ') && item.hoehe === 15.96) {
            ergebnisObjekt['Auftragsnummer'] = item.text.split(' ')[1]
        } else if (item.text === 'Versuch' && item.hoehe === 6) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: 'Tatzeit/Tatzeitraum (Datum, Uhrzeit)', hoehe: 6 })
            ergebnisObjekt['Straftaten'] = extrahierteItems.map(item => item.text).filter(text => text.length > 0).join(' ')
            i += extrahierteItems.length
        } else if (item.text === 'Dringlichkeit' && item.hoehe === 6) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: 'Geschädigte(r)', hoehe: 6 })
            ergebnisObjekt['Dringlichkeit'] = extrahierteItems.map(item => item.text).join('')
            i += extrahierteItems.length
        } else if (item.text.endsWith('unverzüglich mitzuteilen!') && item.hoehe === 12) {
            ergebnisObjekt['Datum'] = relevanteItems[i + 2].text.split(' ')[1]
            i += 2
        } else if (item.text === 'spurenbezogene Sachverhaltsschilderung:' && item.hoehe === 9.96) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: '2. Fotografien/Skizzen', hoehe: 14.04 })
            ergebnisObjekt['Schilderung der Begehungsweise'] = extrahierteItems.map(item => item.text).filter(text => text.length > 0).join(' ')
            i += extrahierteItems.length
        } else if (item.text === 'IuK-Spuren:' && item.hoehe === 9.96) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: '7. Ergebnisse bereits vorgenommener Auswertungen', hoehe: 14.04 })
            const fragen = []
            let aktuelleFrage = { frageTexte: [], spuren: [] }
            let istAmFragenExtrahieren = true
            for (let j = 0; j < extrahierteItems.length; j++) {
                const frageItem = extrahierteItems[j]
                if (istAmFragenExtrahieren) {
                    if (frageItem.text.startsWith('zu Spur(en): ')) {
                        istAmFragenExtrahieren = false
                        aktuelleFrage.spuren.push(...frageItem.text.substring(13).split(',').map(spur => spur.trim()).filter(spur => spur.length > 0))
                    } else {
                        aktuelleFrage.frageTexte.push(frageItem.text)
                    }
                } else {
                    if (frageItem.text === '') {
                        aktuelleFrage.frage = aktuelleFrage.frageTexte.join(' ').trim()
                        delete aktuelleFrage.frageTexte
                        fragen.push(aktuelleFrage)
                        aktuelleFrage = { frageTexte: [], spuren: [] }
                        istAmFragenExtrahieren = true
                    } else {
                        aktuelleFrage.spuren.push(...frageItem.text.split(',').map(spur => spur.trim()).filter(spur => spur.length > 0))
                    }
                }
            }
            ergebnisObjekt['Fragen'] = fragen
            i += extrahierteItems.length
        } else if (item.text === '9. Anlagen' && item.hoehe === 14.04) {
            const extrahierteItems = extrahiereVonIndexBisStopBedingung(i + 1, { text: '______________________________ ENDE des PROTOKOLLS________________________________________', hoehe: 9.96 })
            const spuren = []
            for (const extrahiertesItm of extrahierteItems) {
                if (extrahiertesItm.text.length > 0) {
                    const [spurnummer, spurname] = extrahiertesItm.text.substring(2).split(':').map(text => text.trim())
                    spuren.push({
                        spurnummer: spurnummer,
                        spurname: spurname
                    })
                }
            }
            ergebnisObjekt['Spuren'] = spuren
            i += extrahierteItems.length
        }
    }
    return ergebnisObjekt
}

function prioritaetsbezeichnung(prioritaetsId) {
    return Vorgangsprioritaeten.find(vorgangsprioritaet => vorgangsprioritaet.id === prioritaetsId)?.bezeichnung
}

function prioritaetsfarbe(prioritaetsId) {
    return Vorgangsprioritaeten.find(vorgangsprioritaet => vorgangsprioritaet.id === prioritaetsId)?.farbe
}

async function speichereAufgabenstatuses(aufgabenstatuses) {
    await Arrange.postPublicTextFile(AUFGABENSTATUSES_PFAD, JSON.stringify(aufgabenstatuses))
}

async function speichereBenutzerinformationen(benutzerinformationen) {
    await Arrange.postPublicTextFile(BENUTZERINFORMATIONEN_PFAD, JSON.stringify(benutzerinformationen))
}

async function speichereGeraetearten(geraetearten) {
    await Arrange.postPublicTextFile(GERAETEARTEN_PFAD, JSON.stringify(geraetearten))
}

async function speichereSpurenaufgaben(spurenaufgaben) {
    await Arrange.postPublicTextFile(SPURENAUFGABEN_PFAD, JSON.stringify(spurenaufgaben))
}

async function speichereVorgang(vorgangsId, vorgang) {
    await Arrange.postPublicTextFile(`/forensics/vorgaenge/${vorgangsId}/vorgang.json`, JSON.stringify(vorgang))
}

async function speichereVorgangsaufgaben(vorgangsaufgaben) {
    await Arrange.postPublicTextFile(VORGANGSAUFGABEN_PFAD, JSON.stringify(vorgangsaufgaben))
}

async function speichereVorgangstypen(vorgangstypen) {
    await Arrange.postPublicTextFile(VORGANGSTYPEN_PFAD, JSON.stringify(vorgangstypen))
}

async function speichereVorgangsuebersicht(vorgangsuebersicht) {
    await Arrange.postPublicTextFile(VORGANGSUEBERSICHT_PFAD, JSON.stringify(vorgangsuebersicht))
}

function verzeichnisnameFuerSpur(spur) {
    return verzeichnisnameFuerText(spur.Spurnummer + '_' + spur.Spurname)
}

function verzeichnisnameFuerText(text) {
    return text?.replace(/\//g, "-").replace(/[ &\/\\#,+()$~%'":*?<>{}]/g, "_").replace(/\u00dc/g, "UE").replace(/\u00c4/g, "AE").replace(/\u00d6/g, "OE").replace(/\u00fc/g, "ue").replace(/\u00e4/g, "ae").replace(/\u00f6/g, "oe").replace(/\u00df/g, "ss")
}

function verzeichnisnameFuerVorgang(vorgang) {
    if (!vorgang.Vorgangsnummer) return ''
    const nummernteile = vorgang.Vorgangsnummer.split('-')
    if (nummernteile.length < 3) return ''
    const [nummer, jahr] = nummernteile[2].split('/')
    return jahr + '-' + nummer
}

export {
    bereiteNeueFrageVor,
    bereiteNeueSpurVor,
    dateinameFuerErgebnismitteilung,
    dateinameFuerTaetigkeitsprotokoll,
    dateinameFuerZeitnachweis,
    ersetzePlatzhalter,
    formatiereDatum,
    formatiereDatumFuerInput,
    formatiereDauer,
    formatiereMarkDown,
    formatiereZeit,
    formatiereZeitFuerInput,
    ladeAufgabenstatuses,
    ladeBenutzerinformationen,
    ladeGeraetearten,
    ladeSpurenaufgaben,
    ladeVorgang,
    ladeVorgangsaufgaben,
    ladeVorgangstypen,
    ladeVorgangsuebersicht,
    lauscheAufStrgS,
    parseKtuPdf,
    prioritaetsbezeichnung,
    prioritaetsfarbe,
    speichereAufgabenstatuses,
    speichereBenutzerinformationen,
    speichereGeraetearten,
    speichereSpurenaufgaben,
    speichereVorgang,
    speichereVorgangsaufgaben,
    speichereVorgangstypen,
    speichereVorgangsuebersicht,
    verzeichnisnameFuerSpur,
    verzeichnisnameFuerText,
    verzeichnisnameFuerVorgang,
}