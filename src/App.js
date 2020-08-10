import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as cheerio from 'cheerio-without-node-native';
import { Map, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
//import countriesGeoJson from './countries.geo.json';
import countries from './countries.json';





var countries2 = [
  {
    "timezones": [
      "Asia/Kabul"
    ],
    "latlng": [
      33,
      65
    ],
    "name": "United States",
    "country_code": "AF",
    "capital": "Kabul"
  },
  {
    "timezones": [
      "Asia/Kabul"
    ],
    "latlng": [
      33,
      65
    ],
    "name": "Canada",
    "country_code": "CD",
    "capital": "Kabul"
  },
];

var keywords = [
  "react",
  // "angular",
  //   "vue",
  //   "jquery"
  // 
]

function App() {
  let [mainNumbers, setMainNumbers] = useState([]);
  const [result, setResult] = useState([]);
  const totalCount = countries2.length * keywords.length;
  let currentCount = 0;
  const [isFinished, setIsFinished] = useState(false);

  const setTimer = () => {
    const timer = setInterval(() => {
      console.log(currentCount, totalCount);
      if (currentCount === totalCount) {
        // console.log(mainNumbers);
        // setResult(mainNumbers);
        // setIsFinished(true);
        clearInterval(timer);
      }
    }, 100);
  }

  useEffect(() => {
    let arr = [];
    keywords.map(keyword => {
      countries2.map(country =>
        arr.push({ "keyword": keyword, "country": country.name })
      );
    });
    let requests = arr.map(x => fetch(`https://www.linkedin.com/jobs/search/?keywords=${x.keyword}&location=${x.country}`));
    Promise.all(requests)
      .then(requests => requests.map(x => console.log(x)))
      .then(responses => Promise.all(responses.map(r => r.text())))
      .then(htmlList => htmlList.forEach(html => {
        const $ = cheerio.load(html);
        let count = $('.filter-list__label-count').eq(3).text().replace(/[{(),\.}]/g, '').trim();
        console.log(count);
      })
      );

  }, []);



  function fetchData(keyword, country) {
    const urlWorldOMeter = `https://www.linkedin.com/jobs/search/?keywords=${keyword}&location=${country.name}`;
    return () => fetch(urlWorldOMeter);
    // fetch(urlWorldOMeter)
    //   .then((response) => response.text())
    //   .then((data) => {
    //     const $ = cheerio.load(data);
    //     let count = $('.filter-list__label-count').eq(3).text().replace(/[{(),\.}]/g, '').trim();
    //     count = count === '' ? 0 : count;
    //     setMainNumbers(oldMainNumbers => [...oldMainNumbers, {
    //       "keyword": keyword,
    //       "country": country.name,
    //       "country_code": country.country_code,
    //       "latlng": country.latlng,
    //       "count": count,
    //     }]);
    //     currentCount++;
    //   })
    //   .catch((err) => console.warn('Something went wrong.', err));

    // setMainNumbers([{
    //   "keyword": "keyword",
    //   "country": "country.name",
    //   "country_code": "country.country_code",
    //   "latlng": "country.latlng",
    //   "count": 1,
    // }, {
    //   "keyword": "keyword",
    //   "country": "country.name",
    //   "country_code": "country.country_code",
    //   "latlng": "country.latlng",
    //   "count": 2,
    // },
    // ]);
    currentCount = totalCount;

  }
  const position = [51.505, -0.09];
  const myIcon = L.icon({
    iconUrl: require('./react.png'),
    iconSize: [50],
    iconAnchor: [25, 25],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
  });
  return (
    <div id="container" >
      <Map center={position} zoom={3}>
        <TileLayer
          attribution='Tiles &copy; CartoDB'
          url='http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
        />
        {result.map(x => { console.log(x); return <Marker key={x.country_code} icon={myIcon} position={x.latlng}></Marker>; })}
      </Map></div>
  )
}

// 


export default App;