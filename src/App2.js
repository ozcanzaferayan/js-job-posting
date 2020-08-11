import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as cheerio from 'cheerio-without-node-native';
import { Map, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
//import countriesGeoJson from './countries.geo.json';
import countries from './countries.json';

var keywords = [
  "react",
  "angular",
  "vue",
  "jquery"
]

function App() {
  const [mainNumbers, setMainNumbers] = useState([]);

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
    let requests = arr.map(x => fetch(`https://www.linkedin.com/jobs/search/?keywords=${x.keyword}&location=${x.country}&latlng=${x.latlng[0]},${x.latlng[1]}&country_code=${x.country_code}`));
    Promise.all(requests)
      .then(responses => Promise.all(responses.map(r => r.text())))
      .then(htmlList => {
        let arr = [];
        htmlList.forEach(html => {
          const $ = cheerio.load(html);
          const url = $('meta[property="lnkd:url"]')[0].attribs.content;
          var p = new URLSearchParams(url.split("?")[1]);
          let keywords = p.get('keywords');
          let location = p.get('location');
          let latlng = p.get('latlng').split(',');
          let country_code = p.get('country_code');
          let count = $('.filter-list__label-count').eq(3).text().replace(/[{(),\.}]/g, '').trim();
          count = count === '' ? 0 : parseInt(count);
          const inputCountryName = $('input[type="search"]').eq(3).val();
          if (country_code !== 'US' && location !== inputCountryName && inputCountryName === "Birleşik Devletler") {
            console.log(country_code);
            return;
          }
          const resItem = {
            "keyword": keywords,
            "country": location,
            "country_code": country_code,
            "latlng": latlng,
            "count": count,
          }
          arr.push(resItem);
        });
        let groupedByCountry =
          arr.reduce(function (rv, x) {
            (rv[x['country_code']] = rv[x['country_code']] || []).push(x);
            return rv;
          }, []);
        let maxJsFrameworks = []
        for (const rec in groupedByCountry) {
          const maxJsFramework = groupedByCountry[rec].reduce((a, b) => a.count > b.count ? a : b);
          if (maxJsFramework.count === 0) continue;
          maxJsFrameworks.push({ maxFramework: maxJsFramework, frameworks: groupedByCountry[rec] });
        }
        setMainNumbers(maxJsFrameworks);
        download(JSON.stringify(maxJsFrameworks), '1.json', 'text/plain');
      }
      );
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
        return require('./react.png');
      case 'angular':
        return require('./angular.png')
      case 'vue':
        return require('./vue.png')
      case 'jquery':
        return require('./jquery.png');

      default:
        break;
    }
  }
  return (
    <div id="container" >
      <Map center={position} zoom={3} >
        <TileLayer attribution='Tiles &copy; CartoDB' url='http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' />
        {
          mainNumbers.map(x => {
            return <Marker key={x.maxFramework.country_code} icon={myIcon(x.maxFramework.keyword)}
              position={x.maxFramework.latlng} >
              <Popup>
                <span>{x.maxFramework.country}</span>
                <ul>
                  {x.frameworks.map(f => {
                    return <li key={f.keyword}>{f.keyword}: {f.count}</li>

                  })}
                </ul></Popup>
            </Marker>
          })


        }
      </Map>
    </div>
  )
}

export default App;