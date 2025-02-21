let scaleMap, windowWidth = window.innerWidth, scaleRoad;
windowWidth > 2600 ? (scaleMap = 7,
scaleRoad = 4) : windowWidth < 2e3 ? (scaleMap = 6,
scaleRoad = 3) : (scaleMap = 7,
scaleRoad = 3.8),
console.log(scaleRoad, scaleMap, windowWidth, window.innerHeight);


var map = L.map('map').setView([62.8393, 40.5168], scaleMap); // Архангельская область

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Объект с настройками стилей для каждого слоя
var layerStyles = {
    geo1: { color: 'red', opacity: 0.9, weight: 3.5 },
    geo2: { color: 'purple', opacity: 0.9, weight: 3.5 },
    geo3: { color: 'blue', opacity: 0.9, weight: 3.5 },
    geo4: { color: 'green', opacity: 0.9, weight: 3.5 },
    geo5: { color: 'black', opacity: 0.9, weight: 3.5 }
};
// Функция для добавления слоя GeoJSON на карту
function addGeoJsonLayer(file, layerName, checkboxId) {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            var layer = L.geoJson(data, {
                style: function(feature) {
                    return {
                        color: layerStyles[layerName].color,
                        opacity: layerStyles[layerName].opacity,
                        weight: layerStyles[layerName].weight
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.name);
                }
            }).addTo(map);

            layers[layerName] = layer;  // Сохраняем слой в глобальную переменную

            // Добавляем обработчик для чекбокса
            document.getElementById(checkboxId).addEventListener('change', function(e) {
                if (e.target.checked) {
                    map.addLayer(layer);
                } else {
                    map.removeLayer(layer);
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Объект для хранения всех слоев
var layers = {};

// Добавляем все 5 GeoJSON слоев на карту
addGeoJsonLayer('geo/1.geojson', 'geo1', 'layer1-checkbox');
addGeoJsonLayer('geo/2.geojson', 'geo2', 'layer2-checkbox');
addGeoJsonLayer('geo/3.geojson', 'geo3', 'layer3-checkbox');
addGeoJsonLayer('geo/4.geojson', 'geo4', 'layer4-checkbox');
addGeoJsonLayer('geo/5.geojson', 'geo5', 'layer5-checkbox');

// Функция для поиска по имени и отображения результатов в выпадающем списке
function searchFeatures() {
    var searchText = document.getElementById('search-input').value.toLowerCase();
    var results = [];
    var resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';

    Object.entries(layers).forEach(function([layerName, layer]) {
        layer.eachLayer(function(l) {
            if (l.feature.properties.name.toLowerCase().includes(searchText)) {
                results.push({layerName: layerName, layer: l});
            }
        });
    });

    if (results.length > 0) {
        results.forEach(function(result) {
            var resultElement = document.createElement('div');
            resultElement.innerHTML = result.layer.feature.properties.name;
            resultElement.style.color = layerStyles[result.layerName].color;  // Устанавливаем цвет текста
            resultElement.onclick = function() {
                map.fitBounds(result.layer.getBounds());
                result.layer.openPopup();
                resultsContainer.style.display = 'none';
                document.getElementById('search-input').value = '';  // Сброс поля поиска
            };
            resultsContainer.appendChild(resultElement);
        });
        resultsContainer.style.display = 'block';
    } else {
        var noResultsElement = document.createElement('div');
        noResultsElement.innerHTML = 'Ничего не найдено';
        resultsContainer.appendChild(noResultsElement);
        resultsContainer.style.display = 'block';
    }
}


// Добавляем обработчик для поля ввода для выполнения поиска по нажатию Enter
document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchFeatures();
    }
});

// Добавляем обработчик для клика на любое место на странице, чтобы закрыть выпадающий список
document.addEventListener('click', function(event) {
    var searchContainer = document.getElementById('search-container');
    var searchResults = document.getElementById('search-results');
    if (!searchContainer.contains(event.target)) {
        searchResults.style.display = 'none';
        document.getElementById('search-input').value = '';  // Сброс поля поиска
    }
});

// Добавляем обработчик для поля ввода, чтобы предотвратить закрытие выпадающего списка при клике внутри
document.getElementById('search-input').addEventListener('click', function(event) {
    event.stopPropagation();
});