export interface ffsOptions {
    /**
     * Which stream/track in the video file to use as reference, formatted according to ffmpeg conventions.
     * Examples: '0:s:0' (first subtitle track), 'a:3' (third audio track), 's:2' (third subtitle track)
     */
    "reference-stream"?: string;

    /**
     * Maximum duration (seconds) for a subtitle to appear on-screen
     * @default 10
     */
    "max-subtitle-seconds"?: number;

    /**
     * Start time (seconds) for processing
     * @default 0
     */
    "start-seconds"?: number;

    /**
     * Maximum allowed offset (seconds) for subtitle synchronization
     * @default 60
     */
    "max-offset-seconds"?: number;

    /**
     * Predefined offset (seconds) to apply to all subtitle segments
     * @default 0
     */
    "apply-offset-seconds"?: number;

    /**
     * Frame rate for audio extraction (Hz)
     * @default 48000
     */
    "frame-rate"?: number;

    /**
     * Skip framerate ratio inference based on duration ratio
     * @default false
     */
    "skip-infer-framerate-ratio"?: boolean;

    /**
     * Numeric label for non-speech frames
     * @default 0.0
     */
    "non-speech-label"?: number;

    /**
     * Output subtitle encoding. Use "same" to preserve input encoding.
     * @default "utf-8"
     */
    "output-encoding"?: string;

    /**
     * Reference subtitle encoding (autodetected if not specified)
     * @default "infer"
     */
    "reference-encoding"?: string;

    /**
     * Voice activity detection algorithm to use
     * @default "subs_then_webrtc"
     */
    "vad"?: "subs_then_webrtc" | "webrtc" | "subs_then_auditok" | "auditok" | "subs_then_silero" | "silero";

    /**
     * Disable framerate mismatch correction
     * @default false
     */
    "no-fix-framerate"?: boolean;

    /**
     * Serialize reference speech data to numpy array
     * @default false
     */
    "serialize-speech"?: boolean;

    /**
     * Extract subtitles from specified stream instead of syncing
     */
    "extract-subs-from-stream"?: string;

    /**
     * Suppress output if calculated offset is below this threshold (seconds)
     */
    "suppress-output-if-offset-less-than"?: number;

    /**
     * Custom path to ffmpeg/ffprobe executables
     */
    "ffmpeg-path"?: string;

    /**
     * Directory path for saving log files
     */
    "log-dir-path"?: string;

    /**
     * Use golden-section search for framerate ratio optimization
     * @default false
     */
    "gss"?: boolean;

    /**
     * Enable strict parsing of SRT files
     * @default false
     */
    "strict"?: boolean;
}