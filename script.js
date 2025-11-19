const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const gallery = document.getElementById('gallery');
const favoritesGallery = document.getElementById('favorites-gallery');

// Récupérer les favoris depuis le localStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
displayFavorites();

searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    if (query) searchImages(query);
});

async function searchImages(query) {
    const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    displayImages(data.results);
}

function displayImages(images) {
    gallery.innerHTML = '';
    images.forEach(img => {
        const imgElement = document.createElement('img');
        imgElement.src = img.urls.small;
        imgElement.alt = img.alt_description || '';
        imgElement.addEventListener('click', () => addFavorite(img));
        gallery.appendChild(imgElement);
    });
}

function addFavorite(img) {
    if (!favorites.find(f => f.id === img.id)) {
        favorites.push(img);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function displayFavorites() {
    favoritesGallery.innerHTML = '';
    favorites.forEach(img => {
        const imgElement = document.createElement('img');
        imgElement.src = img.urls.small;
        favoritesGallery.appendChild(imgElement);
    });
}