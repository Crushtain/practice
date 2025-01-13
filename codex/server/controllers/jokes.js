const axios = require("axios");
const cheerio = require("cheerio");

async function getJokes() {
    try {
        const jokesPromises = Array.from({length: 5}, () => {
            axios.get("https://www.anekdot.ru/random/anekdot/")
        });
        const responses = await Promise.all(jokesPromises)
        const jokes = responses.map(responses => {
            const data = cheerio.load(responses.data);
            return data(".text").first().text().trim();
        });
        let resJokes = jokes.map(joke => `<li>${joke}</li>`).join('<br>');
        return `<h1>Анекдоты:</h1>${resJokes}`;
    } catch (error) {
        console.error(error);
        throw new Error('Ошибка получения анекдотов');
    }
}
module.exports = getJokes;