import { URL } from "node:url";
import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const headers = {
    'User-Agent': 'FlyRankInternshipA9/1.0 (https://github.com/faugconti/flyrank-BE)'
}

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1000;
const FETCH_TIMEOUT_MS = 5000;

let pagesFetched = 0;
let cacheHits = 0;

export const getHtmlStats = () => ({ pagesFetched, cacheHits });

export const resetHtmlStats = () => {
    pagesFetched = 0;
    cacheHits = 0;
};

const fetchHtml = async (url) => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let response;
        pagesFetched++;
        try {
            response = await fetch(url, {
                headers,
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
            });
        } catch (err) {
            if (err.name === 'AbortError') {
                const timeoutErr = new Error(`timeout after ${FETCH_TIMEOUT_MS}ms`);
                timeoutErr.name = 'AbortError';
                if (attempt < MAX_ATTEMPTS) {
                    await sleep(RETRY_DELAY_MS);
                    continue;
                }
                throw timeoutErr;
            }
            throw err;
        }

        if (response.status === 200)
            return response;

        const err = new Error(`HTTP ${response.status}`);
        err.status = response.status;

        if (response.status >= 500 && response.status < 600) {
            if (attempt < MAX_ATTEMPTS) {
                await sleep(RETRY_DELAY_MS);
                continue;
            }
        }
        throw err;
    }
};

const getCachePath = url => {

    const parsed = new URL(url);

    if (parsed.pathname === "/" ||
        parsed.pathname === "/catalogue/page-1.html"
    )
        return "cache/catalogue-page-1.html";


    const match = parsed.pathname.match(/\/catalogue\/page-(\d+)\.html$/);

    if (match) {
        const pageNumber = match[1];
        return `cache/catalogue-page-${pageNumber}.html`;
    }

    if (parsed.pathname.startsWith("/catalogue/"))
        return `cache${parsed.pathname}`;


    throw new Error(`Don't know how to cache: ${url}`);


}

const getMetadataPath = (cacheFile) => {
    return cacheFile.replace(/\.html$/, ".meta.json");
};

export const getHTML = async (url) => {
    const cacheFile = getCachePath(url);
    const metadataFile = getMetadataPath(cacheFile);

    try {
        await access(cacheFile);
        console.log('CACHE HIT...');
        cacheHits++;
        const html = await readFile(cacheFile, "utf-8");
        const metadata = JSON.parse(await readFile(metadataFile, "utf-8"));
        return { html, fetched_at: metadata.fetched_at }

    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
    console.log('FETCH..');
    const response = await fetchHtml(url);

    const fetchedAt = new Date().toISOString();
    const html = await response.text();
    await mkdir(dirname(cacheFile), { recursive: true });
    await writeFile(cacheFile, html, 'utf-8');
    await writeFile(
        metadataFile,
        JSON.stringify(
            { fetched_at: fetchedAt },
            null,
            2
        ),
        "utf8"
    );
    await sleep(500);
    return { html, fetched_at: fetchedAt };

};
