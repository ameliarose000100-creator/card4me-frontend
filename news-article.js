"use strict";

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
        month: "long",
        day: "numeric"
    });
}

function getNewsId() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    return Number.isInteger(id) && id > 0 ? id : null;
}

function formatNewsContent(content) {
    return escapeHtml(content || "No article content is available.");
}

function renderNewsArticle(article) {
    const container = document.getElementById("newsArticle");

    if (!container) return;

    const cover = article.cover_image
        ? `
            <img
                class="news-article-cover"
                src="${escapeHtml(article.cover_image)}"
                alt="${escapeHtml(article.title)}"
            >
        `
        : `
            <div class="news-article-cover-placeholder">
                CARD4ME
            </div>
        `;

    container.innerHTML = `
        ${cover}

        <div class="news-article-body">

            <div class="news-article-category">
                ${escapeHtml(article.category || "CARD4ME Updates")}
            </div>

            <h1 class="news-article-title">
                ${escapeHtml(article.title)}
            </h1>

            <div class="news-article-meta">
                <span>
                    By ${escapeHtml(article.author_name || "CARD4ME")}
                </span>

                <span>
                    ${escapeHtml(formatNewsDate(article.published_at))}
                </span>
            </div>

            ${
                article.summary
                    ? `
                        <p class="news-article-summary">
                            ${escapeHtml(article.summary)}
                        </p>
                    `
                    : ""
            }

            <div class="news-article-content">
                ${formatNewsContent(article.content)}
            </div>

        </div>
    `;
}

async function loadNewsArticle() {
    const container = document.getElementById("newsArticle");
    const newsId = getNewsId();

    if (!container) return;

    if (!newsId) {
        container.innerHTML = `
            <div class="news-article-error">
                <strong>Article not found</strong>
                The news article link is invalid.
                <a href="news.html">← Back to News</a>
            </div>
        `;
        return;
    }

    try {
        const response = await apiRequest(
            `/api/community/news/${encodeURIComponent(newsId)}`
        );

        if (!response || !response.success || !response.news) {
            throw new Error(
                response?.message || "Could not load the news article."
            );
        }

        renderNewsArticle(response.news);

        const title = response.news.title
            ? `${response.news.title} | CARD4ME`
            : "CARD4ME News";

        document.title = title;

    } catch (error) {
        console.error("News article loading error:", error);

        container.innerHTML = `
            <div class="news-article-error">
                <strong>Could not load this article</strong>
                ${escapeHtml(error.message || "Please try again later.")}
                <a href="news.html">← Back to News</a>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadNewsArticle);
