
// ======================
// CONFIG
// ======================

const scriptURL ="https://script.google.com/macros/s/AKfycbxxx1LM6qzN8Ty00kaarmXxiZBcnIQPkhWUXh_n5bcbzhau84kzHBPh9Htbv5V72c-NJg/exec";



// ======================
// POPUP
// ======================

function showPopup(icon, title, message) {

    document.getElementById("popupIcon").textContent = icon;

    document.getElementById("popupTitle").textContent = title;

    document.getElementById("popupMessage").textContent = message;

    document.getElementById("popup").style.display = "flex";
   
}
function closePopup() {

    document.getElementById("popup").style.display = "none";
}


document
.getElementById("popupClose")
.addEventListener("click", closePopup);

document
.getElementById("popup")
.addEventListener("click", function (e) {

    if (e.target.id === "popup") {

        closePopup();
    }
});

// ======================
// POPUP FORMULAIRE
// ======================

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

// compteur textarea
const textareaMotBebe =
    document.getElementById("motBebe");
const compteurMotBebe =
    document.getElementById("compteurMotBebe");
textareaMotBebe.addEventListener(
    "input",
    function () {

        compteurMotBebe.textContent =
            textareaMotBebe.value.length +
            " / 300 caractères";

    }
);
textareaMotBebe.addEventListener(
    "input",
    function () {

        const longueur =
            textareaMotBebe.value.length;
        compteurMotBebe.textContent =
            longueur +
            " / 300 caractères";
        if (longueur > 250) {
            compteurMotBebe.style.color =
                "#b85d82";
        } else {
            compteurMotBebe.style.color =
                "#9b9b9b";
        }
    }
);

// ======================
// FORMULAIRE
// ======================

document
.getElementById("babyForm")
.addEventListener("submit", async function (e) {

    e.preventDefault();
        document.getElementById("loaderFormulaire").style.display = "flex";

        document.querySelector(
            "#babyForm button[type='submit']"
        ).disabled = true;

    const data = {

        joueur:
            document.getElementById("joueur").value,

        prenom:
            document.getElementById("prenom").value,

        date:
            document.getElementById("date").value,

        heure:
            document.getElementById("heure").value,

        poids:
            document.getElementById("poids").value,

        taille:
            document.getElementById("taille").value,

        cheveux:
            document.getElementById("cheveux").value,

        ressemblance:
            document.getElementById("ressemblance").value,

        motBebe:
        document.getElementById("motBebe").value

    };

    try {

        const response = await fetch(scriptURL, {

            method: "POST",

            body: JSON.stringify(data)

        });

        
      const result = await response.json();

        if (result.success) {
            document.getElementById("babyForm").reset();
            fermerFormulaire();
                document.getElementById("loaderFormulaire").style.display = "none";

                document.querySelector(
                    "#babyForm button[type='submit']"
                ).disabled = false;
            showPopup(
                "🎉",
                "Pronostic enregistré",
                "Merci pour votre participation !"
            );
            chargerTendances();
        }
        else {
            fermerFormulaire();
              document.getElementById("loaderFormulaire").style.display = "none";

                document.querySelector(
                    "#babyForm button[type='submit']"
                ).disabled = false;
            showPopup(
                "😅",
                "Pronostic non pris en compte",
                "Op op op là t'as déjà participé !",
                
            );

        }

    }
   catch (error) {

       console.error("Erreur complète :", error);


        showPopup(
            "❌",
            "Erreur",
            "Une erreur est survenue lors de l'envoi du pronostic."
        );

    }

});

// chargement des tendances 

async function chargerTendances() {

    try {

        const response = await fetch(
    scriptURL + "?t=" + Date.now()
        );

        const stats = await response.json();

        console.log(stats);

        document.getElementById("nbPronostics").textContent =
        stats.total;

        document.getElementById("tendancePrenom").innerHTML =
            formatValeurTendance(stats.prenomFavori);

        document.getElementById("tendanceHeure").innerHTML =
            formatValeurTendance(stats.heureFavorite);

        document.getElementById("tendancePoids").innerHTML =
            formatValeurTendance(stats.poidsFavori);

        document.getElementById("tendanceTaille").innerHTML =
            formatValeurTendance(stats.tailleFavorite);

        document.getElementById("tendanceCheveux").innerHTML =
            formatValeurTendance(stats.cheveuxFavoris);

        document.getElementById("tendanceRessemblance").innerHTML =
            formatValeurTendance(stats.ressemblanceFavorite);
        const listeLivreDor =
            document.getElementById("listeLivreDor");
         listeLivreDor.innerHTML = "";   
         stats.messagesBebe.forEach(function(message) {
           
            listeLivreDor.innerHTML += `

                    <div class="message-auteur">

                        ${message.auteur}

                    </div>

                <div class="message-livre-dor">
                            <div class="tendances-grid">

                            <div class="box-tendance">
                                <div class="emoji">💖</div>
                                <div class="label">${message.prenom}</div>            
                            </div>

                            <div class="box-tendance">
                                <div class="emoji">📅</div>
                                <div class="label">${message.date}</div>           
                            </div>

                            <div class="box-tendance">
                                <div class="emoji">⏰</div>
                                <div class="label">${message.heure}</div>         
                            </div>

                            <div class="box-tendance">
                                <div class="emoji">⚖️</div>
                                <div class="label">${message.poids}</div>   
                            </div>

                            <div class="box-tendance">
                                <div class="emoji">📏</div>
                                <div class="label">${message.taille}</div>
                            </div>

                            <div class="box-tendance">
                                <div class="emoji">🖤</div>
                                <div class="label">${message.cheveux}</div>
                            </div>
                        </div>


                    <div class="message-texte">

                        ${message.message}

                    </div>

                </div>

            `;

        });
        
    }
    catch (error) {

        console.error(error);

    }

}

chargerTendances();


// VOILA LE BLOC DATE QUE J'AI ENLEVE
 // <div class="tendance-mini">
  //      <div class="entete-tendance">

  //        <span class="emoji">📅</span>

   //         <span class="label">
   //          Date favorite
   //         </span>

   //     </div>

    //    <div class="valeur">
    //     ${stats.dateFavorite}
    //    </div>

  //  </div>



  // =================
  // Pour griser le pas de tendance

 
function formatValeurTendance(valeur) {

    if (
        valeur === undefined ||
        valeur === null ||
        valeur === "" ||
        valeur === "undefined" ||
        valeur === "Pas de tendance"
    ) {

        return `
            <span class="pas-tendance">
                Pas de tendance
            </span>
        `;
    }

    return valeur;
}

// ======================
// ONGLETS
// ======================

const ongletLivreDor =
    document.getElementById("ongletLivreDor");

const ongletClassement =
    document.getElementById("ongletClassement");

const tendances =
    document.getElementById("tendances");

const containerLivreDor =
    document.getElementById("containerLivreDor");

const containerClassement =
    document.getElementById("containerClassement");

const ongletTendance =
    document.getElementById("ongletTendance");


// ======================
// ETAT INITIAL
// ======================

ongletTendance.classList.add("onglet-inactif");

ongletLivreDor.classList.add("onglet-actif");

ongletClassement.classList.add("onglet-actif");

tendances.style.display = "block";

containerLivreDor.style.display = "none";

containerClassement.style.display = "none";


// ======================
// ONGLET CLASSEMENT
// ======================

ongletClassement.addEventListener(
    "click",
    function () {

        tendances.style.display =
            "none";

        containerLivreDor.style.display =
            "none";

        containerClassement.style.display =
            "block";

        ongletTendance.classList.add("onglet-actif");
        ongletTendance.classList.remove("onglet-inactif");

        ongletLivreDor.classList.add("onglet-actif");
        ongletLivreDor.classList.remove("onglet-inactif");

        ongletClassement.classList.add("onglet-inactif");
        ongletClassement.classList.remove("onglet-actif");

    }
);


// ======================
// ONGLET LIVRE D'OR
// ======================

ongletLivreDor.addEventListener(
    "click",
    function () {

        document.getElementById(
            "popupCodeLivreDor"
        ).style.display = "flex";

    }
);

document.getElementById(
    "validerCodeLivreDor"
).addEventListener(
    "click",
    function () {

        const code =
            document.getElementById(
                "codeLivreDor"
            ).value;

        if (code !== "197346825") {

            document.getElementById(
                "popupCodeLivreDor"
            ).style.display = "none";

            return;
        }

        document.getElementById(
            "popupCodeLivreDor"
        ).style.display = "none";

        tendances.style.display =
            "none";

        containerClassement.style.display =
            "none";

        containerLivreDor.style.display =
            "block";

        ongletTendance.classList.add("onglet-actif");
        ongletTendance.classList.remove("onglet-inactif");

        ongletClassement.classList.add("onglet-actif");
        ongletClassement.classList.remove("onglet-inactif");

        ongletLivreDor.classList.add("onglet-inactif");
        ongletLivreDor.classList.remove("onglet-actif");

    }
);


// ======================
// ONGLET TENDANCES
// ======================

ongletTendance.addEventListener(
    "click",
    function () {

        tendances.style.display =
            "block";

        containerLivreDor.style.display =
            "none";

        containerClassement.style.display =
            "none";

        ongletLivreDor.classList.add("onglet-actif");
        ongletLivreDor.classList.remove("onglet-inactif");

        ongletClassement.classList.add("onglet-actif");
        ongletClassement.classList.remove("onglet-inactif");

        ongletTendance.classList.add("onglet-inactif");
        ongletTendance.classList.remove("onglet-actif");

    }
);


// ======================
// POPUP LIVRE D'OR
// ======================

const boutonFermerLivreDor =
    document.getElementById("fermerLivreDor");

const popupLivreDor =
    document.getElementById("popupCodeLivreDor");

boutonFermerLivreDor.addEventListener(
    "click",
    function () {

        popupLivreDor.style.display =
            "none";

    }
);

popupLivreDor.addEventListener(
    "click",
    function (e) {

        if (e.target === popupLivreDor) {

            popupLivreDor.style.display =
                "none";

        }

    }
);
const btnInfoClassement =
    document.getElementById("btnInfoClassement");

const popupClassement =
    document.getElementById("popupClassement");

const fermerPopupClassement =
    document.getElementById("fermerPopupClassement");

btnInfoClassement.addEventListener(
    "click",
    function () {

        popupClassement.style.display =
            "flex";

    }
);

fermerPopupClassement.addEventListener(
    "click",
    function () {

        popupClassement.style.display =
            "none";

    }
);

popupClassement.addEventListener(
    "click",
    function (e) {

        if (e.target === popupClassement) {

            popupClassement.style.display =
                "none";

        }

    }
);