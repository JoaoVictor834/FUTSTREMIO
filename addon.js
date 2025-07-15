const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const SOURCES = require('./sources.json');

module.exports = function(HOST) {
    const builder = new addonBuilder({
        id: 'org.joao.tvefutebolhttp',
        version: '1.0.0',
        name: 'TV/FUTEBOL BR',
        resources: ['stream', 'catalog'],
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

    builder.defineCatalogHandler(args => {
        if (args.type === 'tv' && args.id === 'top') {
            return Promise.resolve({ metas: [...met] });
        }
        return Promise.resolve({ metas: [] });
    });

    builder.defineStreamHandler(args => {
        if (args.type === 'tv') {
            const s = SOURCES.find(s => `tvid${s.id}` === args.id);
            if (!s) return Promise.resolve({ streams: [] });

            const stream = {
                name: s.name,
                description: `LIVE AO VIVO DO ${s.name.toUpperCase()}`,
                type: 'tv',
                url: `${HOST}/stream${s.name}.m3u8`
            };
            return Promise.resolve({ streams: [stream] });
        }
        return Promise.resolve({ streams: [] });
    });

    return getRouter(builder.getInterface());
};
