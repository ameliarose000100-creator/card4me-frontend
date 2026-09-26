/* =========================================
   CARD4ME ACCOUNT PAGE
========================================= */

async function loadAccountInformation() {
    const user = getUser();

    if (!user || !user.id) {
        window.location.replace("login.html");
        return;
    }

    try {
        const result = await apiRequest("/api/profile");

        if (!result || !result.success || !result.profile) {
            throw new Error(
                result?.message || "Unable to load profile."
            );
        }

        const profile = result.profile;

        const nameElement =
            document.getElementById("accountName");

        const emailElement =
            document.getElementById("accountEmail");

        const phoneElement =
            document.getElementById("accountPhone");

        const balanceElement =
            document.getElementById("accountBalance");

        if (nameElement) {
            nameElement.textContent =
                profile.fullName || "Not available";
        }

        if (emailElement) {
            emailElement.textContent =
                profile.email || "Not available";
        }

        if (phoneElement) {
            phoneElement.textContent =
                profile.phone || "Not available";
        }

        if (balanceElement) {
            const balance =
                Number(profile.balance || 0);

            balanceElement.textContent =
                `₦${balance.toLocaleString(
                    "en-NG",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}`;
        }

        /* =========================================
           REFERRAL INFORMATION
        ========================================= */

        const referralCodeElement =
            document.getElementById("referralCode");

        const referralLinkElement =
            document.getElementById("referralLink");

        const successfulReferralsElement =
            document.getElementById("successfulReferrals");

        const rewardsEarnedElement =
            document.getElementById("rewardsEarned");

        if (referralCodeElement) {
            referralCodeElement.textContent =
                profile.referralCode || "Not available";
        }

        if (referralLinkElement) {
            referralLinkElement.value =
                profile.referralLink || "Not available";
        }

        if (successfulReferralsElement) {
            successfulReferralsElement.textContent =
                Number(profile.successfulReferrals || 0).toLocaleString(
                    "en-NG"
                );
        }

        if (rewardsEarnedElement) {
            const rewards =
                Number(profile.rewardsEarned || 0);

            rewardsEarnedElement.textContent =
                `₦${rewards.toLocaleString(
                    "en-NG",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}`;
        }

        const editFullName =
            document.getElementById("editFullName");

        const editEmail =
            document.getElementById("editEmail");

        const editPhone =
            document.getElementById("editPhone");

        if (editFullName) {
            editFullName.value =
                profile.fullName || "";
        }

        if (editEmail) {
            editEmail.value =
                profile.email || "";
        }

        if (editPhone) {
            editPhone.value =
                profile.phone || "";
        }

    } catch (error) {
        console.error(
            "Account profile error:",
            error
        );
    }
}


/* =========================================
   REFERRAL ACTIONS
========================================= */

function setupReferralActions() {
    const copyButton =
        document.getElementById("copyReferralButton");

    const shareButton =
        document.getElementById("shareReferralButton");

    const linkElement =
        document.getElementById("referralLink");

    const message =
        document.getElementById("referralMessage");

    if (copyButton && linkElement) {
        copyButton.addEventListener("click", async () => {
            const link = linkElement.value;

            if (!link || link === "Not available" || link === "Loading...") {
                showAccountAlert(
                    message,
                    "Referral link is not available yet.",
                    "error"
                );
                return;
            }

            try {
                await navigator.clipboard.writeText(link);

                showAccountAlert(
                    message,
                    "Referral link copied!",
                    "success"
                );
            } catch (error) {
                linkElement.select();
                document.execCommand("copy");

                showAccountAlert(
                    message,
                    "Referral link copied!",
                    "success"
                );
            }
        });
    }

    if (shareButton && linkElement) {
        shareButton.addEventListener("click", async () => {
            const link = linkElement.value;

            if (!link || link === "Not available" || link === "Loading...") {
                showAccountAlert(
                    message,
                    "Referral link is not available yet.",
                    "error"
                );
                return;
            }

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: "Join CARD4ME",
                        text: "Join me on CARD4ME using my referral link.",
                        url: link
                    });
                } catch (error) {
                    if (error?.name !== "AbortError") {
                        showAccountAlert(
                            message,
                            "Unable to open sharing options.",
                            "error"
                        );
                    }
                }
            } else {
                try {
                    await navigator.clipboard.writeText(link);

                    showAccountAlert(
                        message,
                        "Sharing is unavailable. Link copied instead!",
                        "success"
                    );
                } catch (error) {
                    showAccountAlert(
                        message,
                        "Unable to share the referral link.",
                        "error"
                    );
                }
            }
        });
    }
}


/* =========================================
   ACCOUNT ALERT HELPER
========================================= */

function showAccountAlert(element, message, type = "success") {
    if (element) {
        element.textContent = message;
        element.className = `account-alert ${type}`;
        element.style.display = "block";
    }

    const globalAlert =
        document.getElementById("accountGlobalAlert");

    if (!globalAlert) {
        return;
    }

    globalAlert.textContent = message;
    globalAlert.className =
        `account-global-alert ${type} show`;

    clearTimeout(
        window.accountAlertTimer
    );

    window.accountAlertTimer =
        setTimeout(() => {
            globalAlert.classList.remove("show");
        }, 3500);
}


/* =========================================
   EDIT PROFILE
========================================= */

function setupEditProfile() {
    const openButton =
        document.getElementById(
            "editProfileButton"
        );

    const panel =
        document.getElementById(
            "editProfilePanel"
        );

    const form =
        document.getElementById(
            "editProfileForm"
        );

    const cancelButton =
        document.getElementById(
            "cancelEditProfileButton"
        );

    const message =
        document.getElementById(
            "editProfileMessage"
        );

    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );

    if (
        !openButton ||
        !panel ||
        !form ||
        !cancelButton
    ) {
        return;
    }

    openButton.addEventListener(
        "click",
        () => {
            panel.style.display = "block";

            if (message) {
                message.textContent = "";
                message.style.display = "none";
            }

            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );

    cancelButton.addEventListener(
        "click",
        () => {
            panel.style.display = "none";

            if (message) {
                message.textContent = "";
                message.style.display = "none";
            }
        }
    );

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const fullName =
                document.getElementById(
                    "editFullName"
                )?.value.trim() || "";

            const email =
                document.getElementById(
                    "editEmail"
                )?.value.trim() || "";

            const phone =
                document.getElementById(
                    "editPhone"
                )?.value.trim() || "";

            if (!fullName || fullName.length < 2) {
                showAccountAlert(
                    message,
                    "Enter a valid full name.",
                    "error"
                );
                return;
            }

            if (!email || !email.includes("@")) {
                showAccountAlert(
                    message,
                    "Enter a valid email address.",
                    "error"
                );
                return;
            }

            if (!phone) {
                showAccountAlert(
                    message,
                    "Enter your phone number.",
                    "error"
                );
                return;
            }

            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent =
                    "Saving...";
            }

            showAccountAlert(
                message,
                "Updating your profile...",
                "success"
            );

            try {
                const result =
                    await apiRequest(
                        "/api/profile",
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                fullName,
                                email,
                                phone
                            })
                        }
                    );

                if (
                    !result ||
                    !result.success ||
                    !result.profile
                ) {
                    throw new Error(
                        result?.message ||
                        "Unable to update profile."
                    );
                }

                const profile =
                    result.profile;

                const nameElement =
                    document.getElementById(
                        "accountName"
                    );

                const emailElement =
                    document.getElementById(
                        "accountEmail"
                    );

                const phoneElement =
                    document.getElementById(
                        "accountPhone"
                    );

                if (nameElement) {
                    nameElement.textContent =
                        profile.fullName ||
                        "Not available";
                }

                if (emailElement) {
                    emailElement.textContent =
                        profile.email ||
                        "Not available";
                }

                if (phoneElement) {
                    phoneElement.textContent =
                        profile.phone ||
                        "Not available";
                }

                showAccountAlert(
                    message,
                    "Profile updated successfully.",
                    "success"
                );

            } catch (error) {
                console.error(
                    "Edit profile error:",
                    error
                );

                showAccountAlert(
                    message,
                    error.message ||
                    "Unable to update profile.",
                    "error"
                );

            } finally {
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent =
                        "Save Changes";
                }
            }
        }
    );
}


/* =========================================
   CHANGE PASSWORD
========================================= */

function setupChangePassword() {
    const openButton =
        document.getElementById(
            "changePasswordButton"
        );

    const panel =
        document.getElementById(
            "changePasswordPanel"
        );

    const form =
        document.getElementById(
            "changePasswordForm"
        );

    const cancelButton =
        document.getElementById(
            "cancelPasswordButton"
        );

    const message =
        document.getElementById(
            "changePasswordMessage"
        );

    const saveButton =
        document.getElementById(
            "savePasswordButton"
        );

    if (
        !openButton ||
        !panel ||
        !form ||
        !cancelButton
    ) {
        return;
    }

    openButton.addEventListener(
        "click",
        () => {
            panel.style.display = "block";

            form.reset();

            if (message) {
                message.textContent = "";
                message.style.display = "none";
            }

            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );

    cancelButton.addEventListener(
        "click",
        () => {
            panel.style.display = "none";
            form.reset();

            if (message) {
                message.textContent = "";
                message.style.display = "none";
            }
        }
    );

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const currentPassword =
                document.getElementById(
                    "currentPassword"
                )?.value || "";

            const newPassword =
                document.getElementById(
                    "newPassword"
                )?.value || "";

            const confirmNewPassword =
                document.getElementById(
                    "confirmNewPassword"
                )?.value || "";

            if (newPassword.length < 8) {
                if (message) {
                    showAccountAlert(
                        message,
                        "New password must be at least 8 characters.",
                        "error"
                    );
                }

                return;
            }

            if (
                newPassword !==
                confirmNewPassword
            ) {
                if (message) {
                    showAccountAlert(
                        message,
                        "New passwords do not match.",
                        "error"
                    );
                }

                return;
            }

            if (
                currentPassword ===
                newPassword
            ) {
                if (message) {
                    showAccountAlert(
                        message,
                        "Your new password must be different.",
                        "error"
                    );
                }

                return;
            }

            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent =
                    "Updating...";
            }

            if (message) {
                showAccountAlert(
                    message,
                    "Updating your password...",
                    "success"
                );
            }

            try {
                const result =
                    await apiRequest(
                        "/api/profile/change-password",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                currentPassword,
                                newPassword
                            })
                        }
                    );

                if (
                    !result ||
                    !result.success
                ) {
                    throw new Error(
                        result?.message ||
                        "Unable to change password."
                    );
                }

                form.reset();

                if (message) {
                    showAccountAlert(
                        message,
                        "Password changed successfully.",
                        "success"
                    );
                }

            } catch (error) {
                console.error(
                    "Change password error:",
                    error
                );

                if (message) {
                    showAccountAlert(
                        message,
                        error.message ||
                        "Unable to change password.",
                        "error"
                    );
                }

            } finally {
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent =
                        "Update Password";
                }
            }
        }
    );
}


/* =========================================
   TRANSACTION PIN
========================================= */

async function loadTransactionPinStatus() {
    const statusElement =
        document.getElementById("transactionPinStatus");

    const actions =
        document.getElementById("transactionPinActions");

    if (!statusElement) {
        return;
    }

    try {
        const result =
            await apiRequest(
                "/api/profile/transaction-pin"
            );

        if (
            !result ||
            !result.success
        ) {
            throw new Error(
                result?.message ||
                "Unable to check Transaction PIN status."
            );
        }

        if (result.hasTransactionPin) {
            statusElement.textContent =
                "Configured";

            if (actions) {
                actions.style.display = "none";
            }
        } else {
            statusElement.textContent =
                "Not configured";

            if (actions) {
                actions.style.display = "flex";
            }
        }

    } catch (error) {
        console.error(
            "Transaction PIN status error:",
            error
        );

        statusElement.textContent =
            "Unable to check";
    }
}


function setupTransactionPinVisibility() {
    const fields = [
        {
            inputId: "transactionPin",
            buttonId: "toggleTransactionPin",
            showLabel: "Show Transaction PIN",
            hideLabel: "Hide Transaction PIN"
        },
        {
            inputId: "confirmTransactionPin",
            buttonId: "toggleConfirmTransactionPin",
            showLabel: "Show confirmation PIN",
            hideLabel: "Hide confirmation PIN"
        }
    ];

    fields.forEach((field) => {
        const input =
            document.getElementById(field.inputId);

        const button =
            document.getElementById(field.buttonId);

        if (!input || !button) {
            return;
        }

        button.addEventListener("click", () => {
            const showing =
                input.type === "text";

            input.type =
                showing ? "password" : "text";

            button.textContent =
                showing ? "👁️" : "🙈";

            button.setAttribute(
                "aria-label",
                showing
                    ? field.showLabel
                    : field.hideLabel
            );

            button.setAttribute(
                "aria-pressed",
                String(!showing)
            );
        });
    });
}


function setupTransactionPin() {
    const openButton =
        document.getElementById(
            "setTransactionPinButton"
        );

    const panel =
        document.getElementById(
            "transactionPinPanel"
        );

    const form =
        document.getElementById(
            "transactionPinForm"
        );

    const cancelButton =
        document.getElementById(
            "cancelTransactionPinButton"
        );

    const message =
        document.getElementById(
            "transactionPinMessage"
        );

    const saveButton =
        document.getElementById(
            "saveTransactionPinButton"
        );

    if (
        !openButton ||
        !panel ||
        !form ||
        !cancelButton
    ) {
        return;
    }

    openButton.addEventListener(
        "click",
        () => {
            panel.style.display = "block";
            form.reset();

            if (message) {
                message.textContent = "";
                message.style.display = "none";
            }

            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );

    cancelButton.addEventListener(
        "click",
        () => {
            panel.style.display = "none";
            form.reset();

            if (message) {
                message.textContent = "";
                message.style.display = "none";
            }
        }
    );

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const transactionPin =
                document.getElementById(
                    "transactionPin"
                )?.value.trim() || "";

            const confirmTransactionPin =
                document.getElementById(
                    "confirmTransactionPin"
                )?.value.trim() || "";

            if (!/^\d{6}$/.test(transactionPin)) {
                showAccountAlert(
                    message,
                    "Transaction PIN must be exactly 6 digits.",
                    "error"
                );
                return;
            }

            if (
                transactionPin !==
                confirmTransactionPin
            ) {
                showAccountAlert(
                    message,
                    "Transaction PINs do not match.",
                    "error"
                );
                return;
            }

            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent =
                    "Saving...";
            }

            showAccountAlert(
                message,
                "Setting your Transaction PIN...",
                "success"
            );

            try {
                const result =
                    await apiRequest(
                        "/api/profile/transaction-pin",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                transactionPin
                            })
                        }
                    );

                if (
                    !result ||
                    !result.success
                ) {
                    throw new Error(
                        result?.message ||
                        "Unable to set Transaction PIN."
                    );
                }

                form.reset();

                panel.style.display = "none";

                const statusElement =
                    document.getElementById(
                        "transactionPinStatus"
                    );

                const actions =
                    document.getElementById(
                        "transactionPinActions"
                    );

                if (statusElement) {
                    statusElement.textContent =
                        "Configured";
                }

                if (actions) {
                    actions.style.display = "none";
                }

                showAccountAlert(
                    null,
                    "Transaction PIN created successfully.",
                    "success"
                );

            } catch (error) {
                console.error(
                    "Create Transaction PIN error:",
                    error
                );

                showAccountAlert(
                    message,
                    error.message ||
                    "Unable to set Transaction PIN.",
                    "error"
                );

            } finally {
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent =
                        "Set Transaction PIN";
                }
            }
        }
    );
}



/* =========================================
   PAGE INITIALIZATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadAccountInformation();
        setupReferralActions();
        setupEditProfile();
        setupChangePassword();
        setupTransactionPinVisibility();
        setupTransactionPin();
        loadTransactionPinStatus();
    }
);
