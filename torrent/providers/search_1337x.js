const cheerio = require('cheerio');
const axios = require('axios');



async function search_1337x(query = '', page = '1') {

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
            data[labels[i].toLowerCase()] = $list.text();
        })
        data.url = element

        allTorrent.push(data)
    }))

    return allTorrent
}
module.exports = search_1337x;