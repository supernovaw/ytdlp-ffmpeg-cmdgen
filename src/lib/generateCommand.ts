export default function generateCommand(
    videoId: string | undefined,
    start: number | undefined,
    end: number | undefined,
    extractAudio: boolean,
    videoTitle: string | undefined,
): string | null {
    if (undefined === videoId) return null;
    if (undefined === start) return null;
    if (undefined === end) return null;
    if (start >= end) return null;
    return gen(videoId, start, end, extractAudio, videoTitle);
}

function gen(
    videoId: string,
    start: number,
    end: number,
    extractAudio: boolean,
    videoTitle: string | undefined,
): string {
    const dlFormat = extractAudio ? ".opus" : ".webm";
    const dlFile = videoId + dlFormat; // file where video is downloaded before trimming
    const finalFile = getFinalFilename(videoId, start, end, extractAudio, videoTitle);
    const duration = end - start;

    // e.g. yt-dlp -x abc_012-DEF -o abc_012-DEF.opus
    let ytDlpCmd = ["yt-dlp"];
    if (extractAudio) ytDlpCmd.push("-x");
    ytDlpCmd.push(videoId, "-o", dlFile);

    // e.g. ffmpeg -ss 105 -i abc_012-DEF.opus -t 60 abc_012-DEF.mp3
    let ffmpegCmd = ["ffmpeg"];
    ffmpegCmd.push("-ss", start.toString());
    ffmpegCmd.push("-i", dlFile);
    if (!extractAudio) ffmpegCmd.push("-c copy") // do not transcode if video
    ffmpegCmd.push("-t", duration.toString());
    ffmpegCmd.push(finalFile);

    const cmds = [
        ytDlpCmd.join(" "),
        ffmpegCmd.join(" "),
    ];
    return cmds.join("\n");
}

// Returns a string that can be used as a command argument without additional escaping
function getFinalFilename(
    videoId: string,
    start: number,
    end: number,
    extractAudio: boolean,
    videoTitle: string | undefined,
): string {
    const baseName = videoTitle ? sanitizeFilenameString(videoTitle) : videoId;
    const format = extractAudio ? "mp3" : "mp4";
    const range = `(from ${formatTimetamp(start)} to ${formatTimetamp(end)})`;
    return `'${baseName} ${range}.${format}'`;
}

function sanitizeFilenameString(input: string) {
    const unsafeCharMatcher = /[\/\\?%*:|"'<>]/g;
    return input.replace(unsafeCharMatcher, "");
}

function formatTimetamp(seconds: number) {
    const minutesTotal = seconds / 60;
    const hoursTotal = minutesTotal / 60;

    const toInt = (n: number) => (n - n % 1).toFixed();
    const prependZero = (s: string) => s.length === 1 ? "0" + s : s;

    let secondsFormatted = prependZero(toInt(seconds % 60));
    let minutesFormatted = toInt(minutesTotal % 60);
    const hoursFormatted = hoursTotal.toFixed();

    if (hoursTotal >= 1) return hoursFormatted + ":" + prependZero(minutesFormatted) + ":" + secondsFormatted;
    return minutesFormatted + ":" + secondsFormatted;
}
