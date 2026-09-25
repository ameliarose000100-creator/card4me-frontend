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

    menuButton.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("active");
        nav.classList.toggle("open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            nav.classList.remove("active");
            nav.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });

});