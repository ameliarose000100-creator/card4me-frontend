"use strict";

/* =========================================
   CARD4ME REGISTRATION
========================================= */

const CARD4ME_API =
    "https://card4me-backend-1.onrender.com";


/* =========================================
   REGISTER USER
========================================= */

async function registerUser(event) {

    event.preventDefault();
    event.stopPropagation();


    const fullNameInput =
        document.getElementById("fullName");

    const emailInput =
        document.getElementById("email");

    const phoneInput =
        document.getElementById("phone");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const message =
        document.getElementById("registerMessage");

    const button =
        document.getElementById("registerButton");


    if (
        !fullNameInput ||
        !emailInput ||
        !phoneInput ||
        !passwordInput ||
        !confirmPasswordInput ||
        !message ||
        !button
    ) {

        console.error(
            "CARD4ME: Registration form elements are missing."
        );

        return;
    }


    /* =========================================
       GET VALUES
    ========================================= */

    const fullName =
        fullNameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const phone =
        phoneInput.value.trim();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    /* =========================================
       VALIDATION
    ========================================= */

    if (
        !fullName ||
        !email ||
        !phone ||
        !password ||
        !confirmPassword
    ) {

        message.textContent =
            "Please complete all fields.";

        return;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        message.textContent =
            "Please enter a valid email address.";

        return;
    }


    const phonePattern =
        /^0\d{10}$/;


    if (!phonePattern.test(phone)) {

        message.textContent =
            "Please enter a valid Nigerian phone number, e.g. 08012345678.";

        return;
    }


    if (password.length < 8) {

        message.textContent =
            "Password must be at least 8 characters.";

        return;
    }


    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        return;
    }


    /* =========================================
       LOADING
    ========================================= */

    button.disabled = true;

    button.textContent =
        "Creating Account...";

    message.textContent =
        "Creating your CARD4ME account...";


    /* =========================================
       SEND REQUEST
    ========================================= */

    try {

        const response =
            await fetch(
                `${CARD4ME_API}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({

                        fullName: fullName,

                        email: email,

                        phone: phone,

                        password: password

                    })
                }
            );


        const responseText =
            await response.text();


        let data = {};


        try {

            data =
                responseText
                    ? JSON.parse(responseText)
                    : {};

        } catch (parseError) {

            console.error(
                "CARD4ME invalid server response:",
                responseText
            );

            data = {
                success: false,
                message:
                    "CARD4ME returned an invalid server response."
            };
        }


        console.log(
            "CARD4ME Registration Status:",
            response.status
        );

        console.log(
            "CARD4ME Registration Result:",
            data
        );


        /* =========================================
           REGISTRATION FAILED
        ========================================= */

        if (
            !response.ok ||
            !data.success
        ) {

            message.textContent =
                data.message ||
                `Registration failed. Server status: ${response.status}`;

            button.disabled = false;

            button.textContent =
                "Create Account";

            return;
        }


        /* =========================================
           SAVE USER
        ========================================= */

        if (data.user) {

            localStorage.setItem(
                "card4me_user",
                JSON.stringify(data.user)
            );

        }


        /* =========================================
           SAVE TOKEN
        ========================================= */

        if (
            data.token &&
            typeof data.token === "string"
        ) {

            localStorage.setItem(
                "card4me_token",
                data.token
            );

        }


        /* =========================================
           SAVE LOGIN STATE
        ========================================= */

        localStorage.setItem(
            "card4meLoggedIn",
            "true"
        );


        /* =========================================
           VERIFY SESSION
        ========================================= */

        const savedToken =
            localStorage.getItem(
                "card4me_token"
            );


        console.log(
            "CARD4ME registration token saved:",
            !!savedToken
        );


        /* =========================================
           SUCCESS MESSAGE
        ========================================= */

        message.textContent =
            "Account created successfully!";


        button.textContent =
            "Account Created ✓";


        /* =========================================
           OPEN CARD4ME
        ========================================= */

        setTimeout(function () {

            message.textContent =
                "Welcome to CARD4ME! Opening your account...";

        }, 700);


        setTimeout(function () {

            window.location.replace(
                "index.html"
            );

        }, 2500);


    } catch (error) {

        console.error(
            "CARD4ME registration error:",
            error
        );


        message.textContent =
            "Unable to connect to CARD4ME. Please check your internet connection.";


        button.disabled = false;

        button.textContent =
            "Create Account";
    }
}