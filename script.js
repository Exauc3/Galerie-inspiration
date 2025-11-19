const UNSPLASH_ACCESS_KEY = API_KEYS.UNSPLASH_ACCESS_KEY; 

const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/random';
const PHOTO_COUNT = 30; // Nombre d'images à charger initialement

const galleryContainer = document.getElementById('galleryContainer');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');


// --- FONCTIONS D'AFFICHAGE ---

/**
 * Crée l'élément HTML pour une image de la galerie à partir des données Unsplash
 * @param {object} item - Les données de la photo reçues de l'API Unsplash
 * @returns {HTMLElement}
 */
function createGalleryItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = item.urls.regular; 
    img.alt = item.alt_description || 'Image Unsplash'; 
    img.loading = 'lazy'; // Optimisation pour la performance

    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'overlay';

    // Top: Bouton Enregistrer (Save)
    const overlayTop = document.createElement('div');
    overlayTop.className = 'overlay-top';
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Enregistrer';
    saveButton.onclick = () => alert(`Enregistré : ${item.alt_description || item.id}`);
    overlayTop.appendChild(saveButton);

    // Bottom: Auteur + Bouton Partager
    const overlayBottom = document.createElement('div');
    overlayBottom.className = 'overlay-bottom';
    
    const authorLink = document.createElement('a');
    authorLink.textContent = `@${item.user.username}`;
    authorLink.href = item.user.links.html;
    authorLink.target = '_blank';
    authorLink.title = `Voir le profil de ${item.user.username} sur Unsplash`;
    
    const shareIcon = document.createElement('i');
    shareIcon.className = 'fas fa-share-alt';
    shareIcon.onclick = () => window.open(item.links.html, '_blank');

    overlayBottom.appendChild(authorLink);
    overlayBottom.appendChild(shareIcon);

    // Assemblage
    overlayDiv.appendChild(overlayTop);
    overlayDiv.appendChild(overlayBottom);
    itemDiv.appendChild(img);
    itemDiv.appendChild(overlayDiv);

    return itemDiv;
}

/**
 * Affiche la galerie
 * @param {array} data - Le tableau d'images Unsplash à afficher
 */
function renderGallery(data) {
    galleryContainer.innerHTML = ''; // Vide le conteneur avant de recharger
    data.forEach(item => {
        galleryContainer.appendChild(createGalleryItem(item));
    });
}

// --- LOGIQUE DE L'API ---

/**
 * Charge les images aléatoires ou via recherche depuis Unsplash
 * @param {string} query - Terme de recherche optionnel
 */
async function fetchUnsplashImages(query = '') {
    
    // Affiche un état de chargement
    galleryContainer.innerHTML = '<p class="no-results">Chargement des inspirations...</p>';

    // Détermine l'endpoint (recherche ou aléatoire)
    const endpoint = query 
        ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${PHOTO_COUNT}`
        : `${UNSPLASH_API_URL}?count=${PHOTO_COUNT}`;

    try {
        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}. Vérifiez votre Clé API Unsplash.`);
        }

        const data = await response.json();
        
        // L'endpoint de recherche renvoie un objet avec une propriété 'results'
        const imagesToRender = query ? data.results : data; 

        if (imagesToRender.length === 0) {
            galleryContainer.innerHTML = `<p class="no-results">Aucun résultat trouvé pour "${query}".</p>`;
            return;
        }

        renderGallery(imagesToRender);

    } catch (error) {
        console.error('Erreur lors du chargement des images Unsplash:', error);
        galleryContainer.innerHTML = `<p class="error-message">Impossible de charger les images. ${error.message}</p>`;
    }
}

// --- LOGIQUE DE RECHERCHE ET INITIALISATION ---

/**
 * Gère la recherche et le filtrage (via Entrée ou Clic)
 */
function handleSearch(event) {
    // Déclenche la recherche si 'Entrée' est pressé ou si c'est un événement de 'click'
    if (event.key === 'Enter' || event.type === 'click') {
        const query = searchInput.value.toLowerCase().trim();
        fetchUnsplashImages(query);
    }
}

// Événements de recherche
searchInput.addEventListener('keyup', handleSearch);
searchButton.addEventListener('click', handleSearch);

// Chargement initial de la galerie au démarrage
document.addEventListener('DOMContentLoaded', () => {
    fetchUnsplashImages(); // Charge les images aléatoires au début
});
