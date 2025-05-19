import * as types from './types';

export * as tv from "./tvShows";
export * as movie from "./movie";

/**
 * 
 * @param moviePath The movie file path (mkv, mp4, etc)
 * @param srtPath The input (unsynced) srt path
 * @param srtSavePath The output (synced) srt path
 */
export async function syncSubtitleWithMedia(moviePath: String, srtPath: String, srtSavePath: String, ffsOptions?: any) {
    let cmd = `ffsubsync "${moviePath}" -i "${srtPath}" -o "${srtSavePath}"`
}