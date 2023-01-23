<script lang="ts">
    import loadVideoDetails from "$lib/videoDetailsLoader";
    import generateCommand from "$lib/generateCommand";
    import { fly } from "svelte/transition";

    let url: string = "";
    let timestampStart: string = "";
    let timestampEnd: string = "";
    let extractAudio: boolean = true;

    let videoDetails: {
        title: string;
        imageUrl: string;
        author: string;
    } | null = null;

    let videoId: string | undefined;
    let parsedStart: number | undefined;
    let parsedEnd: number | undefined;

    $: videoId = parseVideoId(url);
    $: parsedStart = parseTimestamp(timestampStart);
    $: parsedEnd = parseTimestamp(timestampEnd);
    $: isRangeValid =
        parsedStart !== undefined && parsedEnd !== undefined
            ? parsedStart < parsedEnd
            : false;

    function parseVideoId(url: string): string | undefined {
        const videoIdMatch = url.match(/v=([0-9a-zA-Z_-]{11})/)?.[1];
        if (!videoIdMatch) return;

        // If ID changed, fetch new video details and assign
        if (videoId !== videoIdMatch)
            loadVideoDetails(videoIdMatch).then((d) => (videoDetails = d));

        return videoIdMatch;
    }

    function parseTimestamp(timestamp: string): number | undefined {
        let match: RegExpMatchArray | null;
        if ((match = timestamp.match(/^\d+$/))) {
            // just a number
            return +timestamp;
        }
        if ((match = timestamp.match(/^(\d+):(\d\d)$/))) {
            // minutes:ss
            const min = +match[1];
            const sec = +match[2];
            return 60 * min + sec;
        }
        if ((match = timestamp.match(/^(\d+):(\d\d):(\d\d)$/))) {
            // hours:mm:ss
            const hr = +match[1];
            const min = +match[2];
            const sec = +match[3];
            return 3600 * hr + 60 * min + sec;
        }
    }

    let pre: HTMLPreElement | undefined;
    function copyCommand() {
        if (command !== null) navigator.clipboard.writeText(command);
        pre?.classList.add("copy-animation");
        setTimeout(() => pre?.classList.remove("copy-animation"), 500);
    }

    let command: string | null = null;
    $: command = generateCommand(
        videoId,
        parsedStart,
        parsedEnd,
        extractAudio,
        videoDetails?.title
    );
</script>

<main>
    <input
        placeholder="YouTube video URL"
        bind:value={url}
        aria-invalid={videoId === undefined}
    />
    <div class="timestamps">
        <input
            placeholder="Start timestamp"
            bind:value={timestampStart}
            aria-invalid={parsedStart === undefined}
        />
        <input
            placeholder="End timestamp"
            bind:value={timestampEnd}
            aria-invalid={parsedEnd === undefined || !isRangeValid}
        />
    </div>
    <label>
        <input
            name="extract-audio"
            value={false}
            bind:group={extractAudio}
            type="radio"
        />
        Audio and video
    </label>
    <label>
        <input
            name="extract-audio"
            value={true}
            bind:group={extractAudio}
            type="radio"
        />
        Audio only
    </label>

    {#if videoDetails !== null && videoId !== undefined}
        <div
            in:fly={{ duration: 200, y: 100 }}
            out:fly={{ duration: 200, y: 100 }}
            class="video-details"
            style={`--thumbnail: url('${videoDetails.imageUrl}')`}
        >
            {videoDetails.title}
            <div class="author">by {videoDetails.author}</div>
        </div>
    {/if}

    {#if command}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <pre
            in:fly={{ duration: 200, y: 100 }}
            out:fly={{ duration: 200, y: 100 }}
            on:click={copyCommand}
            bind:this={pre}>{command}</pre>
    {/if}
</main>

<style>
    .timestamps {
        display: flex;
        gap: 16px;
    }

    .video-details {
        background: linear-gradient(#000a, #000a), var(--thumbnail);
        background-position: center;
        background-size: cover;
        aspect-ratio: 16 / 9;
        width: 500px;
        border-radius: 10px;
        box-shadow: 0 2px 5px black;
        margin: 16px auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 1.5em;
        text-align: center;
        user-select: none;
    }

    .video-details .author {
        opacity: 80%;
        font-size: 60%;
        font-style: italic;
    }

    pre {
        background-color: black;
        color: #8ed781;
        padding: 8px;
        white-space: pre-wrap;
        width: 500px;
        margin: auto;
        font-family: "SF Mono", monospace;
        cursor: pointer;
    }

    pre::selection {
        background-color: #49743e;
        color: #55ff18;
    }

    pre:global(.copy-animation) {
        animation: copy-animation 0.5s;
    }

    @keyframes copy-animation {
        0% {
            color: #8ed781;
            background-color: black;
        }
        50% {
            color: white;
            background-color: #222;
        }
        100% {
            color: #8ed781;
            background-color: black;
        }
    }
</style>
