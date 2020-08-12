import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as cheerio from 'cheerio-without-node-native';
import { Map, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import countries from './countries.json';

var keywords = [
    "react",
    "angular",
    "vue",
    "jquery"
]



function App() {
    const [mainNumbers, setMainNumbers] = useState([]);
    let currentFileIndex = 1;

    useEffect(() => {
        let arr = [];
        createArray(0, 50, arr);
        computeArray(arr);
        setTimeout(() => {
            arr = [];
            createArray(50, 100, arr);
            computeArray(arr);
            setTimeout(() => {
                arr = [];
                createArray(100, 150, arr);
                computeArray(arr);
                setTimeout(() => {
                    arr = [];
                    createArray(150, 200, arr);
                    computeArray(arr);
                    setTimeout(() => {
                        arr = [];
                        createArray(200, 250, arr);
                        computeArray(arr);
                    }, 5000);
                }, 5000);
            }, 5000);
        }, 5000);
    }, []);

    // useEffect(() => {
    //     let arr = [];
    //     createArray(0, 1, arr);
    //     computeArray(arr);
    //     setTimeout(() => {
    //         arr = [];
    //         createArray(1, 2, arr);
    //         computeArray(arr);
    //         setTimeout(() => {
    //             arr = [];
    //             createArray(2, 3, arr);
    //             computeArray(arr);
    //             setTimeout(() => {
    //                 arr = [];
    //                 createArray(3, 4, arr);
    //                 computeArray(arr);
    //                 setTimeout(() => {
    //                     arr = [];
    //                     createArray(4, 5, arr);
    //                     computeArray(arr);
    //                 }, 5000);
    //             }, 5000);
    //         }, 5000);
    //     }, 5000);
    // }, []);

    // useEffect(() => {
    //     let arr = [{ "keyword": "react", "country": "Nigeria", "latlng": [0, 0], "country_code": "NG" }];
    //     computeArray(arr);
    // }, []);

    const createArray = (start, end, arr) => {
        console.log(start, end);
        keywords.map(keyword => {
            console.log(countries.length);
            countries.slice(start, end).map(country =>
                arr.push({ "keyword": keyword, "country": country.name, "latlng": country.latlng, "country_code": country.country_code })
            );
        });
    }

    const computeArray = (arr) => {
        debugger;
        let requests = arr.map(x => fetch(`https://www.linkedin.com/jobs/search/?keywords=${x.keyword}&location=${x.country}&latlng=${x.latlng[0]},${x.latlng[1]}&country_code=${x.country_code}`));
        Promise.all(requests)
            .then(responses => Promise.all(responses.map(r => r.text())))
            .then(htmlList => {
                let arr = [];
                htmlList.forEach(html => {
                    computeHTML(html, arr);
                });
                let groupedByCountry =
                    arr.reduce(function (rv, x) {
                        (rv[x['country_code']] = rv[x['country_code']] || []).push(x);
                        return rv;
                    }, []);
                let maxJsFrameworks = getMaxJSFramweworks(groupedByCountry);
                setMainNumbers(maxJsFrameworks);
                download(JSON.stringify(maxJsFrameworks), `${currentFileIndex++}.json`, 'text/plain');
            });
    }

    const computeHTML = (html, arr) => {
        const $ = cheerio.load(html);
        const url = $('meta[property="lnkd:url"]')[0].attribs.content;
        var p = new URLSearchParams(url.split("?")[1]);
        let keywords = p.get('keywords');
        let location = p.get('location');
        let latlng = p.get('latlng').split(',');
        let country_code = p.get('country_code');
        let count = $('#dust-var-totalResults')[0].children[0].data.replaceAll("\"", "");
        count = count === '' ? 0 : parseInt(count);
        const shownCountryName = $('input[type="search"]').eq(3).val();
        const resItem = {
            "keyword": keywords,
            "country": location,
            "country_code": country_code,
            "latlng": latlng,
            "count": count,
        }
        if (isCountryResultNotFound(resItem, shownCountryName)) {
            console.log(country_code);
            return;
        }

        arr.push(resItem);
    }

    const isCountryResultNotFound = (resItem, shownCountryName) => {
        if (resItem.country_code !== 'US' && resItem.country !== shownCountryName && shownCountryName === "Birleşik Devletler") {
            return true;
        } else {
            return false;
        }
    }

    const getMaxJSFramweworks = (groupedByCountry) => {
        let arr = [];
        for (const rec in groupedByCountry) {
            const maxJsFramework = groupedByCountry[rec].reduce((a, b) => a.count > b.count ? a : b);
            if (maxJsFramework.count === 0) continue;
            arr.push({ maxFramework: maxJsFramework, frameworks: groupedByCountry[rec] });
        }
        return arr;
    }

    const download = (content, fileName, contentType) => {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }



    const position = [51.505, -0.09];
    const myIcon = (keyword) => L.icon({
        iconUrl: getIconByName(keyword),
        iconSize: [50],
        iconAnchor: [25, 25]
    });
    const getIconByName = (framework) => {
        switch (framework) {
            case 'react':
                return require('./img/react.png');
            case 'angular':
                return require('./img/angular.png')
            case 'vue':
                return require('./img/vue.png')
            case 'jquery':
                return require('./img/jquery.png');

            default:
                break;
        }
    }
    return (<div id="container" >
        <Map center={position}
            zoom={3} >
            <TileLayer attribution='Tiles &copy; CartoDB'
                url='http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' /> {
                mainNumbers.map(x => {
                    return <Marker key={x.maxFramework.country_code}
                        icon={myIcon(x.maxFramework.keyword)}
                        position={x.maxFramework.latlng} >
                        <Popup>
                            <span> {x.maxFramework.country} </span> <ul> {
                                x.frameworks.map(f => {
                                    return <li key={f.keyword} > {f.keyword}: {f.count} </li>

                                })
                            } </ul>
                        </Popup>
                    </Marker >
                })


            } </Map> </div>
    )
}

export default App;