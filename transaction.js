"use strict";

/* =========================================
   CARD4ME TRANSACTION HISTORY
========================================= */

const CARD4ME_API =
    "https://card4me-backend-1.onrender.com";

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (typeof requireLogin === "function") {

            if (!requireLogin()) {
                return;
            }

        }

        loadTransactions();

    }
);

async function loadTransactions() {

    const message =
        document.getElementById(
            "transactionsLoading"
        );

    const list =
        document.getElementById(
            "transactionsList"
        );

    const user =
        getUser();

    if (!user || !user.id) {

        if (message) {

            message.textContent =
                "Please log in to view your transactions.";

        }

        return;
    }

    if (message) {

        message.textContent =
            "Loading transactions...";

    }

    if (list) {

        list.innerHTML = "";

    }

    try {

        const response =
            await fetch(
                `${CARD4ME_API}/api/transactions/${encodeURIComponent(user.id)}`,
                {
                    headers: {
                        Authorization:
                            "Bearer " +
                            (typeof getToken === "function"
                                ? getToken()
                                : sessionStorage.getItem("card4me_token"))
                    }
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            if (message) {

                message.textContent =
                    data.message ||
                    "Unable to load transactions.";

            }

            return;
        }

        const transactions =
            Array.isArray(
                data.transactions
            )
                ? data.transactions
                : [];

        if (
            transactions.length === 0
        ) {

            if (message) {

                message.textContent = "";

            }

            if (list) {

                list.innerHTML = `
                    <div class="transaction-empty">
                        <strong>No transactions yet</strong>
                        <span>
                            Your CARD4ME wallet activity
                            will appear here.
                        </span>
                    </div>
                `;

            }

            return;
        }

        if (message) {

            message.textContent = "";
            message.style.display = "none";

        }

        transactions.forEach(
            function (
                transaction
            ) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "transaction-item";

                const type =
                    transaction.type ||
                    "Transaction";

                const amount =
                    Number(
                        transaction.amount
                    );

                const formattedAmount =
                    Number.isFinite(
                        amount
                    )
                        ? "₦" +
                          amount.toLocaleString(
                              "en-NG",
                              {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                              }
                          )
                        : "₦0.00";

                const status =
                    transaction.status ||
                    "success";

                let details =
                    transaction.details ||
                    "CARD4ME transaction";

                try {
                    const parsedDetails =
                        typeof details === "string"
                            ? JSON.parse(details)
                            : details;

                    if (
                        parsedDetails &&
                        typeof parsedDetails === "object" &&
                        parsedDetails.type
                    ) {
                        details =
                            parsedDetails.type;
                    }
                } catch (error) {
                    details =
                        String(details);
                }

                const date =
                    transaction.created_at
                        ? new Date(
                              transaction.created_at
                          ).toLocaleString()
                        : "Date unavailable";

                const reference =
                    transaction.reference ||
                    "Reference unavailable";

                const statusClass =
                    String(status).toLowerCase() === "success"
                        ? "transaction-success"
                        : String(status).toLowerCase() === "pending"
                            ? "transaction-pending"
                            : String(status).toLowerCase() === "failed"
                                ? "transaction-failed"
                                : "transaction-pending";

                item.innerHTML = `
                    <div class="transaction-card-top">

                        <div class="transaction-identity">

                            <div class="transaction-icon">
                                ${getTransactionIcon(type)}
                            </div>

                            <div class="transaction-main">

                                <strong>
                                    ${escapeTransactionText(type)}
                                </strong>

                                <span class="transaction-provider">
                                    ${escapeTransactionText(details)}
                                </span>

                            </div>

                        </div>

                        <strong class="transaction-amount">
                            ${formattedAmount}
                        </strong>

                    </div>

                    <div class="transaction-card-middle">

                        <div class="transaction-reference">

                            <span>
                                Reference
                            </span>

                            <strong>
                                ${escapeTransactionText(reference)}
                            </strong>

                        </div>

                    </div>

                    <div class="transaction-card-bottom">

                        <span class="transaction-date">
                            ${escapeTransactionText(date)}
                        </span>

                        <span class="${statusClass}">
                            ${escapeTransactionText(status)}
                        </span>

                    </div>
                `;

                list.appendChild(
                    item
                );

            }
        );

    } catch (error) {

        console.error(
            "Transaction loading error:",
            error
        );

        if (message) {

            message.textContent =
                "Unable to connect to the CARD4ME server.";

        }

    }

}

/* =========================================
   TRANSACTION ICON
========================================= */

function getTransactionIcon(
    type
) {

    const value =
        String(type || "")
            .toLowerCase();

    if (
        value.includes(
            "deposit"
        ) ||
        value.includes(
            "fund"
        ) ||
        value.includes(
            "wallet"
        )
    ) {
        return "💰";
    }

    if (
        value.includes(
            "airtime"
        )
    ) {
        return "📱";
    }

    if (
        value.includes(
            "data"
        )
    ) {
        return "📶";
    }

    return "💳";
}

/* =========================================
   SAFE TEXT
========================================= */

function escapeTransactionText(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}