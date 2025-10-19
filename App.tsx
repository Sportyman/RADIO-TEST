import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Station, NowPlayingInfo, FilterType, SortType } from './types';
import { fetchStationsFromRadioBrowser, fetchNowPlaying } from './services/radioService';
import { POPULAR_STATIONS_UUIDS, THEMES, DEFAULT_SETTINGS, EQ_PRESETS } from './constants';

// Helper components defined outside to prevent re-creation on re-renders

const MarqueeText: React.FC<{ text: string; speed: number; delay: number; enabled: boolean }> = ({ text, speed, delay, enabled }) => {
    if (!enabled) return <span className="truncate">{text}</span>;

    const duration = text.length / speed;
    const animationStyle = {
        '--marquee-duration': `${duration}s`,
        '--marquee-delay': `${delay}s`,
    } as React.CSSProperties;

    return (
        <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-marquee" style={animationStyle}>{text}</span>
        </div>
    );
};

// Main App Component
export default function App() {
    const [stations, setStations] = useState<Station[]>([]);
    const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('radio_favorites') || '[]'));
    const [customSort, setCustomSort] = useState<string[]>(() => JSON.parse(localStorage.getItem('radio_customSort') || '[]'));
    
    const [currentStation, setCurrentStation] = useState<Station | null>(null);
    const [nowPlayingInfo, setNowPlayingInfo] = useState<NowPlayingInfo | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [filter, setFilter] = useState<FilterType>(FilterType.All);
    const [sort, setSort] = useState<SortType>(SortType.Popularity);

    const audioRef = React.useRef<HTMLAudioElement>(null);

    // PWA & Media Session logic
    useEffect(() => {
        const updateMediaSession = () => {
            if ('mediaSession' in navigator && currentStation) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: nowPlayingInfo?.song || currentStation.name,
                    artist: nowPlayingInfo?.program || currentStation.name,
                    album: 'רדיו ישראל',
                    artwork: [{ src: currentStation.favicon || '/favicon.ico', sizes: '512x512', type: 'image/png' }]
                });

                navigator.mediaSession.setActionHandler('play', () => playStation(currentStation));
                navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
                navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
                navigator.mediaSession.setActionHandler('nexttrack', playNext);
            }
        };
        updateMediaSession();
    }, [currentStation, nowPlayingInfo, isPlaying]);


    const playStation = useCallback((station: Station) => {
        if (audioRef.current) {
            if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
                audioRef.current.pause();
            } else {
                setCurrentStation(station);
                setNowPlayingInfo(null);
                audioRef.current.src = station.url_resolved;
                audioRef.current.play().catch(e => console.error("Playback error:", e));
            }
        }
    }, [currentStation, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const playNext = useCallback(() => {
        if (!currentStation || stations.length === 0) return;
        const currentIndex = stations.findIndex(s => s.stationuuid === currentStation.stationuuid);
        const nextIndex = (currentIndex + 1) % stations.length;
        playStation(stations[nextIndex]);
    }, [currentStation, stations, playStation]);

    const playPrevious = useCallback(() => {
        if (!currentStation || stations.length === 0) return;
        const currentIndex = stations.findIndex(s => s.stationuuid === currentStation.stationuuid);
        const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
        playStation(stations[prevIndex]);
    }, [currentStation, stations, playStation]);

    // Data fetching
    useEffect(() => {
        async function loadStations() {
            setIsLoading(true);
            const browserStations = await fetchStationsFromRadioBrowser();
            // In a real app, you would merge with 100fm and others here, handling duplicates.
            setStations(browserStations);
            setIsLoading(false);
        }
        loadStations();
    }, []);

    useEffect(() => {
        if (currentStation && isPlaying) {
            const fetchInfo = async () => {
                const info = await fetchNowPlaying(currentStation);
                setNowPlayingInfo(info);
            };
            fetchInfo();
            const interval = setInterval(fetchInfo, 20000); // Poll every 20 seconds
            return () => clearInterval(interval);
        }
    }, [currentStation, isPlaying]);

    // Favorites logic
    const toggleFavorite = (stationId: string) => {
        const newFavorites = favorites.includes(stationId)
            ? favorites.filter(id => id !== stationId)
            : [...favorites, stationId];
        setFavorites(newFavorites);
        localStorage.setItem('radio_favorites', JSON.stringify(newFavorites));
    };
    
    // Sorting & Filtering logic
    const displayedStations = useMemo(() => {
        let filtered = filter === FilterType.Favorites ? stations.filter(s => favorites.includes(s.stationuuid)) : stations;
        
        switch (sort) {
            case SortType.AZ:
                return filtered.sort((a, b) => a.name.localeCompare(b.name, 'he'));
            case SortType.ZA:
                return filtered.sort((a, b) => b.name.localeCompare(a.name, 'he'));
            case SortType.Popularity:
                return filtered.sort((a, b) => {
                    const aIsPopular = POPULAR_STATIONS_UUIDS.includes(a.stationuuid);
                    const bIsPopular = POPULAR_STATIONS_UUIDS.includes(b.stationuuid);
                    if (aIsPopular && !bIsPopular) return -1;
                    if (!aIsPopular && bIsPopular) return 1;
                    return 0;
                });
            default:
                return filtered;
        }
    }, [stations, filter, sort, favorites]);

    const theme = THEMES.find(t => t.name === (DEFAULT_SETTINGS.theme)) || THEMES[0];

    const settings = DEFAULT_SETTINGS;

    return (
        <div className={`min-h-screen ${theme.colors.bg} ${theme.colors.text} font-sans transition-colors duration-500`}>
            <audio ref={audioRef} crossOrigin="anonymous" />
            <div className="container mx-auto px-4 pb-24">
                <header className="py-4">
                    <h1 className="text-3xl font-bold text-center mb-4">רדיו ישראל</h1>
                    <div className="flex justify-center space-x-2 space-x-reverse mb-4">
                        {(Object.values(FilterType)).map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === f ? `${theme.colors.accent} text-white` : 'bg-gray-700'}`}>{f}</button>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <select value={sort} onChange={e => setSort(e.target.value as SortType)} className="bg-gray-700 text-white rounded px-3 py-1">
                            {Object.values(SortType).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </header>
                
                {isLoading ? (
                    <div className="text-center mt-20">טוען תחנות...</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {displayedStations.map(station => (
                            <div key={station.stationuuid} className={`relative p-2 rounded-lg cursor-pointer ${theme.colors.primary} hover:bg-gray-700 transition-all duration-200`} onClick={() => playStation(station)}>
                                <img src={station.favicon || 'https://picsum.photos/128'} alt={station.name} className="w-full h-auto object-cover rounded-md aspect-square" style={{width: `${settings.stationIconSize}px`, height: `${settings.stationIconSize}px`, margin: 'auto'}} onError={(e) => (e.currentTarget.src = 'https://picsum.photos/128')} />
                                <p className="text-center text-sm mt-2 h-10 flex items-center justify-center">{station.name}</p>
                                {isPlaying && currentStation?.stationuuid === station.stationuuid && !settings.hideElements.playingIndicator && (
                                    <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(station.stationuuid); }} className="absolute top-2 left-2 text-2xl">
                                    {favorites.includes(station.stationuuid) ? <span className="text-yellow-400">★</span> : <span className="text-gray-500">☆</span>}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {currentStation && (
                <div className={`fixed bottom-0 left-0 right-0 ${theme.colors.playerBg} ${theme.colors.playerText} shadow-lg p-3 flex items-center z-50`}>
                    <img src={currentStation.favicon} alt={currentStation.name} className="w-14 h-14 rounded-md mr-4" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/128')} />
                    <div className="flex-grow overflow-hidden">
                        <MarqueeText text={currentStation.name} {...settings.marquee} enabled={settings.marquee.stationName} />
                        <MarqueeText text={nowPlayingInfo?.song || 'טוען מידע...'} {...settings.marquee} enabled={settings.marquee.songName} />
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <button onClick={playPrevious} className="text-3xl">⏮</button>
                        <button onClick={() => playStation(currentStation)} className="text-5xl">
                            {isPlaying ? '⏸' : '▶️'}
                        </button>
                        <button onClick={playNext} className="text-3xl">⏭</button>
                    </div>
                </div>
            )}
            {/* Fix: The <style jsx global> syntax is a Next.js feature. This app uses standard React, so a regular <style> tag is used instead. */}
             <style>{`
                @keyframes marquee {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                  animation: marquee var(--marquee-duration) linear var(--marquee-delay) infinite;
                }
            `}</style>
        </div>
    );
}
