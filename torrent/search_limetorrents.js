const cheerio = require('cheerio')
const axios = require('axios')


async function search_limetorrents(query, page = '1') {
   
    function changeDateFormat(t) {
        const duration = (t.split(" ")[0] + t.split(" ")[1]).toLowerCase();    
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



    // scraping lime torrents

    const ALLTORRENT = [];
    const ALLURL = [];

    const url = `https://www.limetorrents.pro/search/all/${query}/seeds/${page}/`;
    let html;
    try {

        html = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36"
            }
        });

    } catch (error) {
        console.error(error)
        return null;
    }

    const $ = cheerio.load(html.data);

    // Select all rows in the table
    $('.table2 tbody tr').each((i, element) => {
        // Skip the first row which is the header
        if (i > 0) {

            // Extract the torrent data from the row
            let torrent = {
                "name": $(element).find('div.tt-name').text().trim(),
                "dateuploaded": changeDateFormat($(element).find('td').eq(1).text().trim()),
                "size": $(element).find('td').eq(2).text().trim(),
                "seeders": $(element).find('td').eq(3).text().trim(),
                "leechers": $(element).find('td').eq(4).text().trim(),
                "torrent": $(element).find('div.tt-name a').attr('href'),
                "url": "https://www.limetorrents.pro" + $(element).find('div.tt-name a').next().attr('href')
            }
            // Store the torrent data in the ALLTORRENT array and ALLURL array
            ALLURL.push(torrent.url);
            ALLTORRENT.push(torrent);
        }

    })

    // Use Promise.all to fetch all the magnet links in parallel
    await Promise.all(ALLURL.map(async (url) => {
        for (let i = 0; i < ALLTORRENT.length; i++) {
            if (ALLTORRENT[i]['url'] === url) {
                let html;
                try {
                    html = await axios.get(url, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36"
                        }
                    });
                } catch {
                    return;
                }
                const $ = cheerio.load(html.data);

                // to filter magnet link from torrent-file link (both links share same classname)
                // Filter only magnet links
                const magnetLink = $('.dltorrent a').filter((i, el) => {
                    const href = $(el).attr('href');
                    return href && href.startsWith('magnet:?'); // Filter only magnet links
                }).attr('href');


                ALLTORRENT[i].magnet = magnetLink;


            }
        }
    }))



    return ALLTORRENT;

}
module.exports = search_limetorrents