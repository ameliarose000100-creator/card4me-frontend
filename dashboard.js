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
   LOGIN WELCOME MODAL
========================================= */

function showLoginWelcome() {

    const shouldShow =
        localStorage.getItem(
            "card4me_show_welcome"
        );

    if (shouldShow !== "true") {
        return;
    }

    const modal =
        document.getElementById(
            "welcomeModal"
        );

    const title =
        document.getElementById(
            "welcomeModalTitle"
        );

    const message =
        document.getElementById(
            "welcomeModalMessage"
        );

    const continueButton =
        document.getElementById(
            "welcomeModalContinue"
        );

    if (!modal || !title || !message || !continueButton) {
        return;
    }

    let user = {};

    try {
        user = JSON.parse(
            localStorage.getItem(
                "card4me_user"
            ) || "{}"
        );
    } catch (error) {
        console.warn(
            "Could not read CARD4ME user information."
        );
    }

    const fullName =
        String(
            user.full_name ||
            user.fullName ||
            ""
        ).trim();

    const firstName =
        fullName
            ? fullName.split(/\s+/)[0]
            : "there";

    title.textContent =
        "Welcome back, " +
        firstName +
        " 👋";

    message.textContent =
        "Welcome back to CARD4ME. Your digital services are ready whenever you are.";

    modal.classList.add(
        "is-visible"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    localStorage.removeItem(
        "card4me_show_welcome"
    );

    function closeWelcome() {

        modal.classList.remove(
            "is-visible"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    continueButton.addEventListener(
        "click",
        closeWelcome,
        {
            once: true
        }
    );

    modal.querySelectorAll(
        "[data-welcome-close]"
    ).forEach(function (element) {

        element.addEventListener(
            "click",
            closeWelcome,
            {
                once: true
            }
        );

    });
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

        showLoginWelcome();

    }
);

/* =========================================
   OWNER PANEL ACCESS
========================================= */

window.addEventListener("DOMContentLoaded", function () {

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

            if (ownerTools) {
                ownerTools.style.display = "none";
            }
        }

    } catch (error) {

        console.error(
            "CARD4ME owner access check failed:",
            error
        );

        ownerLink.style.display = "none";
    }

});
