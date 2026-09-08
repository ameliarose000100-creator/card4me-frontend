/* =========================================
   CARD4ME ACCOUNT PAGE
========================================= */

function loadAccountInformation() {

    const user = getUser();

    if (!user || !user.id) {

        window.location.href =
            "login.html";

        return;
    }


    const fullName =
        user.full_name ||
        user.fullName ||
        "Not available";


    const email =
        user.email ||
        "Not available";


    const phone =
        user.phone ||
        "Not available";


    const nameElement =
        document.getElementById("accountName");

    const emailElement =
        document.getElementById("accountEmail");

    const phoneElement =
        document.getElementById("accountPhone");


    if (nameElement) {
        nameElement.textContent =
            fullName;
    }


    if (emailElement) {
        emailElement.textContent =
            email;
    }


    if (phoneElement) {
        phoneElement.textContent =
            phone;
    }


    loadWallet();
}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!requireLogin()) {
            return;
        }

        loadAccountInformation();

    }
);