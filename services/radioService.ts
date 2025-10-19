
import type { Station, NowPlayingInfo } from '../types';
import {
  PROXY_URL,
  RADIO_BROWSER_API_BASE,
  KAN_API_BASE,
  GLZ_API_PROGRAM,
  GLZ_API_SONG_XML,
  ECO99FM_API,
  FM100_API
} from '../constants';

export async function fetchStationsFromRadioBrowser(): Promise<Station[]> {
  try {
    const response = await fetch(`${PROXY_URL}${RADIO_BROWSER_API_BASE}/stations/bycountrycodeexact/IL`);
    if (!response.ok) throw new Error('Failed to fetch from Radio Browser');
    const data: Station[] = await response.json();
    return data.filter(s => s.url_resolved && !s.name.toLowerCase().includes('test'));
  } catch (error) {
    console.error("Error fetching stations from Radio Browser:", error);
    return [];
  }
}

export async function fetchStationsFrom100fm(): Promise<Partial<Station>[]> {
    // This is a simplified parser for 100fm. A real implementation might be more complex.
    try {
        const response = await fetch(`${PROXY_URL}${FM100_API}`);
        if (!response.ok) throw new Error('Failed to fetch from 100fm');
        const data = await response.json();
        return data.channels.map((ch: any) => ({
            name: ch.name,
            url_resolved: ch.streaming_url,
            favicon: ch.logo_url,
            tags: '100fm',
        }));
    } catch (error) {
        console.error("Error fetching stations from 100fm:", error);
        return [];
    }
}

async function getNowPlayingFromKan(stationId: string): Promise<NowPlayingInfo> {
  const response = await fetch(`${PROXY_URL}${KAN_API_BASE}?stationId=${stationId}`);
  const data = await response.json();
  return {
    program: data.now?.title,
    song: data.now?.musics?.[0]?.title,
    nextSong: data.next?.musics?.[0]?.title,
    source: 'Kan'
  };
}

async function getNowPlayingFromGlz(stationId: 'glz' | 'glglz'): Promise<NowPlayingInfo> {
  let songInfo: NowPlayingInfo = {};
  let programInfo: NowPlayingInfo = {};

  try { // XML for song
    const response = await fetch(`${PROXY_URL}${GLZ_API_SONG_XML}/${stationId}-onair/onair.xml`);
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    songInfo = {
      song: xmlDoc.getElementsByTagName("dalet-title")[0]?.textContent || undefined,
      nextSong: xmlDoc.getElementsByTagName("dalet-title-next")[0]?.textContent || undefined,
    };
  } catch (e) { /* ignore */ }

  try { // JSON for program
    const response = await fetch(`${PROXY_URL}${GLZ_API_PROGRAM}?stationid=${stationId}`);
    const data = await response.json();
    programInfo = {
      program: data.program,
    };
  } catch(e) { /* ignore */ }
  
  return { ...songInfo, ...programInfo, source: 'GLZ' };
}

async function getNowPlayingFromEco99fm(): Promise<NowPlayingInfo> {
    const response = await fetch(`${PROXY_URL}${ECO99FM_API}`);
    const data = await response.json();
    return {
        program: data.fields?.program?.stringValue,
        song: data.fields?.song?.stringValue,
        source: 'Eco99fm'
    };
}

async function getNowPlayingFromRadioBrowser(uuid: string): Promise<NowPlayingInfo> {
    const response = await fetch(`${PROXY_URL}${RADIO_BROWSER_API_BASE}/stations/check?uuids=${uuid}`);
    const data = await response.json();
    const songTitle = data[0]?.title;
    return {
        song: songTitle && songTitle !== data[0]?.name ? songTitle : undefined,
        source: 'RadioBrowser'
    };
}


export async function fetchNowPlaying(station: Station): Promise<NowPlayingInfo> {
  const name = station.name.toLowerCase();
  
  if (name.includes('כאן 88')) return getNowPlayingFromKan('956');
  if (name.includes('כאן גימל')) return getNowPlayingFromKan('954');
  if (name.includes('כאן ב')) return getNowPlayingFromKan('952');
  if (name.includes('כאן תרבות')) return getNowPlayingFromKan('955');
  if (name.includes('כאן קול המוסיקה')) return getNowPlayingFromKan('957');
  
  if (name.includes('גלגלצ')) return getNowPlayingFromGlz('glglz');
  if (name.includes('גלי צה"ל')) return getNowPlayingFromGlz('glz');
  
  if (name.includes('eco99fm')) return getNowPlayingFromEco99fm();

  return getNowPlayingFromRadioBrowser(station.stationuuid);
}
   