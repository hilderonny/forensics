import Arrange from '../arrange/arrange.mjs'

// Server vorbereiten
const server = Arrange.createServer({
    crtFile: process.env.CRT_FILE || './server.crt',
    htmlPaths: { '/' : './html' },
    keyFile: process.env.KEY_FILE || './server.key',
    name: 'Forensics',
    port: parseInt(process.env.PORT) || 8443,
    tokenSecret: process.env.TOKEN_SECRET || 'hubbelebubbele',
    useSSL: true,
    useWebsockets: true,
})

// Server starten
server.start()