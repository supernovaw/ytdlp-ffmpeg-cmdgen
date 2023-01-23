const detailsFetchUrl = "https://noembed.com/embed?url=https://www.youtube.com/watch?v=";

type ReturnType = Promise<{
    title: string,
    imageUrl: string,
    author: string
} | null>

export default async function loadVideoDetails(id: string): ReturnType {
    if (id.match(/^[0-9a-zA-Z_-]{11}$/) === null) return null;
    let json;
    try {
        const details = await fetch(detailsFetchUrl + id);
        json = await details.json();
    } catch (e) {
        console.log("fetch failed", e);
        return null;
    }
    const valid = isJsonValid(json);
    if (!valid) {
        console.log("fetch result failed validation", json);
        return null;
    }

    return {
        title: json.title,
        imageUrl: json.thumbnail_url,
        author: json.author_name,
    };
}

function isJsonValid(json: any): true | void {
    if (!json) return;
    const { title, thumbnail_url, author_name } = json;
    if (typeof title !== "string") return;
    if (typeof thumbnail_url !== "string") return;
    if (!thumbnail_url.match(/^https:\/\/i\.ytimg\.com\/vi\/[0-9a-zA-Z_-]{11}\/hqdefault\.jpg$/))
        return;
    if (typeof author_name !== "string") return;
    return true;
}
