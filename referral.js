"use strict";

let referralProfile = null;

function formatMoney(value) {
    const amount = Number(value || 0);

    return `₦${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function setReferralStatus(message) {
    const status = document.getElementById("referralStatus");

    if (status) {
        status.textContent = message || "";
    }
}

function renderReferral(profile) {
    referralProfile = profile || {};

    const successfulReferrals =
        document.getElementById("successfulReferrals");

    const rewardsEarned =
        document.getElementById("rewardsEarned");

    const referralLink =
        document.getElementById("referralLink");

    const referralCode =
        document.getElementById("referralCode");

    if (successfulReferrals) {
        successfulReferrals.textContent =
            Number(profile.successfulReferrals || 0).toLocaleString();
    }

    if (rewardsEarned) {
        rewardsEarned.textContent =
            formatMoney(profile.rewardsEarned);
    }

    if (referralLink) {
        referralLink.value =
            profile.referralLink || "Referral link unavailable";
    }

    if (referralCode) {
        referralCode.textContent =
            `Referral Code: ${profile.referralCode || "—"}`;
    }
}

async function loadReferral() {
    setReferralStatus("Loading referral information...");

    try {
        const response = await apiRequest("/api/profile");

        if (!response || !response.success || !response.profile) {
            throw new Error(
                response?.message ||
                "Could not load referral information."
            );
        }

        renderReferral(response.profile);

        setReferralStatus("");

    } catch (error) {
        console.error("Referral loading error:", error);

        setReferralStatus(
            error.message ||
            "Could not load referral information."
        );
    }
}

async function copyReferralLink() {
    if (
        !referralProfile ||
        !referralProfile.referralLink
    ) {
        return;
    }

    try {
        await navigator.clipboard.writeText(
            referralProfile.referralLink
        );

        const button =
            document.getElementById("copyReferralButton");

        if (button) {
            const originalText = button.textContent;

            button.textContent = "Copied!";

            setTimeout(() => {
                button.textContent = originalText;
            }, 1600);
        }

    } catch (error) {
        const input =
            document.getElementById("referralLink");

        if (input) {
            input.focus();
            input.select();
        }

        setReferralStatus(
            "Select and copy the referral link manually."
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadReferral();

    const copyButton =
        document.getElementById("copyReferralButton");

    if (copyButton) {
        copyButton.addEventListener(
            "click",
            copyReferralLink
        );
    }
});
