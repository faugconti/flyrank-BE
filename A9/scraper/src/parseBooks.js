import { getHTML } from "./getHtml.js";
import * as cheerio from "cheerio";

export const parseBooks = async (books) => {
    const records = [];

    for (const book of books) {
        const { html, fetched_at } = await getHTML(book.product_url);
        const record = await parseBook(html, { ...book, fetched_at });
        records.push(record);
    }
    return records;

}

const parsePriceGbp = (text) => {
    if (!text) return null;
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : null;
};

const parseBook = async (html, { product_url, source_page, fetched_at }) => {
    const $ = cheerio.load(html);
    const product = $("article.product_page");

    const descriptionElement = product.find('#product_description + p');
    const description = descriptionElement.length
        ? descriptionElement.text().trim()
        : null;

    const priceText = product.find(".price_color").first().text().trim() || null;

    const record = {
        title: product.find('h1').text() || null,
        product_url,
        price_text: priceText,
        price_gbp: parsePriceGbp(priceText),
        availability_text: product.find("p.availability").first().text().trim() || null,
        rating_text: product.find('.star-rating').attr("class").split(' ').at(-1) || null,
        description,
        source_page,
        fetched_at
    };

    return record;


};