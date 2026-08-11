import * as cheerio from "cheerio";
import { getHTML } from "./getHtml.js";

export const crawlCatalogue = async (base_url, page_limit = 3) => {
    let currentPageUrl = base_url;
    let pageNumber = 0;

    const books = new Map();

    while (currentPageUrl && pageNumber < page_limit) {
        pageNumber++;
        const { html } = await getHTML(currentPageUrl);
        const $ = cheerio.load(html);

        $("article.product_pod h3 a").each((_, element) => {
            const href = $(element).attr("href");
            const bookUrl = new URL(href, currentPageUrl).href;
            if (href) {
                books.set(bookUrl, {
                    product_url: bookUrl,
                    source_page: currentPageUrl
                });
            }
        });

        const nextHref = $("ul.pager li.next a").attr("href");
        if (nextHref) {
            currentPageUrl = new URL(nextHref, currentPageUrl).href;
        } else {
            currentPageUrl = null;
        }
    }

    return [...books.values()];
}