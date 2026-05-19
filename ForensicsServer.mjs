import ArrangeServer from '@hilderonny/arrange'

// Server vorbereiten
const server = new ArrangeServer({
    crtFile: './server.crt',
    htmlPaths: { '/' : './html' },
    keyFile: './server.key',
    name: 'Forensics',
    port: 8443,
    useSSL: true,
    useWebsockets: true
})

// Server starten
server.start()