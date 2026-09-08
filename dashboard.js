/* =========================================
   CARD4ME DASHBOARD
========================================= */


/* =========================================
   LOAD USER INFORMATION
========================================= */

function loadUserInformation() {

    const user =
        getUser();


    if (!user || !user.id) {

        return;
    }


    /* ================================
       NAME
    ================================= */

    const userName =
        document.getElementById(
            "userName"
        );

    const accountName =
        document.getElementById(
            "accountName"
        );


    if (userName) {

        userName.textContent =
            user.full_name ||
            user.fullName ||
            "Customer";
    }


    if (accountName) {

        accountName.textContent =
            user.full_name ||
            user.fullName ||
            "Not available";
    }


    /* ================================
       EMAIL
    ================================= */

    const accountEmail =
        document.getElementById(
            "accountEmail"
        );


    if (accountEmail) {

        accountEmail.textContent =
            user.email ||
            "Not available";
    }


    /* ================================
       PHONE
    ================================= */

    const accountPhone =
        document.getElementById(
            "accountPhone"
        );


    if (accountPhone) {

        accountPhone.textContent =
            user.phone ||
            "Not available";
    }
}


/* =========================================
   START DASHBOARD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!requireLogin()) {

            return;
        }


        loadUserInformation();

        loadWallet();

    }
);