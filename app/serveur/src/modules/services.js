// Olivier Nadeau - IFT1142 Hiver 2025
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../donnees/livres.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let tabLivres = data.livres;
let tabCategories = data.categories;

// Update json data file
function sauvegarder() {
    fs.writeFileSync(dataPath, JSON.stringify({ categories: tabCategories, livres: tabLivres }, null, 4), 'utf8');
}

//* - Fonctions CRUD -

//* Create
function ajouterLivre(nouveauLivre) {
    // Vérification si l'id du livre existe déjà
    let existeDeja = tabLivres.some(livre => livre.id === nouveauLivre.id);
    if (existeDeja) {
        throw new Error("Un livre avec cet ID existe déjà.");
    }

    let categorieExiste = tabCategories.some(categorie => categorie === nouveauLivre.categorie)
    if (!categorieExiste) {
        tabCategories.push(nouveauLivre.categorie.toLowerCase())
    }

    // Ajouter le livre dans le tableau
    tabLivres.push(nouveauLivre);

    // Sauvegarde les changements dans le fichier JSON
    sauvegarder();

    console.log('Livre ajouté avec succès.');
}

//* Read
function getLivre(idLivre) {
    // Trouver l'index du livre
    const indexLivre = tabLivres.findIndex(livre => livre.id === parseInt(idLivre));
    return tabLivres[indexLivre];
}

function getLivreParCategorie(type, params) {
    let data;
    switch (type) {
        case "categorie":
            data = tabLivres.filter((livre) => livre.categorie === params);
            break;
        case "auteur":
            data = tabLivres.filter((livre) => livre.idAuteur === parseInt(params));
            break;
        case "annee":
            data = tabLivres.filter((livre) => livre.annee > parseInt(params));
            break;
        default:
            throw new Error("Type non supporté.")
    }
    return data;
}

//* Update
function modifierLivre(idLivre, updatedData) {
    // Trouver l'index du livre à mettre à jour
    const indexLivre = tabLivres.findIndex(livre => livre.id === parseInt(idLivre));

    if (indexLivre === -1) {
        throw new Error("Livre introuvable");
    }

    const livreExist = tabLivres[indexLivre];
    const ancienneCategorie = livreExist.categorie;
    const nouvelleCategorie = updatedData.categorie;

    // Mettre à jour les propriétés du livre
    const updatedLivre = { ...livreExist, ...updatedData };
    tabLivres[indexLivre] = updatedLivre;

    // Si la catégorie a changé
    if (ancienneCategorie && nouvelleCategorie && ancienneCategorie !== nouvelleCategorie) {
        // Vérifier s'il reste des livres avec l'ancienne catégorie
        const autresLivresAvecAncienneCategorie = tabLivres.some(
            (livre, index) =>
                livre.categorie.toLowerCase() === ancienneCategorie.toLowerCase() &&
                index !== indexLivre
        );

        // Supprimer l'ancienne catégorie si elle n'est plus utilisée
        if (!autresLivresAvecAncienneCategorie) {
            const indexAncienneCategorie = tabCategories.findIndex(
                cat => cat.toLowerCase() === ancienneCategorie.toLowerCase()
            );
            if (indexAncienneCategorie !== -1) {
                tabCategories.splice(indexAncienneCategorie, 1);
            }
        }

        // Ajouter la nouvelle catégorie si elle n'existe pas déjà
        const nouvelleExisteDeja = tabCategories.some(
            cat => cat.toLowerCase() === nouvelleCategorie.toLowerCase()
        );
        if (!nouvelleExisteDeja) {
            tabCategories.push(nouvelleCategorie);
        }
    }

    // Sauvegarder les modifications dans le fichier JSON
    sauvegarder();
    console.log('Livre modifié avec succès.');
}


//* Delete
function supprimerLivre(idLivre) {
    let indexLivre = tabLivres.findIndex((livre) => livre.id === parseInt(idLivre));

    if (indexLivre === -1) {
        throw new Error("Livre Introuvable");
    }

    // Récupérer la catégorie du livre à supprimer
    const categorieASupprimer = tabLivres[indexLivre].categorie;
    // Vérifier s'il reste des livres avec la même catégorie
    const livreAvecCategorie = tabLivres.some((livre) => livre.categorie.toLowerCase() === categorieASupprimer && livre.id !== parseInt(idLivre));

    // Si aucun livre n'a cette catégorie, supprimer la catégorie de tabCategories
    if (!livreAvecCategorie) {
        const indexCategorie = tabCategories.findIndex(categorie => categorie === categorieASupprimer);
        if (indexCategorie !== -1) {
            tabCategories.splice(indexCategorie, 1);  // Supprimer la catégorie de tabCategories
        }
    }

    tabLivres.splice(indexLivre, 1);
    sauvegarder();  // Sauvegarde dans le fichier JSON
    console.log('\nLivre supprimé avec succès.');
}

//* Autres

function getNextId() {
    // Trouver l'ID le plus élevé dans la liste des livres
    const ids = tabLivres.map(livre => livre.id); // Extraire tous les IDs des livres
    const maxId = ids.length > 0 ? Math.max(...ids) : 0; // Trouver l'ID maximum ou 0 si aucun livre

    // Le prochain ID est simplement l'ID maximum + 1
    return maxId + 1;
}

function getCategories() {
    return tabCategories;
}

module.exports = { getLivre, getLivreParCategorie, ajouterLivre, supprimerLivre, modifierLivre, getNextId, getCategories };