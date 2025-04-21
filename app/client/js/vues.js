const creerCard = (livre) => {
    return `
        <div class="card" style="width: 18rem;">
                <h4>${livre.titre}</h4>
                <hr>
                <img src="http://localhost:3000/livres/pochettes/${livre?.pochette}"></img>

                <div class="container">
                    <hr>
                    <span>idAuteur : ${livre.idAuteur}</span><br>
                    <span>Année : ${livre.annee}</span><br>
                    <span>${livre.pages} pages</span><br>
                    <span class="capitalize">${capitalize(livre.categorie)}</span><br>
                    <hr>
                </div>

                <div class="d-flex flex-row gap-2 mx-2 justify-content-around my-3">
                    <button class="edit-button" id="updateLivrebtn" onclick="afficherModalModifier(${livre.id})">
                    <i class="bi bi-pencil"></i></button>
                    <button class="delete-button" id="liveToastBtn" onclick="afficherToastConfirmation(${livre.id})">
                    <i class="bi bi-trash3"></i></button>
                </div>

            </div>
    `;
}

// const creerSelectCategories = (categs) => {
//     const selCategs = document.getElementById('selCategs');
//     for (let uneCateg of categs) {
//         selCategs.options[selCategs.options.length] = new Option(uneCateg, uneCateg);
//     }
// }

const afficherLivresParCards = (donneesLivres) => {
    // const categs = donneesLivres.categories;
    // creerSelectCategories(categs);
    const listeLivres = donneesLivres.livres;
    let liste = `<div class="row">`;
    for (const livre of listeLivres) {
        liste += creerCard(livre);
    }
    document.getElementById('contenu').innerHTML = liste;
}

const afficherModalRechParCateg = async () => {
    const selCategs = document.getElementById("selCategs");
    const posChoisie = selCategs.selectedIndex;
    const optionChoisie = selCategs.options[posChoisie].text;

    if (optionChoisie === "Catégorie") {
        $("#modalSelectionCategorieHeader").text("Veuillez entrer la catégorie");
        $("#modalSelectionCategorieBody").html(`<select name="categorie" id="modalChoixCateg"></select>`);
        $("#modalChoixCateg").append(await creeOptionCategorie());
    } else if (optionChoisie === "Auteur") {
        $("#modalSelectionCategorieHeader").text("Veuillez entrer l'id de l'auteur");
        $("#modalSelectionCategorieBody").html(`<input type="text" id="modalSelectionChoixCateg">`);
    } else if (optionChoisie === "Année") {
        $("#modalSelectionCategorieHeader").text("Veuillez entrer l'année");
        $("#modalSelectionCategorieBody").html(`<input type="text" id="modalSelectionChoixCateg">`);
    }

    $('#modalSelectionCategorie').modal('show');
}

const creeOptionCategorie = async () => {
    let listeCategorie = await reqListeCategorie();

    var options = '';
    for (categorie of listeCategorie) {
        options += '<option value="' + categorie + '">' + capitalize(categorie) + '</option>';
    }
    return options;
}

// const afficherLivreParCategorie = (listeLivres) => {
//     let liste = `<div class="row">`;
//     for (const livre of listeLivres) {
//         liste += creerCard(livre);
//     }
//     document.getElementById("contenu").innerHTML = liste;
// };

const afficherToastConfirmation = (idLivre) => {
    const ToastConfirmation = document.getElementById('ToastConfirmation');
    const toastBody = ToastConfirmation.querySelector('.toast-body');

    // Update toast message with the book ID (or any other data)
    toastBody.innerHTML = `
        <i class="bi bi-trash3"></i> Voulez-vous vraiment supprimer ce livre (ID: ${idLivre}) ?
        <div class="mt-2 pt-2 border-top">
            <button type="button" class="btn btn-primary btn-sm" onclick="reqSupprimerLivre(${idLivre})">Oui</button>
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Annuler</button>
        </div>
    `;

    // Show the toast
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(ToastConfirmation);
    toastBootstrap.show();
};

const afficherModalModifier = async (idLivre) => {
    const livre = await reqGetLivre(idLivre);

    // Remplire les champs avec les données du livre
    document.getElementById('update_livreId').value = idLivre;
    document.getElementById('update_titre').value = livre.titre;
    document.getElementById('update_idAuteur').value = livre.idAuteur;
    document.getElementById('update_annee').value = livre.annee;
    document.getElementById('update_pages').value = livre.pages;
    document.getElementById('update_categorie').value = livre.categorie;

    // Ouvrir le modal
    const modal = new bootstrap.Modal(document.getElementById('idModalModifierLivre'));
    modal.show();
}

const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const rechercher = () => {
    $("#selCategs").trigger('change');
}