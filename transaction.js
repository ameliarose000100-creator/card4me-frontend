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
            "transactionMessage"
        );

    const list =
        document.getElementById(
            "transactionList"
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
                            localStorage.getItem(
                                "card4me_token"
                            )
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

            message.textContent =
                `${transactions.length} transaction(s) found`;

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

                const details =
                    transaction.details ||
                    "CARD4ME transaction";

                const date =
                    transaction.created_at
                        ? new Date(
                              transaction.created_at
                          ).toLocaleString()
                        : "Date unavailable";

                item.innerHTML = `
                    <div class="transaction-left">

                        <div class="transaction-icon">
                            ${getTransactionIcon(type)}
                        </div>

                        <div class="transaction-details">

                            <strong>
                                ${escapeTransactionText(type)}
                            </strong>

                            <span>
                                ${escapeTransactionText(details)}
                            </span>

                            <span>
                                ${escapeTransactionText(date)}
                            </span>

                        </div>

                    </div>

                    <div class="transaction-right">

                        <span class="transaction-amount">
                            ${formattedAmount}
                        </span>

                        <span class="transaction-status">
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