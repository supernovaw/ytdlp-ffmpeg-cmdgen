# ytdlp-ffmpeg-cmdgen
A simple SvelteKit application for generating shell commands that download and extract a specific range (optionally, audio-only) from a YouTube video.

Output commands example:

```
yt-dlp -x h5QRiLsQiZ8 -o h5QRiLsQiZ8.opus
ffmpeg -ss 37 -i h5QRiLsQiZ8.opus -t 107 'Reol - ミュータント Music Video (from 0:37 to 2:24).mp3'
```

Just made it for my non-tech-savvy relatives that asked me to do that task for them so they can easily handle it on their own :)

Note: yt-dlp doesn't have a working way of downloading a specific time range (as far as I know) so it downloads the video and then extracts the specified range from it.
