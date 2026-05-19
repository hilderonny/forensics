import ForensicsDatenbankobjekt from './ForensicsDatenbankobjekt.mjs'

export default class Taetigkeit extends ForensicsDatenbankobjekt {

    static tableName = 'Taetigkeiten'

    constructor(felder) {
        super(felder)
        if (!this.BenutzerId) {
            this.BenutzerId = localStorage.getItem('userid')
        }
    }
    
}