const cheerio = require('cheerio');
const axios = require('axios');



async function search_1337x(query = '', page = '1') {


    function convertDateFormat(dateString) {

        // Normalize NBSP to a normal space
        dateString = dateString.replace(/\u00A0/g, "");
        dateString = dateString.replace(/\s/g, "");
        dateString = dateString.replace(/\./g, "'");

        const [month_temp, day_temp, year] = dateString.split("'");
        const day = day_temp.slice(0, 2);

        if(month_temp === "Jan") month = "01";
        if(month_temp === "Feb") month = "02";
        if(month_temp === "Mar") month = "03";
        if(month_temp === "Apr") month = "04";
        if(month_temp === "May") month = "05";
        if(month_temp === "Jun") month = "06";
        if(month_temp === "Jul") month = "07";
        if(month_temp === "Aug") month = "08";
        if(month_temp === "Sep") month = "09";
        if(month_temp === "Oct") month = "10";
        if(month_temp === "Nov") month = "11";
        if(month_temp === "Dec") month = "12";
        

        console.log(`${day}/${month}/${year}`)

        return `${day}/${month}/${year}`;
    }

    // scrape 1337x.to /////////////////////////
    const allTorrent = [];
    let html;
    const url = 'https://1337xx.to/search/' + query + '/' + page + '/';
    try {
        html = await axios.get(url);
    } catch {
        return null;
    }

    const $ = cheerio.load(html.data)

    const links = $('td.name').map((_, element) => {
        var link = 'https://1337xx.to' + $(element).find('a').next().attr('href');
        return link;

    }).get();


    await Promise.all(links.map(async (element) => {

        const data = {};
        const labels = ['Category', 'Type', 'Language', 'Size', 'UploadedBy', 'Downloads', 'LastChecked', 'DateUploaded', 'Seeders', 'Leechers'];
        let html;
        try {
            html = await axios.get(element);
        } catch {
            return null;
        }
        const $ = cheerio.load(html.data);

        data.name = $('.box-info-heading h1').text().trim();
        data.magnet = $('.clearfix ul li a').attr('href') || "";
        const poster = $('div.torrent-image img').attr('src');

        $('div .clearfix ul li > span').each((i, element) => {

            $list = $(element);

            const label = labels[i].toLowerCase();
            const label_text = $list.text();

            if (label == 'type') return;
            if (label == 'category') return;
            if (label == 'downloads') return;
            if (label == 'lastchecked') return;
            if (label == 'language') return;
            if (label == 'uploadedby') return;


            if (label == 'dateuploaded') {
                data[label] = convertDateFormat(label_text)
                return;
            }

            data[label] = label_text;
        })
        data.url = element

        allTorrent.push(data)
    }))

    return allTorrent
}
module.exports = search_1337x;