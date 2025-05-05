//* - Fonctions CRUD -

let donneesLivres;

//* Read
const reqListeLivre = async () => {
    const url = "/xml/livres";
    try {
        const reponse = await fetch(url, { method: "GET" });
        if (reponse.ok) {
            const xmlData = await reponse.text(); // Récupérer les données en texte
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlData, "application/xml"); // Convertir le texte en XML
            const livres = xmlDoc.getElementsByTagName('livre');
            donneesLivres = livres;
            afficherLivresParCards(livres);
        } else {
            throw new Error("Problème de chargement des livres!");
        }
    } catch (err) {
        alert(err.message);
    }
};

const reqListeCategorie = async () => {
    const url = "/xml/livres/categories";
    try {
        const reponse = await fetch(url, { method: "GET" });
        if (reponse.ok) {
            return await reponse.json();
        } else {
            throw new Exception("Problème de chargement des livres!");
        }
    } catch (err) {
        alert(err.message);
    }
}

const reqGetLivre = async (id) => {
    const url = `/xml/livres/${id}`;
    try {
        const reponse = await fetch(url, { method: "GET" });
        if (reponse.ok) {
            const livre = await reponse.json();
            return livre;
        } else {
            throw new Error("Problème de chargement du livre!");
        }
    } catch (err) {
        alert(err.message);
    }
};


const reqAfficherParCateg = async () => {
    try {
        const selCategs = document.getElementById("selCategs");
        const posChoisie = selCategs.selectedIndex;
        const optionChoisie = selCategs.options[posChoisie].text;

        let url;
        switch (optionChoisie) {
            case "Année":
                choix = $("#modalSelectionChoixCateg").val();
                url = `/xml/livres/annee/${choix}`;
                reponse = await fetch(url, { method: "GET" });

                if (reponse.ok) {
                    const xmlData = await reponse.text(); // Récupérer les données en texte
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlData, "application/xml"); // Convertir le texte en XML
                    const livres = xmlDoc.getElementsByTagName('livre');

                    afficherLivresParCards(livres);
                } else throw new Exception("Problème de chargement des Livres !");
                break;
            case "Auteur":
                choix = $("#modalSelectionChoixCateg").val();
                url = `/xml/livres/auteur/${choix}`;
                reponse = await fetch(url), { method: "GET" };

                if (reponse.ok) {
                    const xmlData = await reponse.text(); // Récupérer les données en texte
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlData, "application/xml"); // Convertir le texte en XML
                    const livres = xmlDoc.getElementsByTagName('livre');

                    afficherLivresParCards(livres);
                } else throw new Exception("Problème de chargement des Livres !");
                break;
            case "Catégorie":
                choix = $("#modalChoixCateg").val();
                url = `/xml/livres/categorie/${choix}`;
                reponse = await fetch(url, { method: "GET" });

                if (reponse.ok) {
                    const xmlData = await reponse.text(); // Récupérer les données en texte
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlData, "application/xml"); // Convertir le texte en XML
                    const livres = xmlDoc.getElementsByTagName('livre');

                    afficherLivresParCards(livres);
                } else throw new Exception("Problème de chargement des Livres !");
                break;

            default:
                alert("Erreur lors de la sélection.")
                break;
        }
    } catch (err) {
        alert(err.message);
    }

    $('#modalSelectionCategorie').modal('toggle');
}

//* Update
const reqUpdateLivre = async (idLivre) => {
    const url = `/xml/livres/update/${idLivre}`;
    try {
        const reponse = await fetch(url, { method: "PUT" });
        if (reponse.ok) {
            alert("Modification effectuée.")
            reqListeLivre();
        } else {
            alert("Erreur lors de la modification.")
            throw new Exception("Problème de chargement des Livres!");
        }
    } catch (err) {
        alert(err.message);
    }
}

function validerFormLivre(type) {
    if (type === "ajouter") {
        titre = document.getElementById("titre").value;
        idAuteur = document.getElementById("idAuteur").value.trim();
        annee = document.getElementById("annee").value.trim();
        pages = document.getElementById("pages").value.trim();
        categorie = document.getElementById("categorie").value.trim();
    } else if (type === "update") {
        titre = document.getElementById("update_titre").value.trim();
        idAuteur = document.getElementById("update_idAuteur").value.trim();
        annee = document.getElementById("update_annee").value.trim();
        pages = document.getElementById("update_pages").value.trim();
        categorie = document.getElementById("update_categorie").value.trim();
    }

    let erreurs = [];
    // Vérifie que tous les champs obligatoires sont remplis
    if (titre === "") erreurs.push("Le titre est requis.");
    if (idAuteur === "" || isNaN(idAuteur) || parseInt(idAuteur) <= 0) erreurs.push("L'ID Auteur doit être un nombre positif.");
    if (annee === "" || isNaN(annee) || parseInt(annee) > new Date().getFullYear());
    if (pages === "" || isNaN(pages) || parseInt(pages) <= 0) erreurs.push("Le nombre de pages doit être un nombre positif.");
    if (categorie === "") erreurs.push("La catégorie est requise.");


    if (erreurs.length > 0) {
        alert("Erreur(s) dans le formulaire :\n\n" + erreurs.join("\n"));
        return false;
    }

    return true;
}

//* Delete
const reqSupprimerLivre = async (idLivre) => {
    const url = `/xml/livres/supprimer/${idLivre}`;
    try {
        const reponse = await fetch(url, { method: "DELETE" });
        if (reponse.ok) {
            alert("Suppression effectuée.")
            // Cacher le toast apres la suppression
            const ToastConfirmation = document.getElementById('ToastConfirmation');
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(ToastConfirmation);
            toastBootstrap.hide();

            reqListeLivre();
        } else {
            alert("Erreur lors de la suppression.")
            throw new Exception("Problème de chargement des Livres!");
        }
    } catch (err) {
        alert(err.message);
    }
}

//* Autres
const trierParAnnee = () => {
    const livresArray = Array.from(donneesLivres);
    livresArray.sort((a, b) => {
        const anneeA = parseInt(a.getElementsByTagName('annee')[0].textContent);
        const anneeB = parseInt(b.getElementsByTagName('annee')[0].textContent);
        return anneeA - anneeB;
    });

    afficherLivresParCards(livresArray)
}

const trierParTitre = () => {
    const livresArray = Array.from(donneesLivres);
    livresArray.sort((a, b) => {
        const titreA = a.getElementsByTagName('titre')[0].textContent.toLowerCase();
        const titreB = b.getElementsByTagName('titre')[0].textContent.toLowerCase();
        return titreA.localeCompare(titreB);
    });

    afficherLivresParCards(livresArray);
};


// const reqGetLivre = async (id) => {
//     const url = `/xml/livres/${id}`;
//     try {
//         const reponse = await fetch(url, { method: "GET" });
//         if (reponse.ok) {
//             donneesLivres = await reponse.json();
//             return donneesLivres;
//         } else {
//             throw new Exception("Problème de chargement des livres!");
//         }
//     } catch (err) {
//         alert(err.message);
//     }
// }

// const reqListeLivre = async () => {
//     const url = "/xml/livres";
//     try {
//         const reponse = await fetch(url, { method: "GET" });
//         if (reponse.ok) {
//             donneesLivres = await reponse.json();
//             afficherLivresParCards(donneesLivres);
//         } else {
//             throw new Exception("Problème de chargement des livres!");
//         }
//     } catch (err) {
//         alert(err.message);
//     }
// }