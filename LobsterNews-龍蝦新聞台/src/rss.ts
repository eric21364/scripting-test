import { fetch } from "scripting";
import { NewsItem, NEWS_RSS_URL } from "./types";

function extractTag(xml: string, tag: string): string {
    const open = `<${tag}>`;
    const openCdata = `<${tag}><![CDATA[`;
    const close = `</${tag}>`;

    let start = xml.indexOf(openCdata);
    if (start >= 0) {
        start += openCdata.length;
        const end = xml.indexOf(`]]>${close}`, start);
        return end >= 0 ? xml.substring(start, end).trim() : "";
    }

    start = xml.indexOf(open);
    if (start >= 0) {
        start += open.length;
        const end = xml.indexOf(close, start);
        return end >= 0 ? xml.substring(start, end).trim() : "";
    }

    return "";
}

function extractSource(xml: string): string {
    const match = xml.match(/<source[^>]*>([^<]*)<\/source>/);
    return match ? match[1].trim() : "";
}

export async function fetchNews(limit: number = 15): Promise<NewsItem[]> {
    const response = await fetch(NEWS_RSS_URL, {
        timeout: 10,
        debugLabel: "LobsterNews",
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const items: NewsItem[] = [];

    let cursor = 0;
    while (items.length < limit) {
        const itemStart = xml.indexOf("<item>", cursor);
        if (itemStart < 0) break;
        const itemEnd = xml.indexOf("</item>", itemStart);
        if (itemEnd < 0) break;

        const block = xml.substring(itemStart, itemEnd + 7);
        const title = extractTag(block, "title");
        const link = extractTag(block, "link");
        const pubDate = extractTag(block, "pubDate");
        const source = extractSource(block);

        if (title && title !== "Google 新聞") {
            items.push({ title, link, pubDate, source });
        }

        cursor = itemEnd + 7;
    }

    return items;
}
