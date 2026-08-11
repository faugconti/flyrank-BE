import { URL } from "node:url";
import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const headers = {
    'User-Agent': 'FlyRankInternshipA9/1.0 (https://github.com/faugconti/flyrank-BE)'
}

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

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
        const html = await readFile(cacheFile, "utf-8");
        const metadata = JSON.parse(await readFile(metadataFile, "utf-8"));
        return { html, fetched_at: metadata.fetched_at }

    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
    console.log('FETCH..');
    const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(5000)
    });

    if (response.status !== 200)
        throw new Error(`HTTP ${response.status}`);

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
