
export interface Station {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  codec: string;
  bitrate: number;
}

export interface NowPlayingInfo {
  program?: string;
  song?: string;
  nextSong?: string;
  source?: string;
}

export enum SortType {
  MySort = "שלי",
  Popularity = "פופולריות",
  AZ = "א-ת",
  ZA = "ת-א",
  Category = "קטגוריות",
}

export enum FilterType {
  All = "הכל",
  Favorites = "מועדפים",
}

export interface Theme {
  name: string;
  colors: {
    bg: string;
    text: string;
    primary: string;
    accent: string;
    playerBg: string;
    playerText: string;
  };
}

export interface Settings {
    theme: string;
    equalizer: {
        bass: number;
        mid: number;
        treble: number;
        preset: string;
    };
    visualizer: {
        enabledBottom: boolean;
        enabledFullscreen: boolean;
        style: number;
    };
    stationIconSize: number;
    marquee: {
        stationName: boolean;
        songName: boolean;
        nextSong: boolean;
        speed: number;
        delay: number;
    };
    hideElements: {
        playingIndicator: boolean;
        volumeControl: boolean;
        nextSong: boolean;
    };
}
   