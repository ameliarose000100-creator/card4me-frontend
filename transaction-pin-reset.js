"use strict";

const API_BASE =
    "https://card4me-backend-1.onrender.com";

function showResetMessage(
    message,
    type
) {
    const element =
        document.getElementById(
            "pinResetMessage"
        );

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className =
        "pin-reset-message " + type;
}

function getRecoveryToken() {
    try {
        const params =
            new URLSearchParams(
                window.location.search
            );

        return (
            params.get("token") || ""
        ).trim();

    } catch (error) {
        console.error(
            "Recovery token error:",
            error
        );

        return "";
    }
}

function setupVisibility(
    inputId,
    buttonId,
    showLabel,
    hideLabel
) {
    const input =
        document.getElementById(inputId);

    const button =
        document.getElementById(buttonId);

    if (!input || !button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {
            const showing =
                input.type === "text";

            input.type =
                showing
                    ? "password"
                    : "text";

            button.textContent =
                showing
                    ? "👁️"
                    : "🙈";

            button.setAttribute(
                "aria-label",
                showing
                    ? showLabel
                    : hideLabel
            );

            button.setAttribute(
                "aria-pressed",
                String(!showing)
            );
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupVisibility(
            "resetTransactionPin",
            "toggleResetTransactionPin",
            "Show Transaction PIN",
            "Hide Transaction PIN"
        );

        setupVisibility(
            "resetConfirmTransactionPin",
            "toggleResetConfirmTransactionPin",
            "Show confirmation PIN",
            "Hide confirmation PIN"
        );

        const token =
            getRecoveryToken();

        const form =
            document.getElementById(
                "transactionPinResetForm"
            );

        const submitButton =
            document.getElementById(
                "resetTransactionPinButton"
            );

        const formPanel =
            document.getElementById(
                "pinResetFormPanel"
            );

        const successPanel =
            document.getElementById(
                "pinResetSuccess"
            );

        const returnButton =
            document.getElementById(
                "returnToAccountButton"
            );

        if (!token) {
            showResetMessage(
                "This Transaction PIN recovery link is invalid or missing.",
                "error"
            );

            if (submitButton) {
                submitButton.disabled = true;
            }

            return;
        }

        if (returnButton) {
            returnButton.addEventListener(
                "click",
                () => {
                    window.location.href =
                        "account.html";
                }
            );
        }

        if (!form) {
            return;
        }

        form.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                const transactionPin =
                    document.getElementById(
                        "resetTransactionPin"
                    )?.value.trim() || "";

                const confirmTransactionPin =
                    document.getElementById(
                        "resetConfirmTransactionPin"
                    )?.value.trim() || "";

                if (!/^\d{6}$/.test(
                    transactionPin
                )) {
                    showResetMessage(
                        "Transaction PIN must be exactly 6 digits.",
                        "error"
                    );
                    return;
                }

                if (
                    transactionPin !==
                    confirmTransactionPin
                ) {
                    showResetMessage(
                        "Transaction PINs do not match.",
                        "error"
                    );
                    return;
                }

                if (submitButton) {
                    submitButton.disabled =
                        true;
                    submitButton.textContent =
                        "Resetting...";
                }

                showResetMessage(
                    "Resetting your Transaction PIN...",
                    "success"
                );

                try {
                    const response =
                        await fetch(
                            API_BASE +
                            "/api/auth/reset-transaction-pin",
                            {
                                method:"POST",
                                headers:{
                                    "Content-Type":
                                        "application/json"
                                },
                                body:JSON.stringify({
                                    token,
                                    transactionPin
                                })
                            }
                        );

                    const result =
                        await response.json();

                    if (
                        !response.ok ||
                        !result ||
                        !result.success
                    ) {
                        throw new Error(
                            result?.message ||
                            "Unable to reset Transaction PIN."
                        );
                    }

                    if (formPanel) {
                        formPanel.style.display =
                            "none";
                    }

                    if (successPanel) {
                        successPanel.style.display =
                            "block";
                    }

                } catch (error) {
                    console.error(
                        "Transaction PIN reset error:",
                        error
                    );

                    showResetMessage(
                        error.message ||
                        "Unable to reset Transaction PIN.",
                        "error"
                    );

                } finally {
                    if (submitButton) {
                        submitButton.disabled =
                            false;
                        submitButton.textContent =
                            "Reset Transaction PIN";
                    }
                }
            }
        );
    }
);
