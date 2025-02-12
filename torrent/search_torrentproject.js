const cheerio = require('cheerio')
const axios = require('axios')

async function search_torrentproject(query, page = '0') {

    function changeDateFormat(t) {
        const duration = (t.split(" ")[0] + t.split(" ")[1]).toLowerCase();

        const today = new Date();

        switch (duration.toLowerCase()) {
            case "justnow":
                break; // No change
            case "today":
                break; // No change
            case "yesterday":
                today.setDate(today.getDate() - 1);
                break;
            case "thisweek":
                today.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
                break;
            case "lastweek":
                today.setDate(today.getDate() - today.getDay() - 7); // Start of last week
                break;
            case "lastmonth":
                today.setMonth(today.getMonth() - 1);
                today.setDate(1); // Start of last month
                break;
            default: {
                const match = duration.match(/(\d+)(days|weeks|years|year)/);
                if (!match) {
                    return duration;
                }

                const [_, value, unit] = match;
                const num = parseInt(value, 10);

                switch (unit) {
                    case "days":
                        today.setDate(today.getDate() - num);
                        break;
                    case "weeks":
                        today.setDate(today.getDate() - num * 7);
                        break;
                    case "years":
                        today.setFullYear(today.getFullYear() - num);
                        break;
                    case "year":
                        today.setFullYear(today.getFullYear() - 1);
                        break;
                    default:
                        throw new Error(`Unsupported unit: ${unit}`);
                }
            }
        }

        return today.toLocaleDateString("en-GB", { year: "2-digit", month: "2-digit", day: "2-digit" }).replace(/\//g, "/"); // DD/MM/YY
    }



    // scrape torrent project
    var ALLTORRENT = [];
    var ALLURL = [];
    const url = `https://torrentproject2.com/?t=${query}&p=${page}&orderby=seeders`;
    let html;
    try {

        html = await axios.get(url, headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36"
        });

    } catch {
        return null;
    }

    const $ = cheerio.load(html.data);

    $('.tt div').each((i, element) => {

        if (i > 1) {
            let url = "https://torrentproject2.com" + $(element).find('span').eq(0).find('a').attr('href');
            ALLURL.push(url);
            let torrent = {
                'name': $(element).find('span:nth-child(1)').text().trim(),
                'seeders': $(element).find('span:nth-child(2)').text().trim(),
                'leechers': $(element).find('span:nth-child(3)').text().trim(),
                'dateuploaded': changeDateFormat($(element).find('span:nth-child(4)').text().trim()),
                'size': $(element).find('span:nth-child(5)').text(),
                'url': url
            }
            if (torrent.name !== '') {
                ALLTORRENT.push(torrent);
            }
        }
    })

    await Promise.all(ALLURL.map(async url => {
        for (let i = 0; i < ALLTORRENT.length; i++) {
            if (ALLTORRENT[i]['url'] === url) {
                let html;
                try {
                    html = await axios.get(url, headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36"
                    });
                } catch {
                    return;
                }
                const $ = cheerio.load(html.data);
                let magnet = $('.usite a').attr('href');
                let startMagnetIdx = magnet.indexOf('magnet');
                magnet = magnet.slice(startMagnetIdx);
                ALLTORRENT[i].magnet = decodeURIComponent(magnet);

            }
        }

    }))

    return ALLTORRENT;
}


module.exports = search_torrentproject;