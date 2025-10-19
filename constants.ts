
import type { Theme, Settings } from './types';

export const PROXY_URL = 'https://corsproxy.io/?';

export const RADIO_BROWSER_API_BASE = 'https://de1.api.radio-browser.info/json';
export const KAN_API_BASE = 'https://www.kan.org.il/radio/live-info-v2.aspx';
export const GLZ_API_PROGRAM = 'https://glz.co.il/umbraco/api/player/UpdatePlayer';
export const GLZ_API_SONG_XML = 'https://glzxml.blob.core.windows.net/dalet';
export const ECO99FM_API = 'https://firestore.googleapis.com/v1/projects/eco-99-production/databases/(default)/documents/streamed_content/program';
export const FM100_API = 'https://digital.100fm.co.il/app/';

export const POPULAR_STATIONS_UUIDS = [
    '962a2656-5389-4993-a0df-f55931215886', // גלגלצ
    '4c5029de-84a7-4537-8120-77a834d8a14c', // כאן 88
    '968b557b-0520-4def-9d51-14ff833b5c32', // כאן גימל
    '968b556e-0520-4def-9d51-14ff833b5c32', // כאן ב
    'f3c97693-55ca-4682-8417-640b3b42661c', // גלי צה"ל
    '3485303c-8519-4822-b36e-f780209fbe72', // רדיו ללא הפסקה 103
    'bd65684f-7798-4338-9571-55079a40a833', // eco99fm
    '87993414-b4a8-4448-936d-0e428800965c', // רדיוס 100FM
];

export const THEMES: Theme[] = [
    { name: 'Dark', colors: { bg: 'bg-gray-900', text: 'text-gray-200', primary: 'bg-gray-800', accent: 'text-blue-400', playerBg: 'bg-gray-800', playerText: 'text-white' } },
    { name: 'Light', colors: { bg: 'bg-gray-100', text: 'text-gray-800', primary: 'bg-white', accent: 'text-blue-600', playerBg: 'bg-white', playerText: 'text-black' } },
    { name: 'Blue', colors: { bg: 'bg-blue-900', text: 'text-blue-100', primary: 'bg-blue-800', accent: 'text-yellow-300', playerBg: 'bg-blue-950', playerText: 'text-white' } },
    { name: 'Matrix', colors: { bg: 'bg-black', text: 'text-green-400', primary: 'bg-gray-900', accent: 'text-green-300', playerBg: 'bg-black', playerText: 'text-green-400' } },
    { name: 'Sunset', colors: { bg: 'bg-red-900', text: 'text-yellow-200', primary: 'bg-red-800', accent: 'text-orange-300', playerBg: 'bg-red-950', playerText: 'text-white' } },
    { name: 'Forest', colors: { bg: 'bg-green-900', text: 'text-green-100', primary: 'bg-green-800', accent: 'text-yellow-400', playerBg: 'bg-green-950', playerText: 'text-white' } },
    { name: 'Ocean', colors: { bg: 'bg-teal-900', text: 'text-cyan-100', primary: 'bg-teal-800', accent: 'text-white', playerBg: 'bg-teal-950', playerText: 'text-white' } },
    { name: 'Royal', colors: { bg: 'bg-indigo-900', text: 'text-purple-200', primary: 'bg-indigo-800', accent: 'text-gold-300', playerBg: 'bg-indigo-950', playerText: 'text-white' } },
];

export const DEFAULT_SETTINGS: Settings = {
    theme: 'Dark',
    equalizer: {
        bass: 0,
        mid: 0,
        treble: 0,
        preset: 'Default',
    },
    visualizer: {
        enabledBottom: true,
        enabledFullscreen: true,
        style: 0,
    },
    stationIconSize: 128, // Corresponds to w-32 h-32
    marquee: {
        stationName: true,
        songName: true,
        nextSong: true,
        speed: 20,
        delay: 2,
    },
    hideElements: {
        playingIndicator: false,
        volumeControl: false,
        nextSong: false,
    },
};

export const EQ_PRESETS: { [key: string]: { bass: number, mid: number, treble: number } } = {
    'Default': { bass: 0, mid: 0, treble: 0 },
    'Bass Boost': { bass: 6, mid: -2, treble: -2 },
    'Vocal Boost': { bass: -2, mid: 4, treble: 2 },
    'Rock': { bass: 4, mid: -2, treble: 4 },
    'Pop': { bass: -1, mid: 3, treble: 2 },
    'Classical': { bass: 0, mid: 0, treble: 5 },
};
   