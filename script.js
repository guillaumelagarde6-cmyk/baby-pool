
// ============================================================
// 1. CONFIGURATION
// ============================================================

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("pageshow", function() {
    window.scrollTo(0, 0);
});

// URL de l'API Google Apps Script qui enregistre les pronostics
// et renvoie les statistiques du Baby Pool.

const scriptURL ="https://script.google.com/macros/s/AKfycbxxx1LM6qzN8Ty00kaarmXxiZBcnIQPkhWUXh_n5bcbzhau84kzHBPh9Htbv5V72c-NJg/exec";

// ============================================================
// 2. POPUP DE NOTIFICATION
// ============================================================

// Affiche une notification avec une icone, un titre et un message.

function showPopup(icon, title, message) {

    document.getElementById("popupIcon").textContent = icon;

    document.getElementById("popupTitle").textContent = title;

    document.getElementById("popupMessage").textContent = message;

    document.getElementById("popup").style.display = "flex";
   
}

// Ferme la notification principale.
function closePopup() {

    document.getElementById("popup").style.display = "none";
}


// Fermer la notification avec le bouton "Fermer".
document
.getElementById("popupClose")
.addEventListener("click", closePopup);

// Fermer la notification en cliquant sur son arriere-plan.
document
.getElementById("popup")
.addEventListener("click", function (e) {

    if (e.target.id === "popup") {

        closePopup();
    }
});

// ============================================================
// 3. POPUP DU FORMULAIRE
// ============================================================

// Recuperation des elements necessaires a l'ouverture et la fermeture du formulaire.
const popupFormulaire =
    document.getElementById("popupFormulaire");
const boutonOuvrirFormulaire =
    document.getElementById("ouvrirFormulaire");
const boutonFermerFormulaire =
    document.getElementById("fermerFormulaire");
function ouvrirFormulaire() {
    popupFormulaire.style.display = "flex";
    document.body.classList.add("popup-ouverte");
}
function fermerFormulaire() {
    popupFormulaire.style.display = "none";
    document.body.classList.remove("popup-ouverte");
}

// Brancher les boutons d'ouverture et de fermeture du formulaire.
boutonOuvrirFormulaire.addEventListener(
    "click",
    ouvrirFormulaire
);
boutonFermerFormulaire.addEventListener(
    "click",
    fermerFormulaire
);
popupFormulaire.addEventListener("click", function (e) {
    if (e.target === popupFormulaire) {
        fermerFormulaire();
    }
});

// ------------------------------------------------------------
// Compteur de caracteres du message pour bebe
// ------------------------------------------------------------

const textareaMotBebe =
    document.getElementById("motBebe");
const compteurMotBebe =
    document.getElementById("compteurMotBebe");
textareaMotBebe.addEventListener("input", function () {
    const longueur = textareaMotBebe.value.length;

    compteurMotBebe.textContent =
        longueur +
        " / 300 caractères";
    compteurMotBebe.style.color =
        longueur > 250 ? "#b85d82" : "#9b9b9b";
});

// Elements reutilises pendant l'envoi du formulaire.
const formulaire = document.getElementById("babyForm");
const boutonEnvoyerFormulaire = formulaire.querySelector(
    "button[type='submit']"
);
const loaderFormulaire = document.getElementById("loaderFormulaire");

const champsFormulaire = {
    joueur: document.getElementById("joueur"),
    prenom: document.getElementById("prenom"),
    date: document.getElementById("date"),
    heure: document.getElementById("heure"),
    poids: document.getElementById("poids"),
    taille: document.getElementById("taille"),
    cheveux: document.getElementById("cheveux"),
    ressemblance: document.getElementById("ressemblance"),
    motBebe: textareaMotBebe
};

function definirEnvoiEnCours(enCours) {
    loaderFormulaire.style.display = enCours ? "flex" : "none";
    boutonEnvoyerFormulaire.disabled = enCours;
}

// ============================================================
// 4. ENVOI DU FORMULAIRE
// ============================================================

// Collecter les champs, envoyer le pronostic et afficher le resultat.
formulaire.addEventListener("submit", async function (e) {

    e.preventDefault();
    // Afficher le chargement et bloquer le bouton pour eviter un double envoi.
    definirEnvoiEnCours(true);

    // Construire l'objet transmis a Google Apps Script.
    const data = {
        joueur: champsFormulaire.joueur.value,
        prenom: champsFormulaire.prenom.value,
        date: champsFormulaire.date.value,
        heure: champsFormulaire.heure.value,
        poids: champsFormulaire.poids.value,
        taille: champsFormulaire.taille.value,
        cheveux: champsFormulaire.cheveux.value,
        ressemblance: champsFormulaire.ressemblance.value,
        motBebe: champsFormulaire.motBebe.value
    };

    try {

        const response = await fetch(scriptURL, {

            method: "POST",

            body: JSON.stringify(data)

        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const result = await response.json();

        // Reinitialiser le formulaire et rafraichir les tendances si l'envoi a reussi.
        if (result.success) {
            formulaire.reset();
            fermerFormulaire();
            definirEnvoiEnCours(false);
            showPopup(
                "🎉",
                "Pronostic enregistré",
                "Merci pour votre participation !"
            );
            chargerTendances();
        }
        // Afficher un message adapte si le serveur refuse le pronostic.
        else {
            fermerFormulaire();
            definirEnvoiEnCours(false);
            showPopup(
                "😅",
                "Pronostic non pris en compte",
                "Op op op là t'as déjà participé !",
                
            );

        }

    }
   catch (error) {

       // Gerer les erreurs reseau ou les reponses impossibles a traiter.
       console.error("Erreur complète :", error);
       definirEnvoiEnCours(false);


        showPopup(
            "❌",
            "Erreur",
            "Une erreur est survenue lors de l'envoi du pronostic."
        );

    }

});

// ============================================================
// 5. CHARGEMENT ET AFFICHAGE DES TENDANCES
// ============================================================

// Dernieres donnees recues : le tri peut les reutiliser sans nouvel appel reseau.
let statistiquesGlobales = null;
const listeLivreDor = document.getElementById("listeLivreDor");

// Formater une date pour son affichage dans les cartes du livre d'or.
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    const dateTexte = date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const heureTexte = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
    }).replace(":", "h");

    return dateTexte.charAt(0).toUpperCase() +
        dateTexte.slice(1) +
        " à " +
        heureTexte;
}

// Recuperer les statistiques et reconstruire le contenu du livre d'or.
async function chargerTendances(recharger = true) {

    try {

        let stats = statistiquesGlobales;

        if (recharger || !stats) {
            // Ajouter un timestamp uniquement lors d'un vrai rechargement.
            const response = await fetch(
                scriptURL + "?t=" + Date.now()
            );

            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            stats = await response.json();
            statistiquesGlobales = stats;
        }

        if (recharger) {
            // Mettre a jour les six indicateurs apres un appel App Script.
            document.getElementById("nbPronostics").textContent = stats.total;

            afficherValeurTendance(
                document.getElementById("tendancePrenom"),
                stats.prenomFavori
            );
            afficherValeurTendance(
                document.getElementById("tendanceHeure"),
                stats.heureFavorite
            );
            afficherValeurTendance(
                document.getElementById("tendancePoids"),
                stats.poidsFavori
            );
            afficherValeurTendance(
                document.getElementById("tendanceTaille"),
                stats.tailleFavorite
            );
            afficherValeurTendance(
                document.getElementById("tendanceCheveux"),
                stats.cheveuxFavoris
            );
            afficherValeurTendance(
                document.getElementById("tendanceRessemblance"),
                stats.ressemblanceFavorite
            );
        }

        listeLivreDor.replaceChildren();

        // Copier puis trier les messages sans modifier la reponse originale.
        const messagesTries = [...stats.messagesBebe];
        if (ordreLivreDor === "recent") {
            messagesTries.sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
        } else {
            messagesTries.sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
        }

        // Cloner le template HTML puis remplir ses champs avec du texte.
        const modeleCarte = document.getElementById("modeleMessageLivreDor");
        const cartes = document.createDocumentFragment();

        messagesTries.forEach(function(message) {
            const carte = modeleCarte.content.cloneNode(true);
            const elementCarte = carte.querySelector(".message-livre-dor");

            if (!livreDorDeverrouille) {
                elementCarte.classList.add("floute");
            }

            remplirChampCarte(carte, "auteur", message.auteur);
            remplirChampCarte(carte, "prenom", message.prenom);
            remplirChampCarte(carte, "date", message.date);
            remplirChampCarte(carte, "heure", message.heure);
            remplirChampCarte(carte, "poids", `${message.poids} g`);
            remplirChampCarte(carte, "taille", `${message.taille} cm`);
            remplirChampCarte(carte, "cheveux", message.cheveux);
            remplirChampCarte(
                carte,
                "timestamp",
                formatTimestamp(message.timestamp)
            );
            remplirChampCarte(carte, "message", message.message);

            cartes.append(carte);
        });

        listeLivreDor.append(cartes);

        if (livreDorVisite && !livreDorDeverrouille) {
            programmerAnimationDeverrouillage();
        }

    }
    catch (error) {

        console.error(error);

    }

}

// ============================================================
// 6. ETAT DU LIVRE D'OR ET TRI
// ============================================================

// ordreLivreDor determine l'ordre d'affichage des messages.
// livreDorDeverrouille indique si le contenu protege est visible.
let ordreLivreDor = "recent";
let livreDorDeverrouille = false;
let livreDorVisite = false;
let livreDorAnimationProgrammee = false;
let livreDorAnimationLancee = false;
let bravoClassementAffiche = false;
let bravoClassementProgramme = false;

function afficherBravoClassement() {
    if (bravoClassementAffiche || bravoClassementProgramme) {
        return;
    }

    bravoClassementProgramme = true;
    setTimeout(function() {
        bravoClassementProgramme = false;
        if (
            bravoClassementAffiche ||
            containerClassement.style.display !== "block"
        ) {
            return;
        }

        bravoClassementAffiche = true;
        const celebration = document.createElement("div");
        celebration.className = "celebration-bravo";
        const bravo = document.createElement("img");
        const mouvementReduit = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (!mouvementReduit) {
            bravo.className = "bravo-en-rotation";
        }
        bravo.alt = "Bravo !";
        celebration.addEventListener("animationend", function(event) {
            if (
                event.target === celebration &&
                event.animationName === "apparition-bravo"
            ) {
                celebration.remove();
            }
        });
        if (mouvementReduit) {
            setTimeout(function() {
                celebration.remove();
            }, 5000);
        } else {
            function terminerRotation(event) {
                if (event.animationName !== "rotation-bravo") {
                    return;
                }

                bravo.removeEventListener("animationend", terminerRotation);
                bravo.classList.remove("bravo-en-rotation");
                bravo.src = "images/bravogui.gif";
            }
            bravo.addEventListener("animationend", terminerRotation);
        }
        bravo.addEventListener("error", function() {
            bravoClassementAffiche = false;
            celebration.remove();
            console.error("Impossible de charger images/bravogui.gif");
        }, { once: true });
        bravo.src = mouvementReduit
            ? "images/bravogui.gif"
            : "images/bravogui-premier-cadre.png";
        celebration.append(bravo);
        document.body.append(celebration);
    }, 0);
}

function programmerDeverrouillageContainer(container, apresDeverrouillage) {
    if (
        !container.classList.contains("verrouille") ||
        container.dataset.deverrouillageProgramme === "true"
    ) {
        return;
    }

    container.dataset.deverrouillageProgramme = "true";

    setTimeout(function() {
        if (!container.classList.contains("verrouille")) {
            return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            container.classList.remove("verrouille");
            delete container.dataset.deverrouillageProgramme;
            if (apresDeverrouillage) {
                apresDeverrouillage();
            }
            return;
        }

        container.classList.add("explosion-container");
        function terminerDeverrouillage(event) {
            if (
                event.target !== container ||
                event.pseudoElement !== "::after" ||
                event.animationName !== "explosion-cadenas-container"
            ) {
                return;
            }

            container.classList.remove("verrouille", "explosion-container");
            delete container.dataset.deverrouillageProgramme;
            container.removeEventListener(
                "animationend",
                terminerDeverrouillage
            );
            if (apresDeverrouillage) {
                apresDeverrouillage();
            }
        }

        container.addEventListener(
            "animationend",
            terminerDeverrouillage
        );
    }, 900);
}

function programmerAnimationDeverrouillage() {
    if (livreDorAnimationProgrammee || livreDorAnimationLancee) {
        return;
    }

    livreDorAnimationProgrammee = true;
    setTimeout(function() {
        livreDorAnimationProgrammee = false;

        if (
            livreDorDeverrouille ||
            !listeLivreDor.querySelector(".message-livre-dor.floute")
        ) {
            return;
        }

        lancerAnimationDeverrouillage();
    }, 700);
}

function lancerAnimationDeverrouillage() {
    const cartesFloutees = [
        ...listeLivreDor.querySelectorAll(".message-livre-dor.floute")
    ];

    if (cartesFloutees.length === 0) {
        return;
    }

    livreDorAnimationLancee = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cartesFloutees.forEach(function(carte) {
            carte.classList.remove("floute");
        });
        livreDorDeverrouille = true;
        return;
    }

    cartesFloutees.forEach(function(carte, index) {
        carte.style.setProperty(
            "--delai-explosion",
            `${Math.min(index * 60, 600)}ms`
        );
        carte.classList.add("explosion");
        carte.addEventListener("animationend", function(event) {
            if (
                event.target !== carte ||
                event.pseudoElement !== "::after" ||
                event.animationName !== "explosion-cadenas"
            ) {
                return;
            }

            carte.classList.remove("floute", "explosion");
            carte.style.removeProperty("--delai-explosion");

            if (!listeLivreDor.querySelector(".message-livre-dor.floute")) {
                livreDorDeverrouille = true;
            }
        });
    });
}

// Alterner entre les messages les plus recents et les plus anciens.
document
    .getElementById("btnTriLivreDor")
    .addEventListener("click", function() {
        if (ordreLivreDor === "recent") {
            ordreLivreDor = "ancien";
            this.textContent = "⬆️";
        } else {
            ordreLivreDor = "recent";
            this.textContent = "⬇️";
        }
        // Le tri reutilise les donnees deja recues et ne relance pas App Script.
        chargerTendances(false);
    });

// Premier chargement des statistiques et des messages.
chargerTendances();

// ------------------------------------------------------------
// 7. REMPLISSAGE DES ELEMENTS HTML
// ------------------------------------------------------------

// Afficher une tendance dans le span deja present dans index.html.
function afficherValeurTendance(element, valeur) {
    const contenu = element.querySelector(".valeur-contenu");
    const valeurAbsente =
        valeur === undefined ||
        valeur === null ||
        valeur === "" ||
        valeur === "undefined" ||
        valeur === "Pas de tendance";

    contenu.textContent = valeurAbsente ? "Pas de tendance" : valeur;
    contenu.classList.toggle("pas-tendance", valeurAbsente);
}

// Remplir tous les champs portant le meme nom dans les versions desktop
// et mobile de la carte du livre d'or.
function remplirChampCarte(carte, nomChamp, valeur) {
    carte.querySelectorAll(`[data-champ="${nomChamp}"]`).forEach(function(element) {
        element.textContent = valeur ?? "";
    });
}

// ============================================================
// 8. DEVERROUILLAGE DU LIVRE D'OR
// ============================================================

/*
// Ancien deverrouillage par code conserve pour une reutilisation future.
// Verifier le code, retirer la classe de floutage et fermer la popup.
document.getElementById(
    "validerCodeLivreDor"
).addEventListener(
    "click",
    function () {

        const code =
            document.getElementById(
                "codeLivreDor"
            ).value;

        if (code === "197346825") {
            livreDorDeverrouille = true;
            document
                .querySelectorAll(".message-livre-dor.floute")
                .forEach(function(card) {
                    card.classList.remove("floute");
                });

            popupLivreDor.style.display = "none";

        }

    }
);
*/
// ============================================================
// 9. NAVIGATION ENTRE LES ONGLETS
// ============================================================

// Recuperer les boutons et les trois panneaux principaux.
const ongletLivreDor =
    document.getElementById("ongletLivreDor");

const ongletAccueil =
    document.getElementById("ongletAccueil");

const ongletClassement =
    document.getElementById("ongletClassement");

const tendances =
    document.getElementById("tendances");

 const ongletHistorique =
    document.getElementById("ongletHistorique");   

const containerLivreDor =
    document.getElementById("containerLivreDor");

const containerClassement =
    document.getElementById("containerClassement");

const containerAccueil =
    document.getElementById("containerAccueil");

const ongletTendance =
    document.getElementById("ongletTendance");

 const containerHistorique =
    document.getElementById("containerHistorique");   


// ------------------------------------------------------------
// Afficher un panneau et synchroniser l'etat visuel des onglets.
// ------------------------------------------------------------

const onglets = [
    ongletAccueil,
    ongletClassement,
    ongletHistorique,
    ongletLivreDor,
    ongletTendance
];

const panneauxOnglets = [
    containerAccueil,
    containerClassement,
    containerHistorique,
    containerLivreDor,
    tendances
];

function afficherOnglet(ongletSelectionne, panneauSelectionne) {
    panneauxOnglets.forEach(function (panneau) {
        panneau.style.display =
            panneau === panneauSelectionne ? "block" : "none";
    });

    onglets.forEach(function (onglet) {
        const selectionne = onglet === ongletSelectionne;
        onglet.classList.toggle("onglet-actif", selectionne);
        onglet.classList.toggle("onglet-inactif", !selectionne);
    });

    window.scrollTo(0, 0);
    requestAnimationFrame(function() {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
    });

    const titresAvecCigogne = [
        ...panneauSelectionne.querySelectorAll(
            "h3:not(.separateur-tendances)"
        )
    ];
    titresAvecCigogne.forEach(function(titre) {
        titre.classList.remove("cigogne-active");
    });
    void panneauSelectionne.offsetWidth;
    requestAnimationFrame(function() {
        titresAvecCigogne.forEach(function(titre) {
            titre.classList.add("cigogne-active");
        });
    });
}

// Etat affiche au chargement de la page.
afficherOnglet(ongletAccueil, containerAccueil);
programmerDeverrouillageContainer(containerAccueil);

ongletAccueil.addEventListener("click", function () {
    afficherOnglet(ongletAccueil, containerAccueil);
    programmerDeverrouillageContainer(containerAccueil);
});

ongletTendance.addEventListener("click", function () {
    afficherOnglet(ongletTendance, tendances);
});

ongletClassement.addEventListener("click", function () {
    afficherOnglet(ongletClassement, containerClassement);
    afficherBravoClassement();
});

ongletLivreDor.addEventListener("click", function () {
    afficherOnglet(ongletLivreDor, containerLivreDor);
    livreDorVisite = true;
    programmerAnimationDeverrouillage();
});

ongletHistorique.addEventListener("click", function () {
    afficherOnglet(ongletHistorique, containerHistorique);
    programmerDeverrouillageContainer(containerHistorique);
});

const mobileTabMenu = document.getElementById("mobileTabMenu");
const mobileTabToggle = document.getElementById("mobileTabToggle");
const mobileTabOptions = document.getElementById("mobileTabOptions");
const mobileTabBackdrop = document.getElementById("mobileTabBackdrop");
const mobileTabOptionButtons = [
    ...mobileTabOptions.querySelectorAll(".mobile-tab-option")
];
let mobileTabCloseTimer;

function synchroniserOngletsMobiles() {
    mobileTabOptionButtons.forEach(function(option) {
        const ongletOriginal = document.getElementById(
            option.dataset.onglet
        );
        option.classList.toggle(
            "onglet-actif",
            ongletOriginal.classList.contains("onglet-actif")
        );
    });
}

function fermerMenuMobile() {
    clearTimeout(mobileTabCloseTimer);
    mobileTabMenu.classList.add("menu-fermeture");
    mobileTabMenu.classList.remove("menu-ouvert");
    mobileTabBackdrop.classList.remove("menu-ouvert");
    mobileTabToggle.setAttribute("aria-expanded", "false");
    mobileTabToggle.setAttribute(
        "aria-label",
        "Ouvrir le menu des onglets"
    );
    mobileTabCloseTimer = setTimeout(function() {
        mobileTabOptions.hidden = true;
        mobileTabBackdrop.hidden = true;
        mobileTabMenu.classList.remove("menu-fermeture");
    }, 1100);
}

mobileTabToggle.addEventListener("click", function() {
    const doitOuvrir =
        mobileTabToggle.getAttribute("aria-expanded") !== "true";

    clearTimeout(mobileTabCloseTimer);
    if (doitOuvrir) {
        mobileTabOptions.hidden = false;
        mobileTabBackdrop.hidden = false;
        requestAnimationFrame(function() {
            mobileTabMenu.classList.remove("menu-fermeture");
            mobileTabMenu.classList.add("menu-ouvert");
            mobileTabBackdrop.classList.add("menu-ouvert");
            synchroniserOngletsMobiles();
        });
    } else {
        fermerMenuMobile();
    }

    mobileTabToggle.setAttribute("aria-expanded", String(doitOuvrir));
    mobileTabToggle.setAttribute(
        "aria-label",
        doitOuvrir ? "Fermer le menu des onglets" : "Ouvrir le menu des onglets"
    );
});

mobileTabOptionButtons.forEach(function(option) {
    option.addEventListener("click", function() {
        document.getElementById(option.dataset.onglet).click();
        synchroniserOngletsMobiles();
        fermerMenuMobile();
    });
});

document.addEventListener("click", function(event) {
    if (
        !mobileTabOptions.hidden &&
        event.target instanceof Node &&
        !mobileTabMenu.contains(event.target)
    ) {
        fermerMenuMobile();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && !mobileTabOptions.hidden) {
        fermerMenuMobile();
        mobileTabToggle.focus();
    }
});

synchroniserOngletsMobiles();

// ============================================================
// 10. POPUP DE CODE DU LIVRE D'OR
// ============================================================

/*
// Ancien popup de demande de code conserve pour une reutilisation future.
// Recuperer le bouton de fermeture et la popup demandant le code.
const boutonFermerLivreDor =
    document.getElementById("fermerLivreDor");

const popupLivreDor =
    document.getElementById("popupCodeLivreDor");
const codeLivreDor =
    document.getElementById("codeLivreDor");

// Ouvrir la demande de code lorsqu'une carte est verrouillee.
// Cet ecouteur est declare une seule fois, en dehors du rechargement des donnees.
listeLivreDor.addEventListener("click", function(event) {
    if (livreDorDeverrouille) {
        return;
    }

    const carteFloutee = event.target.closest(".message-livre-dor.floute");

    if (!carteFloutee) {
        return;
    }

    popupLivreDor.style.display = "flex";
    codeLivreDor.value = "";

    setTimeout(function() {
        codeLivreDor.focus();
    }, 100);
});

// Fermer la popup avec son bouton.
boutonFermerLivreDor.addEventListener(
    "click",
    function () {

        popupLivreDor.style.display =
            "none";

    }
);

// Fermer la popup en cliquant sur son arriere-plan.
popupLivreDor.addEventListener(
    "click",
    function (e) {

        if (e.target === popupLivreDor) {

            popupLivreDor.style.display =
                "none";

        }

    }
);
*/
// ============================================================
// 11. POPUP D'INFORMATIONS DU CLASSEMENT
// ============================================================

// Recuperer les elements de la popup expliquant le calcul des points.
const btnInfoClassement =
    document.getElementById("btnInfoClassement");

const popupClassement =
    document.getElementById("popupClassement");

const fermerPopupClassement =
    document.getElementById("fermerPopupClassement");

// Ouvrir les regles du classement.
btnInfoClassement.addEventListener(
    "click",
    function () {

        popupClassement.style.display =
            "flex";

    }
);

// Fermer les regles du classement avec le bouton.
fermerPopupClassement.addEventListener(
    "click",
    function () {

        popupClassement.style.display =
            "none";

    }
);

// Fermer les regles en cliquant sur l'arriere-plan.
popupClassement.addEventListener(
    "click",
    function (e) {

        if (e.target === popupClassement) {

            popupClassement.style.display =
                "none";

        }

    }
);

// Ouvrir les photos de l'historique en grand.
const popupPhotoHistorique =
    document.getElementById("popupPhotoHistorique");
const imagePopupHistorique =
    document.getElementById("imagePopupHistorique");
const videoPopupHistorique =
    document.getElementById("videoPopupHistorique");
const fermerPopupPhotoHistorique =
    document.getElementById("fermerPopupPhotoHistorique");

containerHistorique.addEventListener("click", function (event) {
    if (!(event.target instanceof Element)) {
        return;
    }

    const media = event.target.closest(
        ".timeline-photos img, .timeline-photos video"
    );
    if (!media) {
        return;
    }

    if (media instanceof HTMLVideoElement) {
        const source = media.querySelector("source");
        videoPopupHistorique.src =
            media.currentSrc || source?.src || media.src;
        videoPopupHistorique.style.display = "block";
        imagePopupHistorique.style.display = "none";
        videoPopupHistorique.load();
    } else {
        imagePopupHistorique.src = media.currentSrc || media.src;
        imagePopupHistorique.alt = media.alt;
        imagePopupHistorique.style.display = "block";
        videoPopupHistorique.style.display = "none";
    }
    popupPhotoHistorique.style.display = "flex";
});

function fermerPhotoHistorique() {
    popupPhotoHistorique.style.display = "none";
    imagePopupHistorique.removeAttribute("src");
    videoPopupHistorique.pause();
    videoPopupHistorique.removeAttribute("src");
    videoPopupHistorique.load();
}

fermerPopupPhotoHistorique.addEventListener(
    "click",
    fermerPhotoHistorique
);

popupPhotoHistorique.addEventListener("click", function (event) {
    if (event.target === popupPhotoHistorique) {
        fermerPhotoHistorique();
    }
});

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        popupPhotoHistorique.style.display === "flex"
    ) {
        fermerPhotoHistorique();
    }
});
