// Olivier Nadeau - IFT1142 Hiver 2025

// const dataPath = path.join(__dirname, '../../donnees/livres.json');
// let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
// let listeLivres = data.livres;
// let listeCategories = data.categories;

// main.js
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const Livre = require('../classes/Livre.js');

const parser = new xml2js.Parser({ explicitArray: false });
const dataPath = path.join(__dirname, '../../donnees/livres.xml');

let listeLivres = [];
let listeCategories = [];

fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) throw err;

    parser.parseString(data, (err, result) => {
        if (err) throw err;

        const root = result.root;

        // Stocker les catégories
        listeCategories = Array.isArray(root.categories.categorie) ? root.categories.categorie : [root.categories.categorie];

        // Créer les instances de Livre
        const livresData = Array.isArray(root.livres.livre) ? root.livres.livre : [root.livres.livre];

        listeLivres = livresData.map(livreData => {
            return new Livre(
                parseInt(livreData.id),
                livreData.titre,
                parseInt(livreData.idAuteur),
                parseInt(livreData.annee),
                parseInt(livreData.pages),
                livreData.categorie,
                livreData.pochette
            );
        });

        // console.log("Catégories :", listeCategories);
        // console.log("Liste des livres :", listeLivres);
    });
});

//* Fonction pour générer du XML à partir des données
function genererXML(listeCategories, livres) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n`;

    xml += `<categories>\n`;
    for (const categorie of listeCategories) {
        xml += `<categorie>${categorie}</categorie>\n`;
    }
    xml += `</categories>\n`;

    xml += `<livres>\n`;
    for (const livre of livres) {
        xml += `<livre>\n`;
        xml += `<id>${livre.id}</id>\n`;
        xml += `<titre>${livre.titre}</titre>\n`;
        xml += `<idAuteur>${livre.idAuteur}</idAuteur>\n`;
        xml += `<annee>${livre.annee}</annee>\n`;
        xml += `<pages>${livre.pages}</pages>\n`;
        xml += `<categorie>${livre.categorie}</categorie>\n`;
        xml += `<pochette>${livre.pochette}</pochette>\n`;
        xml += `</livre>\n`;
    }
    xml += `</livres>\n`;

    xml += `</root>\n`;
    return xml;
}

//* - Fonction pour sauvegarder dans le fichier XML
function sauvegarder() {
    const xmlData = genererXML(listeCategories, listeLivres);
    fs.writeFileSync(dataPath, xmlData, 'utf8');
}

//* - Fonctions CRUD -

//* Create
function ajouterLivre(nouveauLivre) {
    let existeDeja = listeLivres.some(livre => livre.id === nouveauLivre.id);
    if (existeDeja) {
        throw new Error("Un livre avec cet ID existe déjà.");
    }

    let categorieExiste = listeCategories.some(categorie => categorie === nouveauLivre.categorie);
    if (!categorieExiste) {
        listeCategories.push(nouveauLivre.categorie);
    }

    listeLivres.push(nouveauLivre);
    sauvegarder();
    console.log(`Livre "${nouveauLivre.titre}" ajouté avec succès.`);
}

//* Read
function getLivre(idLivre) {
    const indexLivre = listeLivres.findIndex(livre => livre.id === parseInt(idLivre));
    return listeLivres[indexLivre];
}

function getLivreParCategorie(type, params) {
    let data;
    switch (type) {
        case "categorie":
            data = listeLivres.filter(livre => livre.categorie === params);
            break;
        case "auteur":
            data = listeLivres.filter(livre => livre.idAuteur === parseInt(params));
            break;
        case "annee":
            data = listeLivres.filter(livre => livre.annee > parseInt(params));
            break;
        default:
            throw new Error("Type non supporté.");
    }
    return data;
}

//* Update
function modifierLivre(idLivre, updatedData) {
    const indexLivre = listeLivres.findIndex(livre => livre.id === parseInt(idLivre));
    if (indexLivre === -1) {
        throw new Error("Livre introuvable");
    }

    const livreExist = listeLivres[indexLivre];
    const ancienneCategorie = livreExist.categorie;
    const nouvelleCategorie = updatedData.categorie;

    const updatedLivre = { ...livreExist, ...updatedData };
    listeLivres[indexLivre] = updatedLivre;

    // Modification / Suppression de la catégorie
    if (ancienneCategorie && nouvelleCategorie && ancienneCategorie !== nouvelleCategorie) {
        const autresLivresAvecAncienneCategorie = listeLivres.some(
            (livre, idx) => livre.categorie.toLowerCase() === ancienneCategorie.toLowerCase() && idx !== indexLivre
        );

        if (!autresLivresAvecAncienneCategorie) {
            const indexAncienneCategorie = listeCategories.findIndex(cat => cat.toLowerCase() === ancienneCategorie.toLowerCase());
            if (indexAncienneCategorie !== -1) {
                listeCategories.splice(indexAncienneCategorie, 1);
            }
        }

        const nouvelleExisteDeja = listeCategories.some(cat => cat.toLowerCase() === nouvelleCategorie.toLowerCase());
        if (!nouvelleExisteDeja) {
            listeCategories.push(nouvelleCategorie);
        }
    }

    sauvegarder();
    console.log(`Livre "${updatedLivre.titre}" modifié avec succès.`);
}

//* Delete
function supprimerLivre(idLivre) {
    let indexLivre = listeLivres.findIndex(livre => livre.id === parseInt(idLivre));
    if (indexLivre === -1) {
        throw new Error("Livre introuvable");
    }

    const categorieASupprimer = listeLivres[indexLivre].categorie;
    const livreAvecCategorie = listeLivres.some(livre => livre.categorie.toLowerCase() === categorieASupprimer.toLowerCase() && livre.id !== parseInt(idLivre));

    if (!livreAvecCategorie) {
        const indexCategorie = listeCategories.findIndex(categorie => categorie === categorieASupprimer);
        if (indexCategorie !== -1) {
            listeCategories.splice(indexCategorie, 1);
        }
    }

    listeLivres.splice(indexLivre, 1);
    sauvegarder();
    console.log(`Livre supprimé avec succès.`);
}

//* Autres
function getNextId() {
    const ids = listeLivres.map(livre => livre.id);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return maxId + 1;
}

function getCategories() {
    return listeCategories;
}

module.exports = {
    getLivre,
    getLivreParCategorie,
    ajouterLivre,
    supprimerLivre,
    modifierLivre,
    getNextId,
    getCategories
};


// // Update json data file
// function sauvegarder() {
//     fs.writeFileSync(dataPath, JSON.stringify({ categories: listeCategories, livres: listeLivres }, null, 4), 'utf8');
// }

// //* - Fonctions CRUD -

// //* Create
// function ajouterLivre(nouveauLivre) {
//     // Vérification si l'id du livre existe déjà
//     let existeDeja = listeLivres.some(livre => livre.id === nouveauLivre.id);
//     if (existeDeja) {
//         throw new Error("Un livre avec cet ID existe déjà.");
//     }

//     let categorieExiste = listeCategories.some(categorie => categorie === nouveauLivre.categorie)
//     if (!categorieExiste) {
//         listeCategories.push(nouveauLivre.categorie.toLowerCase())
//     }

//     // Ajouter le livre dans le tableau
//     listeLivres.push(nouveauLivre);

//     // Sauvegarde les changements dans le fichier JSON
//     sauvegarder();

//     console.log('Livre ajouté avec succès.');
// }

// //* Read
// function getLivre(idLivre) {
//     // Trouver l'index du livre
//     const indexLivre = listeLivres.findIndex(livre => livre.id === parseInt(idLivre));
//     return listeLivres[indexLivre];
// }

// function getLivreParCategorie(type, params) {
//     let data;
//     switch (type) {
//         case "categorie":
//             data = listeLivres.filter((livre) => livre.categorie === params);
//             break;
//         case "auteur":
//             data = listeLivres.filter((livre) => livre.idAuteur === parseInt(params));
//             break;
//         case "annee":
//             data = listeLivres.filter((livre) => livre.annee > parseInt(params));
//             break;
//         default:
//             throw new Error("Type non supporté.")
//     }
//     return data;
// }

// //* Update
// function modifierLivre(idLivre, updatedData) {
//     // Trouver l'index du livre à mettre à jour
//     const indexLivre = listeLivres.findIndex(livre => livre.id === parseInt(idLivre));

//     if (indexLivre === -1) {
//         throw new Error("Livre introuvable");
//     }

//     const livreExist = listeLivres[indexLivre];
//     const ancienneCategorie = livreExist.categorie;
//     const nouvelleCategorie = updatedData.categorie;

//     // Mettre à jour les propriétés du livre
//     const updatedLivre = { ...livreExist, ...updatedData };
//     listeLivres[indexLivre] = updatedLivre;

//     // Si la catégorie a changé
//     if (ancienneCategorie && nouvelleCategorie && ancienneCategorie !== nouvelleCategorie) {
//         // Vérifier s'il reste des livres avec l'ancienne catégorie
//         const autresLivresAvecAncienneCategorie = listeLivres.some(
//             (livre, index) =>
//                 livre.categorie.toLowerCase() === ancienneCategorie.toLowerCase() &&
//                 index !== indexLivre
//         );

//         // Supprimer l'ancienne catégorie si elle n'est plus utilisée
//         if (!autresLivresAvecAncienneCategorie) {
//             const indexAncienneCategorie = listeCategories.findIndex(
//                 cat => cat.toLowerCase() === ancienneCategorie.toLowerCase()
//             );
//             if (indexAncienneCategorie !== -1) {
//                 listeCategories.splice(indexAncienneCategorie, 1);
//             }
//         }

//         // Ajouter la nouvelle catégorie si elle n'existe pas déjà
//         const nouvelleExisteDeja = listeCategories.some(
//             cat => cat.toLowerCase() === nouvelleCategorie.toLowerCase()
//         );
//         if (!nouvelleExisteDeja) {
//             listeCategories.push(nouvelleCategorie);
//         }
//     }

//     // Sauvegarder les modifications dans le fichier JSON
//     sauvegarder();
//     console.log('Livre modifié avec succès.');
// }


// //* Delete
// function supprimerLivre(idLivre) {
//     let indexLivre = listeLivres.findIndex((livre) => livre.id === parseInt(idLivre));

//     if (indexLivre === -1) {
//         throw new Error("Livre Introuvable");
//     }

//     // Récupérer la catégorie du livre à supprimer
//     const categorieASupprimer = listeLivres[indexLivre].categorie;
//     // Vérifier s'il reste des livres avec la même catégorie
//     const livreAvecCategorie = listeLivres.some((livre) => livre.categorie.toLowerCase() === categorieASupprimer && livre.id !== parseInt(idLivre));

//     // Si aucun livre n'a cette catégorie, supprimer la catégorie de listeCategories
//     if (!livreAvecCategorie) {
//         const indexCategorie = listeCategories.findIndex(categorie => categorie === categorieASupprimer);
//         if (indexCategorie !== -1) {
//             listeCategories.splice(indexCategorie, 1);  // Supprimer la catégorie de listeCategories
//         }
//     }

//     listeLivres.splice(indexLivre, 1);
//     sauvegarder();  // Sauvegarde dans le fichier JSON
//     console.log('\nLivre supprimé avec succès.');
// }

// //* Autres

// function getNextId() {
//     // Trouver l'ID le plus élevé dans la liste des livres
//     const ids = listeLivres.map(livre => livre.id); // Extraire tous les IDs des livres
//     const maxId = ids.length > 0 ? Math.max(...ids) : 0; // Trouver l'ID maximum ou 0 si aucun livre

//     // Le prochain ID est simplement l'ID maximum + 1
//     return maxId + 1;
// }

// function getCategories() {
//     return listeCategories;
// }

// module.exports = { getLivre, getLivreParCategorie, ajouterLivre, supprimerLivre, modifierLivre, getNextId, getCategories };