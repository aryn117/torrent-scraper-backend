const cheerio = require('cheerio')
const axios = require('axios')


async function search_rarbg(query, page = '1') {
    const ALLURLARRAY = [];
    var ALLTORRENT = [];
    const url = "https://rargb.to/search/" + page + "/?search=" + query + "&order=seeders&by=DESC";
    let html;
    try {
        html = await axios.get(url, headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36"
        });

    } catch {
        return null;
    }

    const $ = cheerio.load(html.data);

    $('table.lista2t tbody').each((_, element) => {
        $('tr.lista2').each((_, el) => {
            const data = {};
            const td = $(el).children('td');
          
            data.name = $(td).eq(1).find('a').attr('title');
            data.dateuploaded =  $(td).eq(3).text().split(" ")[0].split("-")[2] + "/" + $(td).eq(3).text().split(" ")[0].split("-")[1] + "/" + $(td).eq(3).text().split(" ")[0].split("-")[0].substring(2);
            data.size = $(td).eq(4).text();
            data.seeders = $(td).eq(5).find('font').text();
            data.leechers = $(td).eq(6).text();
            data.url = "https://rargb.to" + $(td).eq(1).find('a').attr('href');
            ALLURLARRAY.push(data.url);
            ALLTORRENT.push(data);

        })
    });

    await Promise.all(ALLURLARRAY.map(async (url) => {
        for (let i = 0; i < ALLTORRENT.length; i++) {
            if (ALLTORRENT[i]['url'] === url) {
                let html;
                try {
                    html = await axios.get(url, headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36"
                    });
                } catch {
                    return null;
                }

                let $ = cheerio.load(html.data);

                ALLTORRENT[i].magnet = $("tr:nth-child(1) > td:nth-child(2) > a:nth-child(3)").attr('href');
            }
        }

    }))
    return ALLTORRENT;
}
module.exports = search_rarbg;