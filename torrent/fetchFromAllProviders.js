const search_1337x = require("./providers/search_1337x");
const search_torrentgalaxy = require("./providers/search_torrentgalaxy");
const search_rarbg = require("./providers/search_rarbg");
const search_kickass = require("./providers/search_kickass");
const search_limetorrents = require("./providers/search_limetorrents");
const search_torrentproject = require("./providers/search_torrentproject");


async function fetchFromAllProviders(query, page = 1) {
    console.log(
        `======\nFetching from all providers\nquery: ${query} page: ${page}\n======`
    );
    if (query === undefined || query === null || query === "") {
        throw new Error("Query is empty");
    }

    let comboTorrent = [];
    const [
        res_1337x,
        res_torrentgalaxy,
        res_rarbg,
        res_kickass,
        res_limetorrents,
        res_torrentproject,
     
    ] = await Promise.all([
        search_1337x(query, page),
        search_torrentgalaxy(query, page),
        search_rarbg(query, page),
        search_kickass(query, page),
        search_limetorrents(query, page),
        search_torrentproject(query, page),

    ]);

    if (res_1337x !== null && res_1337x.length > 0) {
        comboTorrent.push({ "1337x": res_1337x });
    }

    if (res_rarbg !== null && res_rarbg.length > 0) {
        comboTorrent.push({ rarbg: res_rarbg });
    }
    if (res_kickass !== null && res_kickass.length > 0) {
        comboTorrent.push({ kickass: res_kickass });
    }
    if (res_limetorrents !== null && res_limetorrents.length > 0) {
        comboTorrent.push({ limetorrents: res_limetorrents });
    }

    if (res_torrentgalaxy !== null && res_torrentgalaxy.length > 0) {
        comboTorrent.push({ torrentgalaxy: res_torrentgalaxy });
    }

    if (res_torrentproject !== null && res_torrentproject.length > 0) {
        comboTorrent.push({ torrentproject: res_torrentproject });
    }

 

    return comboTorrent;
}

module.exports = fetchFromAllProviders;
