const cheerio = require('cheerio')
const axios = require('axios')

async function search_piratebay(query, page = '1') {

    console.log(`Fetching from piratebay: query=${query}, page=${page}`);



    function convertToDDMM(dateString) {
        const  splitString = dateString
            .replace(/\u00A0/g, " ") // Replace NBSP with space
            .replace(/\-/g, " ") // Replace dash with space
            .replace(/\:/g, " ") // Replace colon with space
            .split(" ");   
        
        if(splitString.length === 3)
            // If the date string is in the format 'DD-MM-YYYY' or 'DD MM YYYY'
            return `${splitString[0]}/${splitString[1]}/${splitString[2]}`;
        
        if(splitString.length === 4)     
            // If the date string is in the format 'DD/MM HH:MM'
            return `${splitString[1]}/${splitString[0]}/${new Date().getFullYear().toString().slice(-2)}`;        

        // If the date string is in the wrong format, return a default value
        return '00/00/00';
    }
      
      
	const allTorrents = [];
	const url = 'https://tpirbay.xyz/search/' + query + '/' + page + '/99/0';

	let html;
	try {
		html = await axios.get(url);
	} catch(error) {
        console.log("Fetched from Pirate Bay, ERROR===========", error);
		return null;
	}
	const $ = cheerio.load(html.data)

	$("table#searchResult tr").each((_, element) => {
		const data = $(element).find('font.detDesc').text().replace(/(Size|Uploaded)/gi, '').replace(/ULed/gi, 'Uploaded').split(',').map(value => value.trim());
		const date = data[0]
		const size = data[1]
	

		const torrent = {
			name: $(element).find('a.detLink').text(),
			size: size,
			dateuploaded: convertToDDMM(date),		
			seeders: $(element).find('td').eq(2).text(),
			leechers: $(element).find('td').eq(3).text(),		
			url: $(element).find('a.detLink').attr('href'),
			magnet: $(element).find("td div.detName").next().attr('href')
		}

		if (torrent.name.length) {
			allTorrents.push(torrent)
		}
	})

	return allTorrents
}

module.exports = search_piratebay