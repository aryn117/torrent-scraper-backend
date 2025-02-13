const cheerio = require('cheerio');
const axios = require('axios');

async function search_torrentgalaxy(query = '', page = '0') {


    if(page !== '0'){
        try{
            page = Number(page) - 1;
        }catch{
            //
        }
    }
    const allTorrents = [];
    const url = "https://torrentgalaxy.to/torrents.php?search=" + query + "&sort=seeders&order=desc&page=" + page;
    let html;
    try{
        html = await axios.get(url);
    }catch{
        return null;
    }
    
    const $ = cheerio.load(html.data);

    $('div.tgxtablerow.txlight').each((i, element) => {
        const data = {};
   
        data.name = $(element).find(":nth-child(4) div a b").text();
     
        data.dateuploaded = ($(element).find(":nth-child(12)").text()).split(" ")[0].toString();
       
        data.url = "https://torrentgalaxy.to" + $(element).find("a.txlight").attr('href');
        data.size = $(element).find(':nth-child(8)').text();
        data.seeders = $(element).find(':nth-child(11) span font:nth-child(1)').text().replace(/[\.,]/g);
        data.leechers = $(element).find(':nth-child(11) span font:nth-child(2)').text();
        data.torrent = $(element).find(".tgxtablecell.collapsehide.rounded.txlight a").attr("href");
        data.magnet = $(element).find(".tgxtablecell.collapsehide.rounded.txlight a").next().attr("href");
        allTorrents.push(data);
    })
    return allTorrents;
}
module.exports = search_torrentgalaxy