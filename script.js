// ======================================================================
// Fichier : script.js (Version Professionnelle Unsplash)
// ======================================================================

// IMPORTANT : UNSPLASH_ACCESS_KEY est désormais lue directement depuis config.js
// La clé n'a pas été trouvée précédemment car j'utilisais l'objet API_KEYS
// Laisser la variable seule comme je l'avais fait est la bonne approche ici.
// Si la variable n'existe pas, le script s'arrête.
if (typeof UNSPLASH_ACCESS_KEY === 'undefined') {
    console.error("ERREUR CRITIQUE: UNSPLASH_ACCESS_KEY est introuvable. Assurez-vous que config.js est chargé et définit cette variable.");
    document.getElementById('gallery').innerHTML = 
        '<p style="text-align:center; color:red; padding:50px;">Clé API non trouvée. Veuillez vérifier le fichier config.js et l\'ordre de chargement dans index.html.</p>';
    throw new Error("Clé API manquante");
}


const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const gallery = document.getElementById("gallery");
const favoritesGallery = document.getElementById("favorites-gallery");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
displayFavorites();


// --- FONCTIONS DE BASE ---

// Recherche d'images
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        searchImages(query);
    }
});

searchInput.addEventListener("keyup", (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});


// Appel API Unsplash
async function searchImages(query) {
    gallery.innerHTML = '<p class="loading-message" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Chargement...</p>';
    
    // Utilisation de la variable UNSPLASH_ACCESS_KEY qui doit être définie dans config.js
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=30`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
             throw new Error(`Erreur API: ${response.status}. Limite atteinte ou clé invalide.`);
        }
        const data = await response.json();
        displayImages(data.results);
    } catch (error) {
        console.error("Erreur de recherche Unsplash:", error);
        gallery.innerHTML = `<p class="error-message" style="text-align:center; color:red; padding:50px;">${error.message}</p>`;
    }
}


// --- AFFICHAGE & FAVORIS ---

// Afficher résultats
function displayImages(images) {
    gallery.innerHTML = "";
    
    if (images.length === 0) {
        gallery.innerHTML = '<p style="text-align:center; padding:50px;">Aucun résultat trouvé. Essayez un autre mot-clé.</p>';
        return;
    }

    images.forEach(img => {
        gallery.appendChild(createGalleryItem(img, true)); // true pour galerie de résultats
    });
}

// Afficher favoris
function displayFavorites() {
    favoritesGallery.innerHTML = "";
    
    if (favorites.length === 0) {
        favoritesGallery.innerHTML = '<p style="text-align:center; padding:20px 0;">Vous n\'avez pas encore d\'inspiration favorite.</p>';
        return;
    }
    
    favorites.forEach(img => {
        favoritesGallery.appendChild(createGalleryItem(img, false)); // false pour galerie de favoris
    });
}

// Ajouter/Retirer des favoris
function toggleFavorite(img) {
    const index = favorites.findIndex(f => f.id === img.id);
    if (index === -1) {
        // Ajouter
        favorites.push(img);
    } else {
        // Retirer
        favorites.splice(index, 1);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
}


// Création de l'élément de la galerie avec overlay (PROFESSIONNEL)
function createGalleryItem(img, allowFavoriteToggle) {
    const isFavorite = favorites.some(f => f.id === img.id);
    
    const itemDiv = document.createElement("div");
    itemDiv.className = "gallery-item";
    
    // 1. Image
    const imgElement = document.createElement("img");
    imgElement.src = img.urls.small;
    imgElement.alt = img.alt_description || img.user.username;
    imgElement.loading = "lazy";
    
    // 2. Overlay (Contenu au survol)
    const overlayDiv = document.createElement("div");
    overlayDiv.className = "overlay";

    // Overlay Top: Bouton Enregistrer/Partager
    const overlayTop = document.createElement("div");
    overlayTop.className = "overlay-top";
    
    // Bouton de Sauvegarde (simulé par le tag)
    const saveButton = document.createElement("button");
    saveButton.textContent = 'Enregistrer';
    saveButton.className = 'save-btn';
    saveButton.onclick = () => alert('Enregistré dans votre collection !');
    overlayTop.appendChild(saveButton);

    // Overlay Bottom: Auteur et Icônes d'action
    const overlayBottom = document.createElement("div");
    overlayBottom.className = "overlay-bottom";
    
    // Lien Auteur
    const authorLink = document.createElement("a");
    authorLink.className = 'author-link';
    authorLink.textContent = `@${img.user.username}`;
    authorLink.href = img.user.links.html;
    authorLink.target = '_blank';
    overlayBottom.appendChild(authorLink);

// --- FONCTION MODALE (LIGHTBOX) ---
function openLightbox(img) {
    // Crée le conteneur de la modale
    const modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.9); z-index: 1000;
        display: flex; justify-content: center; align-items: center;
        cursor: zoom-out;
    `;

    // Crée l'image agrandie
    const enlargedImg = document.createElement('img');
    // Utiliser la 'regular' ou 'full' url pour une meilleure qualité
    enlargedImg.src = img.urls.regular; 
    enlargedImg.alt = img.alt_description || img.user.username;
    enlargedImg.style.cssText = `
        max-width: 90%; max-height: 90%;
        display: block; border-radius: 8px;
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.7);
    `;

    modal.appendChild(enlargedImg);
    document.body.appendChild(modal);

    // Fermer la modale au clic ou à la touche ESC
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
}


    // Icône Favori (visible si l'item est dans la galerie principale)
    if (allowFavoriteToggle) {
        const favoriteIcon = document.createElement("i");
        favoriteIcon.className = `fas fa-heart action-icon favorite ${isFavorite ? 'active' : ''}`;
        favoriteIcon.onclick = () => {
            toggleFavorite(img);
            // Mettre à jour l'état visuel après le clic
            favoriteIcon.classList.toggle('active');
        };
        overlayBottom.appendChild(favoriteIcon);
    } 
    
    // Icône Partager
    const shareIcon = document.createElement("i");
    shareIcon.className = 'fas fa-share-alt action-icon';
    shareIcon.onclick = () => window.open(img.links.html, '_blank');
    overlayBottom.appendChild(shareIcon);

    // Assemblage final
    overlayDiv.appendChild(overlayTop);
    overlayDiv.appendChild(overlayBottom);
    itemDiv.appendChild(imgElement);
    itemDiv.appendChild(overlayDiv);

    return itemDiv;
}

// Chargement initial d'une recherche par défaut (ex: 'design')
document.addEventListener('DOMContentLoaded', () => {
    // Si la galerie de résultats est vide, on lance une recherche par défaut
    if (gallery.children.length === 0) {
        searchImages('design'); 
    }
});
