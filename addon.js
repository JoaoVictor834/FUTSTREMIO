const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const SOURCES = require('./sources.json');
const HOST = process.env.VERCEL_URL ? process.env.VERCEL_URL : 'http://localhost:8080'

    const builder = new addonBuilder({
        id: 'org.joao.tvefutebolhttp',
        version: '1.0.0',
        name: 'FUTEBOL BR',
        resources: ['stream', 'catalog', 'meta'],
        types: ['tv'],
        catalogs: [
            { type: 'tv', id: 'top' }
        ],
        idPrefixes: ['tvid']
    });

    const met = [];
    SOURCES.forEach(s => {
        met.push({
            id: `tvid${s.id}`,
            name: s.name,
            releaseInfo: '2025',
            poster: s.poster,
            posterShape: 'landscape',
            type: 'tv',
            description: "LIVE DO CANAL " + s.name.toUpperCase()
        });
    });

    //TODO: arrumar parametros, a documentação é meio confusa sobre onde usar

    const metObj = [];
    SOURCES.forEach(s => {
        metObj.push({
            id: `tvid${s.id}`,
            name: s.name,
            releaseInfo: '2025',
            poster: s.poster,
            posterShape: 'landscape',
            type: 'tv',
            background: s.banner,
            overview: "LIVE DO CANAL DE TV",
            description: "LIVE DO CANAL " + s.name.toUpperCase(),
            title: s.name.toString()
        });
    });

    builder.defineCatalogHandler(args => {
        if (args.type === 'tv' && args.id === 'top') {
            return Promise.resolve({ metas: [...met] });
        }
        return Promise.resolve({ metas: [] });
    });

    builder.defineMetaHandler(function (args) {
        if (args.type === 'tv') {
            console.log(args)
            let meta = metObj.find(m => m.id === args.id)
            if(!meta) return
            return Promise.resolve({ meta: meta });
        }
        return Promise.resolve({ meta: [] });
    })

    builder.defineStreamHandler(args => {
        if (args.type === 'tv') {
            const s = SOURCES.find(s => `tvid${s.id}` === args.id);
            if (!s) return Promise.resolve({ streams: [] });

            const stream = {
                name: s.name,
                description: `LIVE AO VIVO DO ${s.name.toUpperCase()}`,
                type: 'tv',
                url: `https://${HOST}/stream/${s.name}.m3u8`
            };
            return Promise.resolve({ streams: [stream] });
        }
        return Promise.resolve({ streams: [] });
    });

    const router = getRouter(builder.getInterface());
    module.exports = router
