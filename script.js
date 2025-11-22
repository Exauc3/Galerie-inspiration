// ======================================================================
// Fichier : script.js (Version Professionnelle Unsplash V3)
// Inclus: Recherche API, LocalStorage, Mise en page dynamique, Lightbox/Modale
// ======================================================================

// IMPORTANT : VÉRIFICATION DE LA CLÉ API
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


// --- FONCTION MODALE (LIGHTBOX) : Corrigée pour Mobile ---
function openLightbox(img) {
    // Crée le conteneur de la modale
    const modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    
    // MODIFICATION CRITIQUE : Augmenter le z-index à une valeur très élevée (ex: 9999)
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.95); /* Rendre l'arrière-plan plus opaque */
        z-index: 9999; /* ASSURER LA SUPERPOSITION MAXIMALE */
        display: flex; justify-content: center; align-items: center;
        cursor: zoom-out;
    `;

    // Crée l'image agrandie (utilise l'URL 'regular' pour la qualité)
    const enlargedImg = document.createElement('img');
    enlargedImg.src = img.urls.regular; 
    enlargedImg.alt = img.alt_description || img.user.username;
    enlargedImg.style.cssText = `
        max-width: 95%; /* Légère augmentation de la taille sur mobile */
        max-height: 95%;
        display: block; border-radius: 8px;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
    `;

    modal.appendChild(enlargedImg);
    document.body.appendChild(modal);

    // Fermer la modale au clic n'importe où sur l'écran
    modal.addEventListener('click', (e) => {
        // La modale se ferme si l'élément cliqué est le conteneur de la modale lui-même
        if (e.target.id === 'lightbox-modal' || e.target === enlargedImg) {
             document.body.removeChild(modal);
        }
    });
    
    // Fermer la modale à la touche ESC
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape' && document.body.contains(modal)) {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeOnEsc); 
        }
    });
}


// --- MODIFICATION DANS createGalleryItem pour le clic mobile ---
function createGalleryItem(img, allowFavoriteToggle) {
    const isFavorite = favorites.some(f => f.id === img.id);
    // ...
    
    // 1. Image
    const imgElement = document.createElement("img");
    imgElement.src = img.urls.small;
    imgElement.alt = img.alt_description || img.user.username;
    imgElement.loading = "lazy";
    
    // AJOUT D'UN ÉVÉNEMENT TOUCHSTART (pour les mobiles)
    imgElement.addEventListener("touchstart", (e) => {
        // Empêche la propagation du touch event si un overlay était activé
        e.stopPropagation(); 
        openLightbox(img); 
    });
    
    // AJOUT DE L'ÉVÉNEMENT CLICK (pour les ordinateurs de bureau et comme fallback)
    imgElement.addEventListener("click", () => {
         openLightbox(img); 
    });
    
    // ... (Le reste du code de createGalleryItem est inchangé)
    
    // Si vous voulez aussi que le clic sur l'overlay ferme la modale sans la rouvrir:
    const overlayDiv = document.createElement("div");
    overlayDiv.className = "overlay";
    // ...
    
    // Assurez-vous d'ajouter l'image à l'itemDiv AVANT l'overlay
    itemDiv.appendChild(imgElement); 
    itemDiv.appendChild(overlayDiv);

    return itemDiv;
}


// --- FONCTIONS DE BASE (Recherche API) ---

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
        gallery.appendChild(createGalleryItem(img, true)); 
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
        favoritesGallery.appendChild(createGalleryItem(img, false)); 
    });
}

// Ajouter/Retirer des favoris
function toggleFavorite(img) {
    const index = favorites.findIndex(f => f.id === img.id);
    if (index === -1) {
        favorites.push(img);
    } else {
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
    
    // Ouvre la modale au clic sur l'image
    imgElement.addEventListener("click", () => {
         openLightbox(img); 
    });
    
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
    if (gallery.children.length === 0) {
        searchImages('design'); 
    }
});
