const express = require('express');
const path = require('path');

const fetchFromAllProviders = require('./torrent/fetchFromAllProviders');

const search_1337x = require('./torrent/providers/search_1337x');
const search_torrentgalaxy = require('./torrent/providers/search_torrentgalaxy');
const search_rarbg = require('./torrent/providers/search_rarbg');
const search_kickass = require('./torrent/providers/search_kickass');
const search_limetorrents = require('./torrent/providers/search_limetorrents');
const search_torrentproject = require('./torrent/providers/search_torrentproject');


const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for all origins
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use('/api/:website/:query/:page?', async (req, res, next) => {
    // Destructure and normalize parameters
    const { website: rawWebsite, query, page } = req.params;
    const website = rawWebsite.toLowerCase();
    console.log(`API call: website=${website}, query=${query}, page=${page}`);

    // Helper to send error responses
    const sendError = (message) => res.json({ error: message });

    // Helper to process and respond with search results
    const processData = (providerName, data) => {
        if (data === null) {
            // Specific error message for 1337x
            if (providerName === '1337x') {
                return sendError(
                    '1337x returned NULL, This may be due to website blocking your IP or the site being unresponsive'
                );
            }
            return sendError('Website is blocked change IP');
        }
        if (Array.isArray(data) && data.length === 0) {
            return sendError(`No search result available for query (${query})`);
        }
        return res.send({ [providerName]: data });
    };

    try {
        switch (website) {
            case '1337x': {
                console.log(`Fetching from 1337x: query=${query}, page=${page}`);
                if (Number(page) > 50) {
                    return sendError('You have reached the maximum page limit. Please enter a page value less than 51.');
                }
                const data = await search_1337x(query, page);
                return processData('1337x', data);
            }
            case 'torrentgalaxy': {
                const data = await search_torrentgalaxy(query, page);
                return processData('torrentgalaxy', data);
            }
            case 'kickasstorrents': {
                const data = await search_kickass(query, page);
                return processData('kickasstorrents', data);
            }
            case 'rarbg': {
                const data = await search_rarbg(query, page);
                return processData('rarbg', data);
            }
            case 'limetorrents': {
                console.log(`Fetching from limetorrents: query=${query}, page=${page}`);
                const data = await search_limetorrents(query, page);
                return processData('limetorrents', data);
            }
            case 'torrentproject': {
                console.log(`Fetching from torrentproject: query=${query}, page=${page}`);
                const data = await search_torrentproject(query, page);
                return processData('torrentproject', data);
            }
            case 'all': {
                // Fetch data from all providers concurrently
                fetchFromAllProviders(query, page).then((data) => {
                    if (data && data.length > 0) {
                        res.send(data);
                    } else {
                        sendError(`No search result available for query (${query})`);
                    }
                });
                break;
            }
            default:
                return sendError('Invalid website parameter');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use('/', (req, res) => {
// send a response that server is running and a html page saying server is running

    res.send('Server is running');    
});

const PORT = process.env.PORT || 3001;
console.log('Listening on PORT : ', PORT);
app.listen(PORT);
