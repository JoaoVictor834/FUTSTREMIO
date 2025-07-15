const { addonBuilder, serveHTTP, getRouter } = require('stremio-addon-sdk')
const SOURCES = require('./sources.json')
const address = require('./main')

const builder = new addonBuilder({
    id: 'org.joao.tvefutebolhttp',
    version: '1.0.0',

    name: 'TV/FUTEBOL BR',

    resources: ['stream', 'catalog'],
    types: ['tv'],
    "catalogs": [
        {
            type: 'tv',
            id: 'top'
        }
    ],
    idPrefixes: ['tvid']
})

const met = []
SOURCES.forEach(s => {

    met.push({
        id: `tvid${s.id}`,
        name: s.name,
        releaseInfo: '2025',
        poster: s.poster,
        posterShape: 'landscape',
        type: 'tv',
        description: "LIVE DO CANAL " + s.name.toUpperCase().toString()
    })
});



builder.defineCatalogHandler(function (args) {
    
    
    if (args.type === 'tv' && args.id === 'top') {




        try {
            return Promise.resolve({ metas: [...met] })
        } catch (error) {
            console.error(error)
        }

    } else {
        return Promise.resolve({ metas: [] })

    }
})

builder.defineStreamHandler(function (args) {

   const s = SOURCES.find(s => `tvid${s.id}` === args.id)

        if (args.type === 'tv') {

                const stream = { name: s.name, description: `LIVE AO VIVO DO ${s.name.toUpperCase()}`, type: 'tv', url: `${address}/stream${s.name}.m3u8`}
                return Promise.resolve({ streams: [stream] })
            } else {
                // otherwise return no streams
                return Promise.resolve({ streams: [] })
            }
        
    
})

//serveHTTP(builder.getInterface(), { port: 8080 })

console.log("addon.js")
router = getRouter(builder.getInterface())

module.exports = router