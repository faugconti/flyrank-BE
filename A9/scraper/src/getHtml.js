import { URL } from "node:url";
import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const headers = {
    'User-Agent': 'FlyRankInternshipA9/1.0 (https://github.com/faugconti/flyrank-BE)'
}

const getCachePath = url => {

    const parsed = new URL(url);

    if (parsed.pathname === "/" ||
        parsed.pathname === "/catalogue/page-1.html"
    ) {
        return "cache/catalogue-page-1.html";
    }

    const match = parsed.pathname.match(/\/catalogue\/page-(\d+)\.html$/);

    if (match) {
        const pageNumber = match[1];

        return `cache/catalogue-page-${pageNumber}.html`;
    }

    throw new Error(`dont know how to cache: ${url}`);

}


export const getHTML = async (url) => {

    const cacheFile = getCachePath(url);
    try {
        await access(cacheFile);
        console.log('CACHE HIT...');
        return await readFile(cacheFile, "utf-8");
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

    const html = await response.text();
    await mkdir(dirname(cacheFile), { recursive: true });
    await writeFile(cacheFile, html, 'utf-8');
    return html;

};
