require('dotenv').config();
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const haversine = require('haversine');

const parseCities = () => new Promise((resolve, reject) => {
    const cities = {};
    fs.createReadStream(path.resolve(__dirname, 'cities.csv'))
            .pipe(csv.parse({ headers: false }))
            .on('error', error => reject(error))
            .on('data', row => {
                if (cities[row[0]] === undefined)
                    cities[row[0]] = {};
                if (cities[row[1]] === undefined)
                    cities[row[1]] = {};
            })
            .on('end', rowCount => resolve(cities));
});

(async function() {
    try {
        const key = process.env.BING_MAPS_KEY;

        const cities = await parseCities();
        console.log(cities);

        let result = await axios.get(`https://dev.virtualearth.net/REST/v1/Locations?countryRegion=IT&locality=Milano&key=${ key }`);
        const start = {
            latitude: result.data.resourceSets[0].resources[0].point.coordinates[0],
            longitude: result.data.resourceSets[0].resources[0].point.coordinates[1]
        };

        result = await axios.get(`https://dev.virtualearth.net/REST/v1/Locations?countryRegion=IT&locality=Roma&key=${ key }`);
        const end = {
            latitude: result.data.resourceSets[0].resources[0].point.coordinates[0],
            longitude: result.data.resourceSets[0].resources[0].point.coordinates[1]
        };

        console.log(Math.floor(haversine(start, end, {unit: 'meter'})));
    } catch (error) {
        console.error(error);
    }

})();
