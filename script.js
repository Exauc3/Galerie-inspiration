// Données fictives simulant les images de la base de données
const inspirationData = [
    { id: 1, src: 'https://picsum.photos/400/600?random=1', title: 'Design Minimaliste', tags: ['design', 'minimaliste', 'intérieur'] },
    { id: 2, src: 'https://picsum.photos/400/300?random=2', title: 'Photographie Urbaine', tags: ['photo', 'ville', 'nuit'] },
    { id: 3, src: 'https://picsum.photos/400/750?random=3', title: 'Concept Art Nature', tags: ['art', 'dessin', 'nature', 'paysage'] },
    { id: 4, src: 'https://picsum.photos/400/500?random=4', title: 'Développement Web', tags: ['code', 'webdev', 'ui', 'interface'] },
    { id: 5, src: 'https://picsum.photos/400/400?random=5', title: 'Cuisine Végétale', tags: ['cuisine', 'food', 'vegan', 'recette'] },
    { id: 6, src: 'https://picsum.photos/400/550?random=6', title: 'Architecture Moderne', tags: ['architecture', 'design', 'maison'] },
    { id: 7, src: 'https://picsum.photos/400/450?random=7', title: 'Voyage en Montagne', tags: ['voyage', 'aventure', 'froid'] },
    { id: 8, src: 'https://picsum.photos/400/800?random=8', title: 'Typographie Créative', tags: ['design', 'typographie', 'graphisme'] },
    { id: 9, src: 'https://picsum.photos/400/350?random=9', title: 'Dessin Abstrait', tags: ['art', 'abstrait', 'couleur'] },
    { id: 10, src: 'https://picsum.photos/400/700?random=10', title: 'Fashion Streetwear', tags: ['mode', 'streetwear', 'vêtement'] },
    // Ajoutez plus d'éléments pour simuler une grande galerie
];

const galleryContainer = document.getElementById('galleryContainer');
const searchInput = document.getElementById('searchInput');

/**
 * Crée l'élément HTML pour une image de la galerie
 * @param {object} item - L'objet de données de l'image
 * @returns {HTMLElement}
 */
function createGalleryItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'gallery-item';

    // Image
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title;
    img.loading = 'lazy'; // Pour le chargement paresseux (performance pro)

    // Overlay (Titre, Bouton Enregistrer/Sauvegarder)
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'overlay';

    // Top: Bouton Enregistrer (Save)
    const overlayTop = document.createElement('div');
    overlayTop.className = 'overlay-top';
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Enregistrer';
    // Ajout d'un écouteur d'événement simple (à développer pour la vraie fonction de sauvegarde)
    saveButton.onclick = () => alert(`Enregistré : ${item.title}`);
    overlayTop.appendChild(saveButton);

    // Bottom: Titre + Bouton Partager
    const overlayBottom = document.createElement('div');
    overlayBottom.className = 'overlay-bottom';
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = item.title;
    titleSpan.style.fontWeight = 'bold'; // Mettre le titre en gras
    
    const shareIcon = document.createElement('i');
    shareIcon.className = 'fas fa-share-alt';
    shareIcon.onclick = () => alert(`Partager : ${item.title}`);

    overlayBottom.appendChild(titleSpan);
    overlayBottom.appendChild(shareIcon);

    // Assemblage de l'overlay
    overlayDiv.appendChild(overlayTop);
    overlayDiv.appendChild(overlayBottom);

    // Assemblage final de l'item
    itemDiv.appendChild(img);
    itemDiv.appendChild(overlayDiv);

    return itemDiv;
}

/**
 * Affiche la galerie avec les données filtrées
 * @param {array} data - Le tableau d'images à afficher
 */
function renderGallery(data) {
    galleryContainer.innerHTML = ''; // Vide le conteneur existant
    data.forEach(item => {
        galleryContainer.appendChild(createGalleryItem(item));
    });
}

/**
 * Gère la recherche et le filtrage des images
 */
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        renderGallery(inspirationData); // Afficher tout si la recherche est vide
        return;
    }

    const filteredData = inspirationData.filter(item => {
        // Recherche dans le titre
        if (item.title.toLowerCase().includes(query)) {
            return true;
        }
        // Recherche dans les tags
        if (item.tags.some(tag => tag.toLowerCase().includes(query))) {
            return true;
        }
        return false;
    });

    renderGallery(filteredData);
}

// Événement de recherche
searchInput.addEventListener('keyup', handleSearch);

// Chargement initial de la galerie au démarrage
document.addEventListener('DOMContentLoaded', () => {
    // Mélanger les données pour simuler un flux dynamique (comme Instagram/Pinterest)
    const shuffledData = inspirationData.sort(() => 0.5 - Math.random());
    renderGallery(shuffledData);
});
