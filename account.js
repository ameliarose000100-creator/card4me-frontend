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
                if (message) {
                    message.textContent =
                        "Enter a valid full name.";
                }
                return;
            }

            if (!email || !email.includes("@")) {
                if (message) {
                    message.textContent =
                        "Enter a valid email address.";
                }
                return;
            }

            if (!phone) {
                if (message) {
                    message.textContent =
                        "Enter your phone number.";
                }
                return;
            }

            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent =
                    "Saving...";
            }

            if (message) {
                message.textContent =
                    "Updating your profile...";
            }

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

                if (message) {
                    message.textContent =
                        "Profile updated successfully.";
                }

            } catch (error) {
                console.error(
                    "Edit profile error:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message ||
                        "Unable to update profile.";
                }

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
                    message.textContent =
                        "New password must be at least 8 characters.";
                }

                return;
            }

            if (
                newPassword !==
                confirmNewPassword
            ) {
                if (message) {
                    message.textContent =
                        "New passwords do not match.";
                }

                return;
            }

            if (
                currentPassword ===
                newPassword
            ) {
                if (message) {
                    message.textContent =
                        "Your new password must be different.";
                }

                return;
            }

            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent =
                    "Updating...";
            }

            if (message) {
                message.textContent =
                    "Updating your password...";
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
                    message.textContent =
                        "Password changed successfully.";
                }

            } catch (error) {
                console.error(
                    "Change password error:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message ||
                        "Unable to change password.";
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
   PAGE INITIALIZATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadAccountInformation();
        setupEditProfile();
        setupChangePassword();
    }
);
