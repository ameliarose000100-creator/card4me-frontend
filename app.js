/* =====================================================
   CARD4ME APP.JS
   PART 1A — CORE API + AUTHENTICATION FOUNDATION
===================================================== */


/* =====================================================
   API CONFIGURATION
===================================================== */

const API_BASE =
    "https://card4me-backend.onrender.com";


/* =====================================================
   AUTHENTICATION STORAGE KEYS
===================================================== */

const AUTH_TOKEN_KEY =
    "card4me_token";

const AUTH_USER_KEY =
    "card4me_user";


/*
 * Legacy keys are kept for compatibility with
 * older CARD4ME pages.
 */

const LEGACY_LOGIN_KEY =
    "card4meLoggedIn";

const LEGACY_USER_KEY =
    "card4meUser";


/* =====================================================
   GET AUTH TOKEN
===================================================== */

function getToken() {

    try {

        return localStorage.getItem(
            AUTH_TOKEN_KEY
        );

    } catch (error) {

        console.warn(
            "Unable to read authentication token."
        );

        return null;

    }

}


/* =====================================================
   GET CURRENT USER
===================================================== */

function getUser() {

    try {

        const saved =
            localStorage.getItem(
                AUTH_USER_KEY
            );


        if (!saved) {

            return null;

        }


        const user =
            JSON.parse(saved);


        if (
            !user ||
            typeof user !== "object"
        ) {

            return null;

        }


        return user;

    } catch (error) {

        console.warn(
            "Unable to read saved user."
        );

        return null;

    }

}


/* =====================================================
   SAVE AUTHENTICATION
===================================================== */

function saveAuth(token, user) {

    if (!token || !user) {

        throw new Error(
            "Invalid authentication data."
        );

    }


    localStorage.setItem(
        AUTH_TOKEN_KEY,
        token
    );


    localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(user)
    );


    /*
     * Compatibility with older CARD4ME pages.
     */

    localStorage.setItem(
        LEGACY_LOGIN_KEY,
        "true"
    );


    localStorage.setItem(
        LEGACY_USER_KEY,
        JSON.stringify(user)
    );

}


/* =====================================================
   CLEAR AUTHENTICATION
===================================================== */

function clearAuth() {

    try {

        localStorage.removeItem(
            AUTH_TOKEN_KEY
        );

        localStorage.removeItem(
            AUTH_USER_KEY
        );

        localStorage.removeItem(
            LEGACY_LOGIN_KEY
        );

        localStorage.removeItem(
            LEGACY_USER_KEY
        );

        /*
         * Payment/virtual-account information is
         * session-only and should disappear on logout.
         */

        sessionStorage.removeItem(
            "card4me_payment"
        );

        sessionStorage.removeItem(
            "card4me_virtual_account"
        );

    } catch (error) {

        console.warn(
            "Unable to completely clear authentication."
        );

    }

}


/* =====================================================
   CHECK LOGIN STATUS
===================================================== */

function isLoggedIn() {

    const token =
        getToken();

    const user =
        getUser();


    return Boolean(
        token &&
        user &&
        user.id
    );

}


/* =====================================================
   REQUIRE LOGIN
===================================================== */

function requireLogin() {

    if (
        !isLoggedIn()
    ) {

        window.location.replace(
            "login.html"
        );

        return false;

    }


    return true;

}


/* =====================================================
   API REQUEST HELPER
===================================================== */

async function apiRequest(
    url,
    options = {}
) {

    const requestOptions = {
        ...options
    };


    /*
     * Clone headers so the original options
     * object is not modified.
     */

    requestOptions.headers = {
        ...(options.headers || {})
    };


    /*
     * Add JSON content type when appropriate.
     */

    if (
        requestOptions.body &&
        typeof requestOptions.body === "string" &&
        !requestOptions.headers[
            "Content-Type"
        ]
    ) {

        requestOptions.headers[
            "Content-Type"
        ] =
            "application/json";

    }


    /*
     * Add authentication token.
     */

    const token =
        getToken();


    if (token) {

        requestOptions.headers[
            "Authorization"
        ] =
            `Bearer ${token}`;

    }


    let response;


    try {

        response =
            await fetch(
                `${API_BASE}${url}`,
                requestOptions
            );

    } catch (error) {

        throw new Error(
            "Unable to connect to CARD4ME. Please check your internet connection."
        );

    }


    let result =
        null;


    try {

        result =
            await response.json();

    } catch (error) {

        result = null;

    }


    /*
     * Authentication expired/invalid.
     */

    if (
        response.status === 401
    ) {

        clearAuth();


        /*
         * Don't redirect repeatedly if we are
         * already on the login page.
         */

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (
            currentPage !== "login.html"
        ) {

            window.location.replace(
                "login.html"
            );

        }


        throw new Error(
            result?.message ||
            "Authentication required."
        );

    }


    /*
     * Other backend errors.
     */

    if (
        !response.ok
    ) {

        throw new Error(
            result?.message ||
            "CARD4ME request failed."
        );

    }


    return result;

}


/* =====================================================
   MONEY FORMATTER
===================================================== */

function money(amount) {

    const value =
        Number(amount);


    const safeValue =
        Number.isFinite(value)
            ? value
            : 0;


    try {

        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(
            safeValue
        );

    } catch (error) {

        return `₦${safeValue.toFixed(2)}`;

    }

}


/* =====================================================
   MOBILE MENU
===================================================== */

function toggleMenu() {

    const nav =
        document.getElementById("mainNav") ||
        document.getElementById("nav");


    if (!nav) {

        return;

    }


    nav.classList.toggle(
        "active"
    );

}

/* =====================================================
   PART 1B — LOGIN + REGISTRATION + LOGOUT
===================================================== */


/* =====================================================
   LOGIN
===================================================== */

async function loginUser(event) {

    if (event) {
        event.preventDefault();
    }


    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("loginButton");


    const email =
        emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (!email) {

        alert(
            "Please enter your email address."
        );

        if (emailInput) {
            emailInput.focus();
        }

        return false;

    }


    if (!password) {

        alert(
            "Please enter your password."
        );

        if (passwordInput) {
            passwordInput.focus();
        }

        return false;

    }


    if (loginButton) {

        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";

    }


    try {

        const result =
            await apiRequest(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Login failed."
            );

        }


        /*
         * Support both:
         *
         * result.token
         *
         * and:
         *
         * result.data.token
         */

        const token =
            result.token ||
            result?.data?.token;


        const user =
            result.user ||
            result?.data?.user;


        if (!token || !user) {

            throw new Error(
                "Login response was incomplete."
            );

        }


        saveAuth(
            token,
            user
        );


        /*
         * Go to dashboard only after
         * authentication has been saved.
         */

        window.location.replace(
            "dashboard.html"
        );


        return true;

    } catch (error) {

        console.warn(
            "Login failed:",
            error.message
        );


        alert(
            error.message ||
            "Unable to login. Please try again."
        );


        if (loginButton) {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";

        }


        return false;

    }

}


/* =====================================================
   REGISTRATION
===================================================== */

async function registerUser(event) {

    if (event) {
        event.preventDefault();
    }


    const fullNameInput =
        document.getElementById("fullName");

    const emailInput =
        document.getElementById("email");

    const phoneInput =
        document.getElementById("phone");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById(
            "confirmPassword"
        );

    const registerButton =
        document.getElementById(
            "registerButton"
        );


    const fullName =
        fullNameInput
            ? fullNameInput.value.trim()
            : "";

    const email =
        emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";

    const phone =
        phoneInput
            ? phoneInput.value
                .replace(/\s+/g, "")
                .trim()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";

    const confirmPassword =
        confirmPasswordInput
            ? confirmPasswordInput.value
            : "";


    if (!fullName) {

        alert(
            "Please enter your full name."
        );

        if (fullNameInput) {
            fullNameInput.focus();
        }

        return false;

    }


    if (fullName.length < 2) {

        alert(
            "Please enter a valid full name."
        );

        if (fullNameInput) {
            fullNameInput.focus();
        }

        return false;

    }


    if (!email) {

        alert(
            "Please enter your email address."
        );

        if (emailInput) {
            emailInput.focus();
        }

        return false;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(email)
    ) {

        alert(
            "Please enter a valid email address."
        );

        if (emailInput) {
            emailInput.focus();
        }

        return false;

    }


    if (!phone) {

        alert(
            "Please enter your phone number."
        );

        if (phoneInput) {
            phoneInput.focus();
        }

        return false;

    }


    if (
        phone.length < 7 ||
        phone.length > 15
    ) {

        alert(
            "Please enter a valid phone number."
        );

        if (phoneInput) {
            phoneInput.focus();
        }

        return false;

    }


    if (!password) {

        alert(
            "Please create a password."
        );

        if (passwordInput) {
            passwordInput.focus();
        }

        return false;

    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        if (passwordInput) {
            passwordInput.focus();
        }

        return false;

    }


    /*
     * Only check confirmation when the
     * confirmation field exists.
     */

    if (
        confirmPasswordInput &&
        password !== confirmPassword
    ) {

        alert(
            "Passwords do not match."
        );

        confirmPasswordInput.focus();

        return false;

    }


    if (registerButton) {

        registerButton.disabled =
            true;

        registerButton.textContent =
            "Creating account...";

    }


    try {

        const result =
            await apiRequest(
                "/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
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


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Registration failed."
            );

        }


        alert(
            result.message ||
            "Account created successfully. Please login."
        );


        /*
         * Registration does not automatically
         * create a login session.
         */

        window.location.replace(
            "login.html"
        );


        return true;

    } catch (error) {

        console.warn(
            "Registration failed:",
            error.message
        );


        alert(
            error.message ||
            "Unable to create your account."
        );


        if (registerButton) {

            registerButton.disabled =
                false;

            registerButton.textContent =
                "Create Account";

        }


        return false;

    }

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {

    clearAuth();


    /*
     * Clear only CARD4ME session/payment
     * information. We do not touch unrelated
     * browser storage.
     */

    try {

        sessionStorage.clear();

    } catch (error) {

        console.warn(
            "Unable to clear session storage."
        );

    }


    window.location.replace(
        "login.html"
    );

}


/* =====================================================
   AUTO-ATTACH AUTH FORMS
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById(
                "loginForm"
            );


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginUser
            );

        }


        const registerForm =
            document.getElementById(
                "registerForm"
            );


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                registerUser
            );

        }


        /*
         * Logout buttons can use:
         *
         * onclick="logoutUser()"
         *
         * or:
         *
         * data-action="logout"
         */

        const logoutButtons =
            document.querySelectorAll(
                '[data-action="logout"]'
            );


        logoutButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        logoutUser();

                    }
                );

            }
        );

    },
    { once: true }
);

/* =====================================================
   PART 1C — WALLET + FUNDING
===================================================== */


/* =====================================================
   LOAD WALLET BALANCE
===================================================== */

async function loadWallet() {

    const user =
        getUser();


    if (
        !user ||
        !user.id
    ) {

        throw new Error(
            "Authentication required."
        );

    }


    const result =
        await apiRequest(
            `/api/wallet/${encodeURIComponent(user.id)}`
        );


    if (
        !result ||
        result.success === false
    ) {

        throw new Error(
            result?.message ||
            "Unable to load wallet."
        );

    }


    /*
     * Support the backend response whether
     * balance is returned directly or inside data.
     */

    let balance;


    if (
        result?.data &&
        typeof result.data === "object"
    ) {

        balance =
            result.data.balance;

    }


    if (
        balance === undefined &&
        result.balance !== undefined
    ) {

        balance =
            result.balance;

    }


    const numericBalance =
        Number(balance);


    const safeBalance =
        Number.isFinite(numericBalance)
            ? numericBalance
            : 0;


    /*
     * Update wallet page balance.
     */

    const walletBalance =
        document.getElementById(
            "walletBalance"
        );


    if (walletBalance) {

        walletBalance.textContent =
            money(safeBalance);

    }


    /*
     * Update dashboard balance.
     */

    const dashBalance =
        document.getElementById(
            "dashBalance"
        );


    if (dashBalance) {

        dashBalance.textContent =
            money(safeBalance);

    }


    /*
     * This local value is ONLY a display cache.
     * The backend remains the source of truth.
     */

    try {

        localStorage.setItem(
            "card4me_balance",
            String(safeBalance)
        );

    } catch (error) {

        console.warn(
            "Unable to save balance display cache."
        );

    }


    return safeBalance;

}


/* =====================================================
   FUND WALLET
===================================================== */

async function fundWallet(event) {

    if (event) {

        event.preventDefault();

    }


    if (!requireLogin()) {

        return false;

    }


    const amountInput =
        document.getElementById(
            "fundAmount"
        );


    const submitButton =
        document.querySelector(
            "#fundWalletForm button[type='submit']"
        );


    const rawAmount =
        amountInput
            ? amountInput.value.trim()
            : "";


    const amount =
        Number(rawAmount);


    /*
     * Frontend validation.
     *
     * The backend must still validate
     * everything independently.
     */

    if (
        !Number.isFinite(amount) ||
        amount < 500
    ) {

        alert(
            "Minimum wallet funding amount is ₦500."
        );

        if (amountInput) {

            amountInput.focus();

        }

        return false;

    }


    if (amount > 1000000) {

        alert(
            "Maximum wallet funding amount is ₦1,000,000."
        );

        if (amountInput) {

            amountInput.focus();

        }

        return false;

    }


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Processing...";

    }


    try {

        /*
         * This endpoint creates the Flutterwave
         * virtual account/payment information.
         *
         * It does NOT directly credit the wallet.
         */

        const result =
            await apiRequest(
                "/api/flutterwave/virtual-account",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        amount: amount
                    })
                }
            );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Unable to create funding account."
            );

        }


        /*
         * Support the known response structures.
         */

        const account =
            result?.data?.account ||
            result?.account ||
            result?.data;


        if (
            !account ||
            typeof account !== "object"
        ) {

            throw new Error(
                "Funding account information was not returned."
            );

        }


        /*
         * Store this only for temporary display.
         * It is NOT trusted as wallet balance.
         */

        try {

            sessionStorage.setItem(
                "card4me_virtual_account",
                JSON.stringify(account)
            );

        } catch (error) {

            console.warn(
                "Unable to save virtual account locally."
            );

        }


        displayVirtualAccount(
            account
        );


        /*
         * Refresh the authoritative wallet balance.
         *
         * The balance should normally remain unchanged
         * until the payment is actually confirmed.
         */

        try {

            await loadWallet();

        } catch (error) {

            console.warn(
                "Wallet refresh failed after funding setup."
            );

        }


        return true;

    } catch (error) {

        console.warn(
            "Wallet funding failed:",
            error.message
        );


        alert(
            error.message ||
            "Unable to start wallet funding."
        );


        return false;

    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Fund Wallet";

        }

    }

}


/* =====================================================
   DISPLAY VIRTUAL ACCOUNT
===================================================== */

function displayVirtualAccount(
    account
) {

    const details =
        document.getElementById(
            "virtualAccountDetails"
        );


    const content =
        document.getElementById(
            "virtualAccountContent"
        );


    if (!content) {

        return;

    }


    const accountNumber =
        account?.account_number ||
        account?.accountNumber ||
        account?.number ||
        "";


    const accountName =
        account?.account_name ||
        account?.accountName ||
        account?.name ||
        "";


    const bankName =
        account?.bank_name ||
        account?.bankName ||
        account?.bank ||
        "";


    const narration =
        account?.narration ||
        account?.reference ||
        "";


    content.innerHTML = `
        <div class="virtual-account-card">

            <div class="virtual-account-row">
                <span>Bank</span>
                <strong>
                    ${escapeHtml(bankName || "Unavailable")}
                </strong>
            </div>

            <div class="virtual-account-row">
                <span>Account Name</span>
                <strong>
                    ${escapeHtml(accountName || "Unavailable")}
                </strong>
            </div>

            <div class="virtual-account-row">
                <span>Account Number</span>
                <strong>
                    ${escapeHtml(accountNumber || "Unavailable")}
                </strong>
            </div>

            ${
                narration
                    ? `
                        <div class="virtual-account-row">
                            <span>Reference</span>
                            <strong>
                                ${escapeHtml(narration)}
                            </strong>
                        </div>
                    `
                    : ""
            }

        </div>
    `;


    if (details) {

        details.style.display =
            "block";

    }

}


/* =====================================================
   LOAD SAVED VIRTUAL ACCOUNT
===================================================== */

function loadSavedVirtualAccount() {

    try {

        const saved =
            sessionStorage.getItem(
                "card4me_virtual_account"
            );


        if (!saved) {

            return null;

        }


        const account =
            JSON.parse(saved);


        if (
            !account ||
            typeof account !== "object"
        ) {

            return null;

        }


        displayVirtualAccount(
            account
        );


        return account;

    } catch (error) {

        console.warn(
            "Unable to restore virtual account."
        );

        return null;

    }

}

/* =====================================================
   PART 1D — TRANSACTIONS
===================================================== */


/* =====================================================
   LOAD TRANSACTIONS
===================================================== */

async function loadTransactions() {

    const user =
        getUser();


    if (
        !user ||
        !user.id
    ) {

        throw new Error(
            "Authentication required."
        );

    }


    const list =
        document.getElementById(
            "transactionsList"
        );


    const empty =
        document.getElementById(
            "emptyTransactions"
        );


    const loading =
        document.getElementById(
            "transactionsLoading"
        );


    const errorBox =
        document.getElementById(
            "transactionsError"
        );


    if (loading) {

        loading.style.display =
            "block";

    }


    if (errorBox) {

        errorBox.style.display =
            "none";

    }


    try {

        const result =
            await apiRequest(
                `/api/transactions/${encodeURIComponent(user.id)}`
            );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Unable to load transactions."
            );

        }


        /*
         * Support the different possible
         * backend response structures.
         */

        const transactions =
            Array.isArray(
                result?.data?.transactions
            )
                ? result.data.transactions

                : Array.isArray(
                    result?.data
                )
                    ? result.data

                    : Array.isArray(
                        result?.transactions
                    )
                        ? result.transactions

                        : [];


        if (loading) {

            loading.style.display =
                "none";

        }


        if (!list) {

            return transactions;

        }


        list.innerHTML =
            "";


        if (!transactions.length) {

            if (empty) {

                empty.style.display =
                    "block";

            }

            return [];

        }


        if (empty) {

            empty.style.display =
                "none";

        }


        transactions.forEach(
            function (transaction) {

                const html =
                    transactionHtml(
                        transaction
                    );


                if (html) {

                    list.insertAdjacentHTML(
                        "beforeend",
                        html
                    );

                }

            }
        );


        return transactions;

    } catch (error) {

        if (loading) {

            loading.style.display =
                "none";

        }


        if (errorBox) {

            errorBox.textContent =
                error.message ||
                "Unable to load transactions.";

            errorBox.style.display =
                "block";

        }


        console.warn(
            "Transaction loading failed:",
            error.message
        );


        throw error;

    }

}


/* =====================================================
   TRANSACTION HTML
===================================================== */

function transactionHtml(
    transaction
) {

    if (
        !transaction ||
        typeof transaction !== "object"
    ) {

        return "";

    }


    const type =
        escapeHtml(
            formatTransactionType(
                transaction.type
            )
        );


    const status =
        String(
            transaction.status ||
            "pending"
        )
            .trim()
            .toLowerCase();


    const safeStatus =
        escapeHtml(
            capitalize(status)
        );


    const numericAmount =
        Number(
            transaction.amount
        );


    const amount =
        money(
            Number.isFinite(
                numericAmount
            )
                ? numericAmount
                : 0
        );


    const details =
        escapeHtml(
            transaction.details ||
            "CARD4ME transaction"
        );


    const reference =
        escapeHtml(
            transaction.reference ||
            "No reference"
        );


    const date =
        escapeHtml(
            formatTransactionDate(
                transaction.created_at ||
                transaction.createdAt
            )
        );


    let statusClass =
        "transaction-pending";


    if (
        status === "success" ||
        status === "successful" ||
        status === "completed"
    ) {

        statusClass =
            "transaction-success";

    }


    if (
        status === "failed" ||
        status === "cancelled" ||
        status === "canceled"
    ) {

        statusClass =
            "transaction-failed";

    }


    return `
        <article class="transaction-item">

            <div class="transaction-main">

                <h3>
                    ${type}
                </h3>

                <p>
                    ${details}
                </p>

                <small>
                    Ref: ${reference}
                </small>

                <small>
                    ${date}
                </small>

            </div>


            <div class="transaction-side">

                <strong>
                    ${amount}
                </strong>

                <span class="${statusClass}">
                    ${safeStatus}
                </span>

            </div>

        </article>
    `;

}


/* =====================================================
   FORMAT TRANSACTION TYPE
===================================================== */

function formatTransactionType(
    type
) {

    const value =
        String(
            type ||
            "transaction"
        )
            .trim()
            .toLowerCase();


    const types = {

        funding:
            "Wallet Funding",

        wallet_funding:
            "Wallet Funding",

        deposit:
            "Wallet Funding",

        airtime:
            "Airtime Purchase",

        airtime_purchase:
            "Airtime Purchase",

        data:
            "Data Purchase",

        data_purchase:
            "Data Purchase",

        service:
            "Service Purchase",

        virtual_account:
            "Virtual Account",

        payment:
            "Payment"

    };


    if (
        types[value]
    ) {

        return types[value];

    }


    return capitalize(
        value.replace(
            /[_-]+/g,
            " "
        )
    );

}


/* =====================================================
   FORMAT TRANSACTION DATE
===================================================== */

function formatTransactionDate(
    value
) {

    if (!value) {

        return "Date unavailable";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    try {

        return date.toLocaleString(
            "en-NG",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    } catch (error) {

        return date.toLocaleString(
            "en-NG"
        );

    }

}


/* =====================================================
   CAPITALIZE TEXT
===================================================== */

function capitalize(
    value
) {

    const text =
        String(
            value || ""
        )
            .trim();


    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(
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

/* =====================================================
   PART 1E — AIRTIME + DATA + SERVICES
===================================================== */


/* =====================================================
   CHECK WALLET BALANCE
===================================================== */

async function checkWalletBalance(
    amount
) {

    const user =
        getUser();


    if (
        !user ||
        !user.id
    ) {

        throw new Error(
            "Authentication required."
        );

    }


    const requestedAmount =
        Number(amount);


    if (
        !Number.isFinite(
            requestedAmount
        ) ||
        requestedAmount <= 0
    ) {

        throw new Error(
            "Invalid amount."
        );

    }


    const balance =
        await loadWallet();


    if (
        balance < requestedAmount
    ) {

        throw new Error(
            "Insufficient wallet balance."
        );

    }


    return true;

}


/* =====================================================
   GENERIC SERVICE PURCHASE
===================================================== */

async function purchaseService(
    config = {}
) {

    if (!requireLogin()) {

        return false;

    }


    const endpoint =
        config.endpoint;


    const amount =
        Number(config.amount);


    const payload =
        config.payload || {};


    if (!endpoint) {

        throw new Error(
            "Service endpoint is not configured."
        );

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        throw new Error(
            "Please enter a valid amount."
        );

    }


    /*
     * Check the authoritative wallet balance
     * before attempting a purchase.
     */

    await checkWalletBalance(
        amount
    );


    const result =
        await apiRequest(
            endpoint,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    payload
                )
            }
        );


    if (
        !result ||
        result.success === false
    ) {

        throw new Error(
            result?.message ||
            "Service purchase failed."
        );

    }


    /*
     * Refresh wallet after a successful
     * backend service transaction.
     */

    try {

        await loadWallet();

    } catch (error) {

        console.warn(
            "Wallet refresh after purchase failed."
        );

    }


    return result;

}


/* =====================================================
   AIRTIME PURCHASE
===================================================== */

async function airtimePurchase(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const amountInput =
        document.getElementById(
            "airtimeAmount"
        );


    const phoneInput =
        document.getElementById(
            "airtimePhone"
        );


    const networkInput =
        document.getElementById(
            "airtimeNetwork"
        );


    const amount =
        Number(
            amountInput
                ? amountInput.value
                : 0
        );


    const phone =
        phoneInput
            ? phoneInput.value
                .replace(/\s+/g, "")
                .trim()
            : "";


    const network =
        networkInput
            ? networkInput.value.trim()
            : "";


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid airtime amount."
        );

        return false;

    }


    if (!phone) {

        alert(
            "Please enter the phone number."
        );

        if (phoneInput) {

            phoneInput.focus();

        }

        return false;

    }


    if (!network) {

        alert(
            "Please select a network."
        );

        if (networkInput) {

            networkInput.focus();

        }

        return false;

    }


    try {

        const result =
            await purchaseService(
                {
                    endpoint:
                        "/api/airtime/purchase",

                    amount:
                        amount,

                    payload: {
                        phone:
                            phone,

                        network:
                            network,

                        amount:
                            amount
                    }
                }
            );


        alert(
            result?.message ||
            "Airtime purchase completed successfully."
        );


        return true;

    } catch (error) {

        console.warn(
            "Airtime purchase failed:",
            error.message
        );


        alert(
            error.message ||
            "Unable to purchase airtime."
        );


        return false;

    }

}


/* =====================================================
   DATA PURCHASE
===================================================== */

async function dataPurchase(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const phoneInput =
        document.getElementById(
            "dataPhone"
        );


    const networkInput =
        document.getElementById(
            "dataNetwork"
        );


    const planInput =
        document.getElementById(
            "dataPlan"
        );


    const amountInput =
        document.getElementById(
            "dataAmount"
        );


    const phone =
        phoneInput
            ? phoneInput.value
                .replace(/\s+/g, "")
                .trim()
            : "";


    const network =
        networkInput
            ? networkInput.value.trim()
            : "";


    const plan =
        planInput
            ? planInput.value.trim()
            : "";


    const amount =
        Number(
            amountInput
                ? amountInput.value
                : 0
        );


    if (!phone) {

        alert(
            "Please enter the phone number."
        );

        if (phoneInput) {

            phoneInput.focus();

        }

        return false;

    }


    if (!network) {

        alert(
            "Please select a network."
        );

        if (networkInput) {

            networkInput.focus();

        }

        return false;

    }


    if (!plan) {

        alert(
            "Please select a data plan."
        );

        if (planInput) {

            planInput.focus();

        }

        return false;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Please select a valid data plan."
        );

        return false;

    }


    try {

        const result =
            await purchaseService(
                {
                    endpoint:
                        "/api/data/purchase",

                    amount:
                        amount,

                    payload: {
                        phone:
                            phone,

                        network:
                            network,

                        plan:
                            plan,

                        amount:
                            amount
                    }
                }
            );


        alert(
            result?.message ||
            "Data purchase completed successfully."
        );


        return true;

    } catch (error) {

        console.warn(
            "Data purchase failed:",
            error.message
        );


        alert(
            error.message ||
            "Unable to purchase data."
        );


        return false;

    }

}


/* =====================================================
   OPEN SERVICE PAGE
===================================================== */

function openService(
    page
) {

    if (!page) {

        return;

    }


    const allowedPages = [

        "airtime.html",
        "data.html",
        "services.html",
        "wallet.html",
        "transaction.html",
        "dashboard.html"

    ];


    const cleanPage =
        String(page)
            .trim();


    /*
     * Only allow known CARD4ME pages.
     */

    if (
        !allowedPages.includes(
            cleanPage
        )
    ) {

        console.warn(
            "Blocked unknown service page."
        );

        return;

    }


    window.location.href =
        cleanPage;

}


/* =====================================================
   SERVICE FORM HELPER
===================================================== */

function setButtonLoading(
    button,
    loadingText = "Processing..."
) {

    if (!button) {

        return;

    }


    if (
        !button.dataset.originalText
    ) {

        button.dataset.originalText =
            button.textContent;

    }


    button.disabled =
        true;


    button.textContent =
        loadingText;

}


/* =====================================================
   RESTORE SERVICE BUTTON
===================================================== */

function restoreButton(
    button
) {

    if (!button) {

        return;

    }


    button.disabled =
        false;


    if (
        button.dataset.originalText
    ) {

        button.textContent =
            button.dataset.originalText;

    }

}


/* =====================================================
   NOTE
===================================================== */

/*
 * The airtime and data endpoints above are kept
 * for frontend compatibility.
 *
 * They should only be used for real purchases
 * after the corresponding backend provider
 * integration has been fully connected and tested.
 *
 * The frontend never directly deducts wallet money.
 * The backend must perform the actual transaction,
 * balance deduction and provider operation.
 */
 
 /* =====================================================
   PART 1F — COMPATIBILITY + FINALIZATION
===================================================== */


/* =====================================================
   GET CACHED BALANCE
===================================================== */

/*
 * Compatibility helper only.
 *
 * The backend wallet balance is authoritative.
 * This local value is only a temporary display cache.
 */

function getBalance() {

    try {

        const value =
            Number(
                localStorage.getItem(
                    "card4me_balance"
                )
            );


        return Number.isFinite(value)
            ? value
            : 0;

    } catch (error) {

        return 0;

    }

}


/* =====================================================
   SET CACHED BALANCE
===================================================== */

/*
 * This does NOT change the real wallet balance.
 * It only updates the local display cache.
 */

function setBalance(
    amount
) {

    const value =
        Number(amount);


    const safeValue =
        Number.isFinite(value)
            ? value
            : 0;


    try {

        localStorage.setItem(
            "card4me_balance",
            String(safeValue)
        );

    } catch (error) {

        console.warn(
            "Unable to save balance cache."
        );

    }


    return safeValue;

}


/* =====================================================
   GET LEGACY TRANSACTIONS
===================================================== */

/*
 * Older CARD4ME pages may still use this function.
 *
 * The transactions page itself uses the backend
 * through loadTransactions().
 */

function getTransactions() {

    try {

        const saved =
            localStorage.getItem(
                "card4me_tx"
            );


        if (!saved) {

            return [];

        }


        const transactions =
            JSON.parse(saved);


        return Array.isArray(
            transactions
        )
            ? transactions
            : [];

    } catch (error) {

        console.warn(
            "Unable to read cached transactions."
        );

        return [];

    }

}


/* =====================================================
   ADD LEGACY TRANSACTION
===================================================== */

/*
 * Compatibility helper for older frontend code.
 *
 * This does NOT create an official backend
 * transaction.
 */

function addTx(
    transaction
) {

    if (
        !transaction ||
        typeof transaction !== "object"
    ) {

        return false;

    }


    try {

        const transactions =
            getTransactions();


        transactions.unshift(
            transaction
        );


        /*
         * Keep only the most recent 100
         * cached records.
         */

        const limited =
            transactions.slice(
                0,
                100
            );


        localStorage.setItem(
            "card4me_tx",
            JSON.stringify(
                limited
            )
        );


        return true;

    } catch (error) {

        console.warn(
            "Unable to save cached transaction."
        );

        return false;

    }

}


/* =====================================================
   CURRENT USER COMPATIBILITY HELPER
===================================================== */

function currentUser() {

    return getUser();

}


/* =====================================================
   LOGIN CHECK COMPATIBILITY HELPER
===================================================== */

function checkLogin() {

    return isLoggedIn();

}


/* =====================================================
   LOGOUT COMPATIBILITY HELPER
===================================================== */

function logout() {

    logoutUser();

}


/* =====================================================
   PROTECT PAGE
===================================================== */

function protectPage() {

    return requireLogin();

}


/* =====================================================
   PAGE-SAFE LOGOUT BUTTONS
===================================================== */

function initializeLogoutButtons() {

    const logoutButtons =
        document.querySelectorAll(
            '[data-action="logout"], .logout-button'
        );


    logoutButtons.forEach(
        function (button) {

            /*
             * Prevent attaching the same handler
             * more than once.
             */

            if (
                button.dataset.card4meLogoutReady ===
                "true"
            ) {

                return;

            }


            button.dataset.card4meLogoutReady =
                "true";


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    logoutUser();

                }
            );

        }
    );

}


/* =====================================================
   SAFE PAGE INITIALIZATION
===================================================== */

/*
 * IMPORTANT:
 *
 * Dashboard, wallet and transactions pages already
 * have their own secure initialization code.
 *
 * Therefore this function does NOT automatically
 * call loadWallet() or loadTransactions().
 *
 * This prevents duplicate API requests.
 */

function initializeCard4mePage() {

    initializeLogoutButtons();


    /*
     * Restore a previously created virtual account
     * only when the wallet page is open.
     */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        currentPage === "wallet.html"
    ) {

        loadSavedVirtualAccount();

    }

}


/* =====================================================
   FINAL DOM INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeCard4mePage();

    },
    { once: true }
);


/* =====================================================
   CARD4ME APP.JS COMPLETE
===================================================== */

/*
 * PART 1A  — Core API + Authentication
 * PART 1B  — Login + Registration + Logout
 * PART 1C  — Wallet + Funding
 * PART 1D  — Transactions
 * PART 1E  — Airtime + Data + Services
 * PART 1F  — Compatibility + Finalization
 *
 * Backend remains the source of truth for:
 * - Authentication
 * - Wallet balance
 * - Transactions
 * - Payment confirmation
 * - Service purchases
 *
 * Never trust localStorage for financial authority.
 */


/* =====================================================
   DATA PLANS
===================================================== */

let card4meDataPlans = [];

async function loadDataPlans() {

    const networkSelect = document.getElementById("dnetwork");
    const planSelect = document.getElementById("bundle");

    if (!networkSelect || !planSelect) {
        return;
    }

    try {

        const result = await apiRequest(
            "/api/data/plans",
            {
                method: "GET"
            }
        );

        if (!result || !result.success) {
            throw new Error(
                result?.message || "Unable to load data plans."
            );
        }

        card4meDataPlans = Array.isArray(result.plans)
            ? result.plans
            : [];

        const networks = [
            ...new Set(
                card4meDataPlans
                    .map(plan => String(plan.network || "").toUpperCase())
                    .filter(Boolean)
            )
        ];

        networkSelect.innerHTML =
            '<option value="">Select network</option>';

        networks.forEach(network => {

            const option =
                document.createElement("option");

            option.value = network;
            option.textContent = network;

            networkSelect.appendChild(option);

        });

        planSelect.innerHTML =
            '<option value="">Select data plan</option>';

        planSelect.disabled = true;

    } catch (error) {

        console.error(
            "CARD4ME: Unable to load data plans:",
            error
        );

    }

}


function filterDataPlans() {

    const networkSelect =
        document.getElementById("dnetwork");

    const planSelect =
        document.getElementById("bundle");

    const amountInput =
        document.getElementById("dataAmount");

    const button =
        document.getElementById("dataButton");

    if (
        !networkSelect ||
        !planSelect ||
        !amountInput ||
        !button
    ) {
        return;
    }

    const selectedNetwork =
        String(networkSelect.value || "").toUpperCase();

    planSelect.innerHTML =
        '<option value="">Select data plan</option>';

    amountInput.value = "";
    button.disabled = true;

    if (!selectedNetwork) {
        planSelect.disabled = true;
        return;
    }

    const plans =
        card4meDataPlans.filter(
            plan =>
                String(plan.network || "").toUpperCase() ===
                selectedNetwork
        );

    plans.forEach(plan => {

        const option =
            document.createElement("option");

        option.value = String(plan.plan_id);

        option.textContent =
            `${plan.data_size || plan.plan_name} - ₦${Number(plan.price).toLocaleString()}${plan.validity ? ` (${plan.validity})` : ""}`;

        planSelect.appendChild(option);

    });

    planSelect.disabled = plans.length === 0;

    planSelect.onchange = function () {

        const selectedPlan =
            card4meDataPlans.find(
                plan =>
                    String(plan.plan_id) ===
                    String(planSelect.value)
            );

        if (!selectedPlan) {
            amountInput.value = "";
            button.disabled = true;
            return;
        }

        amountInput.value =
            Number(selectedPlan.price).toString();

        button.disabled = false;

    };

}


async function dataPurchase(event) {

    event.preventDefault();

    const phone =
        document.getElementById("dphone")?.value.trim();

    const network =
        document.getElementById("dnetwork")?.value;

    const planId =
        document.getElementById("bundle")?.value;

    if (!phone || !network || !planId) {
        alert("Please complete all data purchase fields.");
        return;
    }

    try {

        const result = await apiRequest(
            "/api/data/purchase",
            {
                method: "POST",
                body: JSON.stringify({
                    phone,
                    network,
                    planId: Number(planId)
                })
            }
        );

        if (!result || !result.success) {
            throw new Error(
                result?.message || "Data purchase failed."
            );
        }

        alert(
            result.message ||
            "Data purchase successful."
        );

        window.location.href =
            "transaction.html";

    } catch (error) {

        console.error(
            "CARD4ME: Data purchase error:",
            error
        );

        alert(
            error.message ||
            "Unable to purchase data."
        );

    }

}

