"use strict";

/* =========================================
   CARD4ME MENU SCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const menuButton = document.querySelector(".menu");
    const nav = document.getElementById("nav");

    if (!menuButton || !nav) {
        return;
    }

    nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            nav.classList.remove("active");
            nav.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });

});