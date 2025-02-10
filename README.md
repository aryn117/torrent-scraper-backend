# Torrent Aggregator Backend

Unofficial API for scraping torrents from supported websites. This can be hosted on vercel.



## 🤔API Methods

Currently 6 websites are supported.
keywords for each website are

| Site Name | Site Keyword for API Call |
|---|---|
| 1337x |1337x|
| TorrentGalaxy |torrentgalaxy|
| TorrentProject |torrentproject|
| Rarbg |rarbg |
| Kickass Torrents | kickasstorrents|
| LimeTorrent |limetorrents |


## API Reference
<br>

> Generic Request format

```
YOUR_SERVER_ADDRESS/{website_keyword}/{query}/{page(optional)}
```

> 1337x

REQUEST

```
YOUR_SERVER_ADDRESS/api/1337x/avengers/1
```

RESPONSE

```
{
    "1337x": [
        {
            "name": "Avengers Endgame.2019.1080p.HDRip.X264.AC3-EVO[TGx]",
            "magnet": "LINK....",
            "category": "Movies",
            "type": "HD",
            "language": "English",
            "size": "10.7 GB",
            "uploadedby": "abcdef",
            "downloads": "8522",
            "lastchecked": "Jul. 29th  '19",
            "dateuploaded": "Jul. 28th  '19",
            "seeders": "4533",
            "leechers": "4211",
            "url": "url_link"
        },

        ... 2
    ]
}

```

### Rarbg

```
YOUR_SERVER_ADDRESS/api/rarbg/avengers/1
```

### LimeTorrents

```
YOUR_SERVER_ADDRESS/api/limetorrents/dexter/2
```

### Kickass Torrents

```
YOUR_SERVER_ADDRESS/api/kickasstorrents/avengers/1
```

### Torrent Galaxy

```
YOUR_SERVER_ADDRESS/api/torrentgalaxy/ncis/3
```

### Torrent Project

```
YOUR_SERVER_ADDRESS/api/torrentproject/burn notice/1
```
### Search All

REQUEST
```
YOUR_SERVER_ADDRESS/api/all/burn notice/1
```
RESPONSE
```
{
  "1337x" : [...],
  "limetorrents" : [...],
  "rarbg" : [...],
  "torrentgalayx" : [...],
  "torrentproject" : [...],
  "kickasstorrents" : [...],

}
```

## 🔏Keywords

## ©️ Credit

> [theriturajps](https://github.com/theriturajps) | Original Project
