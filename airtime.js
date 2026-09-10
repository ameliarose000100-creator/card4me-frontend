const AIRTIME_API =
    "https://card4me-backend-1.onrender.com/api/airtime/purchase";

document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector(".form-card-inner");

    const phoneInput = document.getElementById("airtimePhone");
    const networkInput = document.getElementById("network");
    const amountInput = document.getElementById("airtimeAmount");

    if (!form) {
        console.error("CARD4ME: Airtime form not found.");
        return;
    }

    if (!phoneInput || !networkInput || !amountInput) {
        console.error("CARD4ME: Airtime input fields not found.");
        return;
    }

    const button = form.querySelector('button[type="submit"]');

    if (!button) {
        console.error("CARD4ME: Airtime button not found.");
        return;
    }

    console.log("CARD4ME: Airtime JavaScript loaded.");

    form.addEventListener("submit", async function (event) {

        event.preventDefault();
        event.stopPropagation();

        console.log("CARD4ME: Airtime form submitted.");

        const token = localStorage.getItem("card4me_token");

        if (!token) {
            showAirtimeMessage(
                "Please login before buying airtime.",
                "error"
            );

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1200);

            return;
        }

        const phone = phoneInput.value.trim();
        const network = networkInput.value.trim().toUpperCase();
        const amount = Number(amountInput.value);

        if (!/^0\d{10}$/.test(phone)) {
            showAirtimeMessage(
                "Please enter a valid Nigerian phone number.",
                "error"
            );
            return;
        }

        const validNetworks = [
            "MTN",
            "AIRTEL",
            "GLO",
            "9MOBILE"
        ];

        if (!validNetworks.includes(network)) {
            showAirtimeMessage(
                "Please select a valid network.",
                "error"
            );
            return;
        }

        if (!Number.isFinite(amount) || amount < 100) {
            showAirtimeMessage(
                "Minimum airtime amount is ₦100.",
                "error"
            );
            return;
        }

        button.disabled = true;
        button.textContent = "Processing...";

        try {

            console.log("CARD4ME: Sending request to:", AIRTIME_API);

            const response = await fetch(AIRTIME_API, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({
                    phone: phone,
                    network: network,
                    amount: amount
                })
            });

            console.log(
                "CARD4ME: Server response:",
                response.status
            );

            const text = await response.text();

            console.log(
                "CARD4ME: Server response body:",
                text
            );

            let data;

            try {
                data = JSON.parse(text);
            } catch (parseError) {
                data = {
                    success: false,
                    message: text || "Invalid server response."
                };
            }

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem("card4me_token");
                localStorage.removeItem("card4me_user");
                localStorage.removeItem("card4meLoggedIn");

                showAirtimeMessage(
                    "Your login session has expired. Please login again.",
                    "error"
                );

                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1500);

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Airtime purchase failed."
                );
            }

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Airtime purchase failed."
                );
            }

            showAirtimeMessage(
                data.message ||
                "Airtime purchase successful!",
                "success"
            );

            form.reset();

        } catch (error) {

            console.error(
                "CARD4ME Airtime Error:",
                error
            );

            showAirtimeMessage(
                error.message ||
                "Unable to process airtime purchase.",
                "error"
            );

        } finally {

            button.disabled = false;
            button.textContent = "Continue";
        }

    });

});


function showAirtimeMessage(message, type) {

    const oldMessage =
        document.querySelector(
            ".card4me-airtime-message"
        );

    if (oldMessage) {
        oldMessage.remove();
    }

    const messageBox =
        document.createElement("div");

    messageBox.className =
        "card4me-airtime-message";

    messageBox.textContent = message;

    messageBox.style.marginTop = "15px";
    messageBox.style.padding = "14px";
    messageBox.style.borderRadius = "10px";
    messageBox.style.fontSize = "14px";
    messageBox.style.fontWeight = "600";
    messageBox.style.textAlign = "center";

    if (type === "success") {

        messageBox.style.background = "#e8f7ee";
        messageBox.style.color = "#137333";

    } else {

        messageBox.style.background = "#fdecec";
        messageBox.style.color = "#c62828";
    }

    const form =
        document.querySelector(".form-card-inner");

    if (form) {
        form.appendChild(messageBox);
    }

    setTimeout(function () {

        if (messageBox && messageBox.parentNode) {
            messageBox.remove();
        }

    }, 5000);
}