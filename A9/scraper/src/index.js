
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

getRobots();