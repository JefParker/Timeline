const fs = require('fs');
const https = require('https');

function queryWikidata(sparql) {
    return new Promise((resolve, reject) => {
        const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
        const options = {
            headers: {
                'User-Agent': 'TimelineGame/1.0 (test@example.com)'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Status: ${res.statusCode} ${data}`));
                }
            });
        }).on('error', reject);
    });
}

const query = `
SELECT ?item ?itemLabel ?date WHERE {
  ?item wdt:P31 wd:Q11424; # Instance of film
        wdt:P577 ?date.    # Publication date
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 10
`;

queryWikidata(query).then(data => {
    console.log(JSON.stringify(data.results.bindings.map(b => ({
        event: b.itemLabel.value,
        year: new Date(b.date.value).getFullYear()
    })), null, 2));
}).catch(console.error);
