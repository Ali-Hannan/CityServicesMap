// Initialize the map
const map = L.map('map').setView([53.483959, -2.244644], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define clean PNG icons
const hospitalIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png',
  iconSize: [30, 30]
});

const schoolIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048310.png',
  iconSize: [30, 30]
});

const policeIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/4085/4085795.png',
  iconSize: [30, 30]
});

// Layer groups for toggling
const hospitalLayer = L.layerGroup().addTo(map);
const schoolLayer = L.layerGroup().addTo(map);
const policeLayer = L.layerGroup().addTo(map);

// Load GeoJSON and render markers
fetch('data/services.geojson')
  .then(res => res.json())
  .then(data => {
    const geoLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const type = feature.properties.type;
        let icon;

        if (type === "Hospital") icon = hospitalIcon;
        else if (type === "School") icon = schoolIcon;
        else if (type === "Police Station") icon = policeIcon;

        return L.marker(latlng, { icon });
      },
      onEachFeature: function (feature, layer) {
        const props = feature.properties;
        layer.bindPopup(`<strong>${props.type}</strong><br>${props.name}`);

        // Add to correct layer group
        if (props.type === "Hospital") hospitalLayer.addLayer(layer);
        else if (props.type === "School") schoolLayer.addLayer(layer);
        else if (props.type === "Police Station") policeLayer.addLayer(layer);
      }
    });

    // Search bar control
    const searchControl = new L.Control.Search({
      layer: geoLayer,
      propertyName: 'name',
      zoom: 16,
      marker: false,
      moveToLocation: function (latlng, title, map) {
        map.setView(latlng, 16);
      }
    });

    searchControl.on('search:locationfound', function (e) {
      e.layer.openPopup();
    });

    map.addControl(searchControl);
  });

// Overlay toggle control
const overlayMaps = {
  "🏥 Hospitals": hospitalLayer,
  "🏫 Schools": schoolLayer,
  "🚓 Police Stations": policeLayer
};

L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

// Geolocation control button
const locateControl = L.control({ position: 'topright' });

locateControl.onAdd = function () {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  const button = L.DomUtil.create('a', '', div);
  button.innerHTML = '📍';
  button.title = 'Show My Location';
  button.href = '#';

  button.onclick = function (e) {
    e.preventDefault();
    map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
  };

  return div;
};

locateControl.addTo(map);

// Show user's location
map.on('locationfound', function (e) {
  L.circleMarker(e.latlng, {
    radius: 10,
    color: '#007BFF',
    fillColor: '#007BFF',
    fillOpacity: 0.6
  })
    .addTo(map)
    .bindPopup("You are here.")
    .openPopup();
});

// Handle geolocation error
map.on('locationerror', function () {
  alert("Unable to find your location.");
});
