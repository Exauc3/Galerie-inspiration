// script.js
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const gallery = document.getElementById('gallery');
const favoritesGallery = document.getElementById('favorites-gallery');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentPage = 1;
let currentQuery = '';
const PER_PAGE = 12;
let loadingMore = false;

displayFavorites();

// Rechercher
searchButton.addEventListener('click', () => {
  currentQuery = searchInput.value.trim();
  if (!currentQuery) return;
  currentPage = 1;
  gallery.innerHTML = '';
  searchImages(currentQuery, currentPage);
});

// Recherche initiale si tu veux
// searchImages('design', 1);

async function searchImages(query, page = 1) {
  try {
    loadingMore = true;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}&client_id=${UNSPLASH_ACCESS_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erreur API Unsplash');
    const data = await res.json();
    displayImages(data.results);
    loadingMore = false;
  } catch (err) {
    console.error(err);
    loadingMore = false;
  }
}

function displayImages(images) {
  if (!images || images.length === 0) {
    if (currentPage === 1) gallery.innerHTML = '<p style="padding:20px">Aucun résultat.</p>';
    return;
  }

  images.forEach(img => {
    const card = document.createElement('div');
    card.className = 'photo-card';

    const image = document.createElement('img');
    image.dataset.src = img.urls.small;
    image.alt = img.alt_description || '';
    image.loading = 'lazy'; // fallback lazy
    image.className = 'thumb';

    // clic = ouvrir lightbox ou ajouter aux favoris
    const favBtn = document.createElement('button');
    favBtn.textContent = favorites.find(f => f.id === img.id) ? '♥' : '♡';
    favBtn.className = 'fav-btn';
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(img, favBtn);
    });

    // Option: click ouvre image en grand (nouvelle fenêtre ou lightbox)
    image.addEventListener('click', () => {
      window.open(img.links.html, '_blank');
    });

    card.appendChild(image);
    card.appendChild(favBtn);
    gallery.appendChild(card);
  });

  // Lazy load (IntersectionObserver)
  lazyLoadImages();
}

function toggleFavorite(img, btnEl) {
  const exists = favorites.find(f => f.id === img.id);
  if (exists) {
    favorites = favorites.filter(f => f.id !== img.id);
    btnEl.textContent = '♡';
  } else {
    favorites.push(img);
    btnEl.textContent = '♥';
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  displayFavorites();
}

function displayFavorites() {
  favoritesGallery.innerHTML = '';
  if (favorites.length === 0) {
    favoritesGallery.innerHTML = '<p>Aucun favori pour l’instant.</p>';
    return;
  }
  favorites.forEach(img => {
    const imgEl = document.createElement('img');
    imgEl.src = img.urls.thumb || img.urls.small;
    imgEl.alt = img.alt_description || '';
    imgEl.addEventListener('click', () => window.open(img.links.html, '_blank'));
    favoritesGallery.appendChild(imgEl);
  });
}

function lazyLoadImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.src = el.dataset.src;
        el.removeAttribute('data-src');
        obs.unobserve(el);
      }
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => observer.observe(img));
}

// Infinite scroll (charger la page suivante)
window.addEventListener('scroll', () => {
  if (loadingMore) return;
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
  if (nearBottom && currentQuery) {
    currentPage += 1;
    searchImages(currentQuery, currentPage);
  }
});