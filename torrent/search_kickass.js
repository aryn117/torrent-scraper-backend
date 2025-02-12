const cheerio = require('cheerio')
const axios = require('axios')


async function search_kickass(query, page = '1') {

    function changeDateFormat(duration) {
        const today = new Date();

        switch (duration.toLowerCase()) {
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
                const match = duration.match(/(\d+)(days|weeks|years)/);
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
                    default:
                        throw new Error(`Unsupported unit: ${unit}`);
                }
            }
        }

        return today.toLocaleDateString("en-GB", { year: "2-digit", month: "2-digit", day: "2-digit" }).replace(/\//g, "/"); // DD/MM/YY
    }

    // scrape the website
    var ALLTORRENT = [];
    let ALLURL = [];
    const url = "https://kickasstorrents.to/usearch/" + query + "/" + page + "/" + "?sortby=seeders&sort=desc";
    let html;
    try {

        html = await axios.get(url, headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36"
        });

    } catch {
        return null;
    }

    const $ = cheerio.load(html.data);

    $('tbody tr').each((i, element) => {
        if (i > 2) {
            let url = "https://kickasstorrents.to" + $(element).find('a.cellMainLink').attr('href');
            if (!url.endsWith('undefined')) {
                ALLURL.push(url);
                let torrent = {
                    "name": $(element).find('a.cellMainLink').text().trim(),
                    "size": $(element).find('td').eq(1).text().trim(),               
                    "dateuploaded": changeDateFormat($(element).find('td').eq(3).text().trim()),
                    "dateuploaded2": $(element).find('td').eq(3).text().trim(),
                    "seeders": $(element).find('td').eq(4).text().trim(),
                    "leechers": $(element).find('td').eq(5).text().trim(),
                    "url": url
                }
                ALLTORRENT.push(torrent);
            }
        }

    })

    await Promise.all(ALLURL.map(async (url) => {
    
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
            
                ALLTORRENT[i].magnet = $('a.giantButton').attr('href');            

            }
        }
    }))
    return ALLTORRENT;
}

module.exports = search_kickass;