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

/* =========================================
   OWNER PANEL ACCESS
========================================= */

(function () {

    const ownerLink =
        document.getElementById("ownerLink");

    const ownerTools =
        document.getElementById("ownerTools");

    if (!ownerLink) return;

    try {

        const user =
            JSON.parse(
                localStorage.getItem("card4me_user") || "{}"
            );

        if (Number(user.id) === 4) {
            ownerLink.style.display = "inline-block";
            if (ownerTools) {
                ownerTools.style.display = "block";
            }
        } else {
            ownerLink.style.display = "none";
        }

    } catch (error) {

        console.error(
            "CARD4ME owner access check failed:",
            error
        );

        ownerLink.style.display = "none";
    }

})();
