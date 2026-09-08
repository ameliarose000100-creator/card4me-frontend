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
        nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            nav.classList.remove("open");
        });
    });

});