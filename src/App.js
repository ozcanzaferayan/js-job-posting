import React, { useEffect, useState } from 'react';
import './App.css';
import { Map, Marker, Popup, TileLayer, LayerGroup } from 'react-leaflet';
import Control from '@skyeer/react-leaflet-custom-control'
import L from 'leaflet';
import c1 from './cache/1.json';
import c2 from './cache/2.json';
import c3 from './cache/3.json';
import c4 from './cache/4.json';
import c5 from './cache/5.json';

var keywords = [
  "react",
  "angular",
  "vue",
  "jquery"
]

function App() {
  const [mainNumbers] = useState([...c1, ...c2, ...c3, ...c4, ...c5]);
  const [isRealSizesShown, setIsRealSizesShown] = useState(false);


  const position = [39, 35];
  const myIcon = (keyword, count) => {
    let iconSizeByCount = getIconSizeByCount(count);
    return L.icon({
      iconUrl: getIconByName(keyword),
      iconSize: [iconSizeByCount],
      iconAnchor: [iconSizeByCount / 2, iconSizeByCount / 2]
    })
  };

  const getIconSizeByCount = (count) => {
    if (isRealSizesShown) {
      return count / 100;
    }
    if (count < 1000) {
      return 20;
    }
    if (count < 5000) {
      return 50;
    }
    if (count < 10000) {
      return 60;
    }
    if (count < 20000) {
      return 70;
    }
    else {
      return 80;
    }
  }
  const getIconByName = (framework) => {
    switch (framework) {
      case 'react':
        return require('./img/react_2.png');
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

  const showIconsAsPreDefined = () => {
    setIsRealSizesShown(false);
  }
  const showIconsAsReal = () => {
    setIsRealSizesShown(true);
  }
  return (
    <div id="container" >
      <Map center={position} zoom={2} >
        <TileLayer attribution='Tiles &copy; CartoDB' url='http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' />
        <Control position="topleft">
          <button onClick={showIconsAsPreDefined}>Show icons as pre-defined</button>
        </Control>
        <Control position="topleft">
          <button onClick={showIconsAsReal}>Show icons as real porpotions</button>
        </Control>
        {
          mainNumbers.map(x => {
            return <Marker key={x.maxFramework.country_code} icon={myIcon(x.maxFramework.keyword, x.maxFramework.count)} opacity={isRealSizesShown ? .7 : 1}
              position={x.maxFramework.latlng} onMouseOver={(e) => {
                e.target.openPopup();
              }}
              onMouseOut={(e) => {
                e.target.closePopup();
              }}>
              <Popup>
                <span>{x.maxFramework.country}</span>
                <ul>
                  {x.frameworks.sort((a, b) => {
                    let comparison = 0;
                    if (a.count > b.count) {
                      comparison = -1;
                    } else if (a.count < b.count) {
                      comparison = 1;
                    }
                    return comparison;
                  })
                    .map(f => {
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