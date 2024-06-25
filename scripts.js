let map;
let markers = [];
let addTreeMode = false;

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    fetchTrees();

    map.on('click', function(event) {
        if (addTreeMode) {
            placeMarker(event.latlng);
        }
    });
}

document.getElementById('addTree').addEventListener('click', () => {
    addTreeMode = true;
    document.getElementById('form-container').style.display = 'block';
});

document.getElementById('treeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let treeName = document.getElementById('treeName').value;
    let marker = markers[markers.length - 1];
    saveTree(marker.getLatLng().lat, marker.getLatLng().lng, treeName);
});

function placeMarker(location) {
    let marker = L.marker(location, {
        icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        })
    }).addTo(map);
    markers.push(marker);
}

function saveTree(lat, lng, name) {
    fetch('/add_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lat: lat,
            lng: lng,
            name: name
        })
    }).then(response => response.json())
      .then(data => {
          alert('Tree added successfully!');
          document.getElementById('form-container').style.display = 'none';
          addTreeMode = false;
          fetchTrees(); // Refresh the tree markers
      });
}

function fetchTrees() {
    fetch('/get_trees')
        .then(response => response.json())
        .then(data => {
            markers.forEach(marker => map.removeLayer(marker)); // Remove existing markers
            markers = [];
            data.forEach(tree => {
                let marker = L.marker([tree.latitude, tree.longitude], {
                    icon: L.icon({
                        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                }).addTo(map);
                let popupContent = `<b>${tree.name}</b><br>Upvotes: ${tree.upvotes}<br>Downvotes: ${tree.downvotes}<br>
                                    <button onclick="upvoteTree(${tree.id})">Upvote</button>
                                    <button onclick="downvoteTree(${tree.id})">Downvote</button>`;
                marker.bindPopup(popupContent);
                markers.push(marker);
            });
        });
}

function upvoteTree(treeId) {
    fetch('/upvote_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: treeId })
    }).then(response => response.json())
      .then(data => {
          alert('Tree upvoted successfully!');
          fetchTrees(); // Refresh the tree markers
      });
}

function downvoteTree(treeId) {
    fetch('/downvote_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: treeId })
    }).then(response => response.json())
      .then(data => {
          alert('Tree downvoted successfully!');
          fetchTrees(); // Refresh the tree markers
      });
}

document.addEventListener('DOMContentLoaded', initMap);
