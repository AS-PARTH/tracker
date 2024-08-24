const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Sending location:", { latitude, longitude });
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  console.log("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
  subdomains: ["0", "1", "2", "3"],
  attribution:
    'Map data © <a href="https://www.google.com/maps">Google Maps</a>',
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  console.log("Received location data:", data);
  const { id, latitude, longitude } = data;
  if (!markers[id]) {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  } else {
    markers[id].setLatLng([latitude, longitude]);
  }
  map.setView([latitude, longitude], 16);
});

socket.on("user-disconnect", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
