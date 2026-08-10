import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const headers = {
    'User-Agent': 'FlyRankInternshipA9/1.0 (https://github.com/faugconti/flyrank-BE)'
}

const CATALOGUE_URL = 'https://books.toscrape.com/';

async function getRobots() {
    try {
        const res = await fetch('https://books.toscrape.com/robots.txt');
        if (!res.ok) {
            if (res.status == 404)
                throw new Error('no robots file found');
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const content = await res.text();
        console.log(content);
    } catch (error) {
        console.error(error);
    }
}

async function getHtml(url, cacheFile) {
    try {
        await access(cacheFile);
        console.log('CACHE HIT...');
        return await readFile(cacheFile, "utf-8");
    }
    catch (err) {
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
}

await getHtml(CATALOGUE_URL, 'cache/catalogue-page-1.html');