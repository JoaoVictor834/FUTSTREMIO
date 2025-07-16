const express = require('express');
const axios = require('axios');
const router = require('./addon');

const app = express();
const HOST = process.env.VERCEL_URL ? process.env.VERCEL_URL : 'http://localhost:8080'

const SOURCES = require('./sources.json')
const ALLOWED_HOSTS = new Set([
  'embmaxtv.online',
]);

const HEADERS = {
  Referer: 'https://embedcanaistv.com/',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
  Accept: '*/*',
  'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
  Connection: 'keep-alive',
};

app.get('/stream/:id.m3u8', async (req, res) => {
  const playlistUrl = SOURCES.find(s => s.name === req.params.id).url
  if (!playlistUrl) return console.error('Erro em playlisturl')

  try {
    const response = await axios.get(playlistUrl, { headers: HEADERS });
    const playlist = response.data;

    const baseUrl = playlistUrl.substring(0, playlistUrl.lastIndexOf('/') + 1);

    // Reescreve para o segment no proxy
    const newPlaylist = playlist.split('\n').map(line => {
      if (line && !line.startsWith('#') && line.endsWith('.ts')) {
        const segmentFullUrl = new URL(line, baseUrl).href;
        const encodedSegmentUrl = encodeURIComponent(segmentFullUrl);
        return `https://${HOST}/segment?url=${encodedSegmentUrl}`;
      }
      return line;
    }).join('\n');

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(newPlaylist);
  } catch (err) {
    console.error('Erro ao buscar playlist:', err.message);
    res.status(502).send('Erro ao buscar playlist');
  }
});

// Segmentos m3u8
app.get('/segment', async (req, res) => {
  const segmentUrl = req.query.url;
  if (!segmentUrl) {
    return res.status(400).send('Faltando URL de Segmento');
  }

  try {
    const decodedUrl = decodeURIComponent(segmentUrl);
    const parsedHost = new URL(decodedUrl).hostname;

    // Só permitimos proxy para hosts autorizados
    if (!ALLOWED_HOSTS.has(parsedHost)) {
      return res.status(403).send('Host não permitido');
    }

    const response = await axios.get(decodedUrl, {
      headers: HEADERS,
      responseType: 'stream',
      timeout: 30000,
    });

    res.setHeader('Content-Type', 'video/MP2T');
    response.data.pipe(res);
  } catch (err) {
    console.error('Erro no segmento:', err.message);
    res.status(502).send('Erro ao buscar segmento');
  }
});

app.use('/', router);
const PORT = 8080;

const server = app.listen(PORT, () => {
  const address = server.address();
  const host = (address.address === '::') ? 'localhost' : address.address;
  const protocol = (address.address === '::') ? 'http://' : 'https://';
  const port = address.port ? `:${address.port}` : '';
  const HOST = `${protocol}${host}${port}`;

  console.log(`Proxy rodando na porta ` + HOST);
});