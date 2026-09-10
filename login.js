"use strict";

/* =========================================
   CARD4ME LOGIN
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginForm =
        document.getElementById("loginForm");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const message =
        document.getElementById("loginMessage");

    const button =
        document.getElementById("loginButton");


    if (
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !message ||
        !button
    ) {
        console.error(
            "CARD4ME: login elements not found."
        );
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();


            const email =
                emailInput.value.trim().toLowerCase();

            const password =
                passwordInput.value;


            if (!email || !password) {

                message.textContent =
                    "Please enter your email and password.";

                return;
            }


            button.disabled = true;
            button.textContent =
                "Logging in...";

            message.textContent =
                "Logging in to CARD4ME...";


            try {

                const response =
                    await fetch(
                        "https://card4me-backend-1.onrender.com/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const rawResponse =
                    await response.text();


                let data = {};

                try {

                    data =
                        rawResponse
                            ? JSON.parse(rawResponse)
                            : {};

                } catch (error) {

                    console.error(
                        "Invalid CARD4ME response:",
                        rawResponse
                    );

                    data = {
                        success: false,
                        message:
                            "CARD4ME returned an invalid server response."
                    };
                }


                console.log(
                    "CARD4ME Login Status:",
                    response.status
                );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    message.textContent =
                        data.message ||
                        "Invalid email or password.";

                    button.disabled = false;
                    button.textContent =
                        "Login";

                    return;
                }


                if (
                    !data.token ||
                    typeof data.token !== "string"
                ) {

                    message.textContent =
                        "Login failed because no authentication token was received.";

                    button.disabled = false;
                    button.textContent =
                        "Login";

                    return;
                }


                /* ==============================
                   SAVE AUTHENTICATION
                ============================== */

                localStorage.setItem(
                    "card4me_token",
                    data.token
                );


                localStorage.setItem(
                    "card4me_user",
                    JSON.stringify(
                        data.user || {}
                    )
                );


                localStorage.setItem(
                    "card4meLoggedIn",
                    "true"
                );


                /* ==============================
                   VERIFY TOKEN
                ============================== */

                const savedToken =
                    localStorage.getItem(
                        "card4me_token"
                    );


                if (!savedToken) {

                    message.textContent =
                        "Login succeeded, but the session could not be saved.";

                    button.disabled = false;
                    button.textContent =
                        "Login";

                    return;
                }


                /* ==============================
                   SUCCESS
                ============================== */

                message.textContent =
                    "Login successful! Opening CARD4ME...";

                button.textContent =
                    "Success ✓";


                setTimeout(function () {

                    window.location.replace(
                        "dashboard.html"
                    );

                }, 1000);

            } catch (error) {

                console.error(
                    "CARD4ME login error:",
                    error
                );


                message.textContent =
                    "Unable to connect to CARD4ME. Please check your internet connection.";

                button.disabled = false;
                button.textContent =
                    "Login";
            }

        }
    );

});