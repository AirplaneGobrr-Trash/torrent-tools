import * as types from './types';
import * as path from "path"
import * as os from "os"
import * as fs from "fs/promises"
import { randomInt } from 'crypto';

const tempPath = path.join(os.tmpdir(), "ffsubsync-api")

export async function syncSubtitles(video: string | Buffer, srtIn: string | Buffer, srtOut: string | null, options:types.ffsOptions) {

    await fs.mkdir(tempPath, { recursive: true });

    let videoPath = path.join(tempPath, `${randomInt(999999)}.media`);
    let srtInPath = path.join(tempPath, `${randomInt(999999)}.srt`);
    let srtOutPath = path.join(tempPath, `${randomInt(999999)}.srt`);
    
    await Promise.all([
     async ()=> { if (Buffer.isBuffer(video)) await fs.writeFile(videoPath, video); else videoPath = video },
     async ()=> { if (Buffer.isBuffer(srtIn)) await fs.writeFile(srtInPath, srtIn); else srtInPath = srtIn }
    ]);

    let command = `ffsubsync "${videoPath}" -i "${srtInPath}" -o "${srtOutPath}"`;
    // run command

    let srtOutBuffer = await fs.readFile(srtOutPath);
    return srtOutBuffer;
}