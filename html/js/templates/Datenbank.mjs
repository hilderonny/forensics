export default {

    Forensics: {

        Aufgaben: {
            Archiviert: 'INTEGER',
            Beschreibung: 'TEXT',
            Reihenfolge: 'INTEGER',
            Titel: 'TEXT',
            Typ: 'TEXT',
            VorgangstypenId: 'TEXT REFERENCES Vorgangstypen(Id) ON DELETE CASCADE',
        },

        Aufgabenstatuses: {
            AufgabenId: 'TEXT',
            SpurenId: 'TEXT REFERENCES Spuren(Id) ON DELETE CASCADE',
            Status: 'TEXT',
            VorgangsId: 'TEXT REFERENCES Vorgaenge(Id) ON DELETE CASCADE',
        },

        Benutzer: {
            Benutzername: 'TEXT',
            DienststellenId: 'TEXT REFERENCES Dienststellen(Id)',
            Email: 'TEXT',
            Faxnummer: 'TEXT',
            Name: 'TEXT',
            Vorgangsverzeichnis: 'TEXT',
            Telefonnummer: 'TEXT',
        },

        Dienststellen: {
            Disclaimer: 'TEXT',
            Logo: 'TEXT',
            KAB_Anschreiben: 'TEXT',
            KAB_Barcode: 'TEXT',
            KAB_Logo: 'TEXT',
            KAB_Titel: 'TEXT',
            Name: 'TEXT',
            Ort: 'TEXT',
            Postleitzahl: 'TEXT',
            Strasse: 'TEXT',
        },

        Notizen: {
            Datum: 'INTEGER',
            SpurenId: 'TEXT REFERENCES Spuren(Id) ON DELETE CASCADE',
            Text: 'TEXT',
            VorgangsId: 'TEXT REFERENCES Vorgaenge(Id) ON DELETE CASCADE',
        },

        Spuren: {
            Besonderheiten: 'TEXT',
            Betriebssystem: 'TEXT',
            Dasiplatte: 'TEXT',
            Datenumfang: 'INTEGER',
            Geraeteart: 'TEXT',
            Geraetebezeichnung: 'TEXT',
            Herausgegeben: 'INTEGER',
            Seriennummer: 'TEXT',
            Spurname: 'TEXT',
            Spurnummer: 'TEXT',
            VorgangsId: 'TEXT REFERENCES Vorgaenge(Id) ON DELETE CASCADE',
            Vorhanden: 'INTEGER',
        },

        Spurenfragen: {
            SpurenId: 'TEXT REFERENCES Spuren(Id) ON DELETE CASCADE',
            VorgangsfragenId: 'TEXT REFERENCES Vorgangsfragen(Id) ON DELETE CASCADE',
        },

        Taetigkeiten: {
            BenutzerId: 'TEXT REFERENCES Benutzer(Id) ON DELETE CASCADE',
            Endzeit: 'INTEGER',
            AufgabenstatusId: 'TEXT REFERENCES Aufgabenstatuses(Id) ON DELETE CASCADE',
            Startzeit: 'INTEGER',
            Text: 'TEXT',
        },

        Vorgangsfragen: {
            Antwort: 'TEXT',
            Frage: 'TEXT',
            Nummer: 'TEXT',
            VorgangsId: 'TEXT REFERENCES Vorgaenge(Id) ON DELETE CASCADE',
        },

        Vorgangstypen: {
            Name: 'TEXT',
        },
        
        Vorgaenge: {
            Aktenzeichen: 'TEXT',
            Ansprechpartner: 'TEXT',
            Auftraggeber: 'TEXT',
            Auftragsdatum: 'INTEGER',
            Auftragsnummer: 'TEXT',
            Beschreibung: 'TEXT',
            Dasiplatte: 'TEXT',
            Datenumfang: 'INTEGER',
            Prioritaet: 'TEXT',
            Status: 'TEXT',
            Straftaten: 'TEXT',
            UserId: 'TEXT',
            Vorgangsnummer: 'TEXT',
            VorgangstypenId: 'TEXT REFERENCES Vorgangstypen(Id)',
        },

    },

}