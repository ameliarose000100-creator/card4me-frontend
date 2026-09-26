"use strict";

let newsArticles = [];

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatNewsDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function renderNews() {
    const grid = document.getElementById("newsGrid");
    const empty = document.getElementById("newsEmpty");

    if (!grid || !empty) return;

    if (!newsArticles.length) {
        grid.innerHTML = "";
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    grid.innerHTML = newsArticles.map(article => {
        const articleId = Number(article.id);

        const cover = article.cover_image
            ? `
                <img
                    class="news-cover"
                    src="${escapeHtml(article.cover_image)}"
                    alt="${escapeHtml(article.title)}"
                    loading="lazy"
                >
            `
            : `
                <div class="news-cover-placeholder">
                    CARD4ME
                </div>
            `;

        return `
            <article
                class="news-card"
                role="link"
                tabindex="0"
                onclick="openNewsArticle(${articleId})"
                onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openNewsArticle(${articleId}); }"
            >
                ${cover}

                <div class="news-card-body">
                    <div class="news-category">
                        ${escapeHtml(article.category || "CARD4ME Updates")}
                    </div>

                    <h2>${escapeHtml(article.title)}</h2>

                    <p class="news-summary">
                        ${escapeHtml(article.summary || "Read the latest CARD4ME update.")}
                    </p>

                    <div class="news-meta">
                        <span>${escapeHtml(article.author_name || "CARD4ME")}</span>
                        <span>${escapeHtml(formatNewsDate(article.published_at))}</span>
                    </div>

                    <button
                        type="button"
                        class="news-read-button"
                        onclick="event.stopPropagation(); openNewsArticle(${articleId});"
                    >
                        Read Full Article
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

function openNewsArticle(newsId) {
    const id = Number(newsId);

    if (!Number.isInteger(id) || id <= 0) {
        return;
    }

    window.location.href = `news-article.html?id=${encodeURIComponent(id)}`;
}

async function loadNews() {
    const status = document.getElementById("newsStatus");

    if (status) {
        status.textContent = "Loading latest news...";
    }

    try {
        const response = await apiRequest("/api/community/news");

        if (!response || !response.success) {
            throw new Error(
                response?.message || "Could not load news."
            );
        }

        newsArticles = Array.isArray(response.news)
            ? response.news
            : [];

        renderNews();

        if (status) {
            status.textContent = newsArticles.length
                ? `${newsArticles.length} article${newsArticles.length === 1 ? "" : "s"}`
                : "";
        }
    } catch (error) {
        console.error("News loading error:", error);

        if (status) {
            status.textContent =
                error.message || "Could not load news.";
        }
    }
}

document.addEventListener("DOMContentLoaded", loadNews);
