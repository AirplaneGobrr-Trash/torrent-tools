export interface TV_SearchResult {
    name: string,
    id: Number,
    langs: string[]
}

export interface MovieSearchResult {
    name: string,
    id: Number
}

export interface EpisodeInfo {
    name: string,
    subtitleCount: Number,
    season: Number,
    episode: Number,
    langs: string[],
    id: Number
}

export interface SubtitleFileInfo {
    bad: Number,
    good: Number,
    ratio: Number,
    name: string,
    lang: string,
    rip: string,
    release: string,
    author: string,
    downloads: Number,
    id: Number,
}