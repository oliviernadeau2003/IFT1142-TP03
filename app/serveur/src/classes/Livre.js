// Livre.js
class Livre {
    constructor(id, titre, idAuteur, annee, pages, categorie, pochette) {
        this.id = id;
        this.titre = titre;
        this.idAuteur = idAuteur;
        this.annee = annee;
        this.pages = pages;
        this.categorie = categorie;
        this.pochette = pochette;
    }
}

module.exports = Livre;
