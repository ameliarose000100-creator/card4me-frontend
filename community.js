let communityChannels = [];
let activeChannelId = null;
let activeSpace = "channel";

const channelsList =
    document.getElementById("channelsList");

const messagesElement =
    document.getElementById("messages");

const channelTitle =
    document.getElementById("channelTitle");

const channelDescription =
    document.getElementById("channelDescription");

const communityStatus =
    document.getElementById("communityStatus");

const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");

const messageSend =
    document.getElementById("messageSend");


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatMessageTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString([], {
        dateStyle: "short",
        timeStyle: "short"
    });
}


function formatNewsDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


function renderChannels() {
    if (!communityChannels.length) {
        channelsList.innerHTML = `
            <div class="community-status">
                No community spaces available.
            </div>
        `;

        return;
    }

    channelsList.innerHTML =
        communityChannels.map(channel => `
            <button
                type="button"
                class="channel-button ${
                    activeSpace === "channel" &&
                    Number(channel.id) === Number(activeChannelId)
                        ? "active"
                        : ""
                }"
                data-channel-id="${channel.id}"
            >
                <span class="channel-name">
                    💬 ${escapeHtml(channel.name)}
                </span>

                <span class="channel-description">
                    ${escapeHtml(channel.description || "")}
                </span>
            </button>
        `).join("") +
        `
            <button
                type="button"
                class="channel-button ${
                    activeSpace === "news"
                        ? "active"
                        : ""
                }"
                id="newsSpaceButton"
            >
                <span class="channel-name">
                    📰 CARD4ME News
                </span>

                <span class="channel-description">
                    Latest CARD4ME updates
                </span>
            </button>

            <button
                type="button"
                class="channel-button"
                id="whatsappChannelButton"
            >
                <span class="channel-name">
                    📢 WhatsApp Channel
                </span>

                <span class="channel-description">
                    Follow CARD4ME on WhatsApp
                </span>
            </button>

            <button
                type="button"
                class="channel-button"
                id="whatsappGroupButton"
            >
                <span class="channel-name">
                    👥 WhatsApp Group
                </span>

                <span class="channel-description">
                    Join the CARD4ME community
                </span>
            </button>
        `;

    document
        .querySelectorAll(".channel-button[data-channel-id]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const channelId =
                    Number(button.dataset.channelId);

                selectChannel(channelId);
            });
        });

    const newsButton =
        document.getElementById("newsSpaceButton");

    if (newsButton) {
        newsButton.addEventListener(
            "click",
            selectNews
        );
    }

    const whatsappChannelButton =
        document.getElementById(
            "whatsappChannelButton"
        );

    if (whatsappChannelButton) {
        whatsappChannelButton.addEventListener(
            "click",
            () => {
                window.open(
                    "https://whatsapp.com/channel/0029VbDlqJv30LKX31QtkY1V",
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        );
    }

    const whatsappGroupButton =
        document.getElementById(
            "whatsappGroupButton"
        );

    if (whatsappGroupButton) {
        whatsappGroupButton.addEventListener(
            "click",
            () => {
                window.open(
                    "https://chat.whatsapp.com/LoM90QeFrswIWMbpM2xoG0?s=cl&p=a&mlu=4&ilr=4",
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        );
    }
}


async function loadChannels() {
    try {
        const result =
            await apiRequest(
                "/api/community/channels"
            );

        if (!result.success) {
            throw new Error(
                result.message ||
                "Could not load community."
            );
        }

        communityChannels =
            Array.isArray(result.channels)
                ? result.channels
                : [];

        if (!communityChannels.length) {
            renderChannels();
            return;
        }

        activeChannelId =
            Number(communityChannels[0].id);

        activeSpace = "channel";

        renderChannels();

        await loadMessages(activeChannelId);

    } catch (error) {
        console.error(
            "Community channel error:",
            error
        );

        channelsList.innerHTML = `
            <div class="community-status">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


async function selectChannel(channelId) {
    activeSpace = "channel";

    activeChannelId =
        Number(channelId);

    renderChannels();

    await loadMessages(activeChannelId);
}


async function loadMessages(channelId) {
    const channel =
        communityChannels.find(
            item =>
                Number(item.id) === Number(channelId)
        );

    if (channel) {
        channelTitle.textContent =
            channel.name;

        channelDescription.textContent =
            channel.description || "";
    }

    messagesElement.innerHTML = `
        <div class="empty-community">
            Loading messages...
        </div>
    `;

    messageForm.style.display = "";
    messageInput.disabled = false;
    messageSend.disabled = false;

    try {
        const result =
            await apiRequest(
                `/api/community/channels/${channelId}/messages`
            );

        if (!result.success) {
            throw new Error(
                result.message ||
                "Could not load messages."
            );
        }

        renderMessages(
            Array.isArray(result.messages)
                ? result.messages
                : []
        );

    } catch (error) {
        console.error(
            "Community messages error:",
            error
        );

        messagesElement.innerHTML = `
            <div class="empty-community">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


async function selectNews() {
    activeSpace = "news";

    renderChannels();

    channelTitle.textContent =
        "📰 CARD4ME News";

    channelDescription.textContent =
        "Latest CARD4ME updates, features, services and community news.";

    messageForm.style.display = "none";

    messagesElement.innerHTML = `
        <div class="empty-community">
            Loading news...
        </div>
    `;

    try {
        const result =
            await apiRequest(
                "/api/community/news"
            );

        if (!result.success) {
            throw new Error(
                result.message ||
                "Could not load news."
            );
        }

        const articles =
            Array.isArray(result.news)
                ? result.news
                : [];

        renderNews(articles);

    } catch (error) {
        console.error(
            "Community news error:",
            error
        );

        messagesElement.innerHTML = `
            <div class="empty-community">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


function renderNews(articles) {
    if (!articles.length) {
        messagesElement.innerHTML = `
            <div class="empty-community">
                📰 No news articles have been published yet.
            </div>
        `;

        return;
    }

    messagesElement.innerHTML =
        articles.map(article => `
            <article
                class="community-news-card"
            >
                ${
                    article.cover_image
                        ? `
                            <img
                                src="${escapeHtml(article.cover_image)}"
                                alt=""
                                class="community-news-image"
                                loading="lazy"
                            >
                        `
                        : ""
                }

                <div class="community-news-content">

                    <div class="community-news-category">
                        ${escapeHtml(
                            article.category ||
                            "CARD4ME Updates"
                        )}
                    </div>

                    <h3>
                        ${escapeHtml(article.title)}
                    </h3>

                    ${
                        article.summary
                            ? `
                                <p class="community-news-summary">
                                    ${escapeHtml(article.summary)}
                                </p>
                            `
                            : ""
                    }

                    <div class="community-news-meta">
                        ${escapeHtml(
                            article.author_name ||
                            "CARD4ME"
                        )}
                        ${
                            article.published_at
                                ? ` · ${formatNewsDate(article.published_at)}`
                                : ""
                        }
                    </div>

                    <div class="community-news-body">
                        ${escapeHtml(article.content)
                            .replace(/\n/g, "<br>")}
                    </div>

                </div>
            </article>
        `).join("");
}



function renderMessages(messages) {
    if (!messages.length) {
        messagesElement.innerHTML = `
            <div class="empty-community">
                <div>
                    <strong>No messages yet.</strong>
                    <br>
                    Start the conversation.
                </div>
            </div>
        `;

        return;
    }

    messagesElement.innerHTML =
        messages.map(item => `
            <article class="message">
                <div class="message-meta">
                    <span class="message-name">
                        ${escapeHtml(item.sender_name)}
                    </span>

                    <span class="message-time">
                        ${escapeHtml(
                            formatMessageTime(item.created_at)
                        )}
                    </span>
                </div>

                <div class="message-body">
                    ${escapeHtml(item.message)}
                </div>
            </article>
        `).join("");

    messagesElement.scrollTop =
        messagesElement.scrollHeight;
}


document
    .getElementById("messageForm")
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const message =
                messageInput.value.trim();

            if (!message || !activeChannelId) {
                return;
            }

            messageSend.disabled = true;

            communityStatus.textContent =
                "Sending...";

            try {
                const result =
                    await apiRequest(
                        `/api/community/channels/${activeChannelId}/messages`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                message
                            })
                        }
                    );

                if (!result.success) {
                    throw new Error(
                        result.message ||
                        "Could not send message."
                    );
                }

                messageInput.value = "";

                communityStatus.textContent =
                    "";

                await loadMessages(
                    activeChannelId
                );

            } catch (error) {

                console.error(
                    "Community message error:",
                    error
                );

                communityStatus.textContent =
                    error.message ||
                    "Could not send message.";

            } finally {

                messageSend.disabled = false;
                messageInput.focus();

            }
        }
    );


loadChannels();
