let communityChannels = [];
let activeChannelId = null;

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
                    Number(channel.id) === Number(activeChannelId)
                        ? "active"
                        : ""
                }"
                data-channel-id="${channel.id}"
            >
                <span class="channel-name">
                    ${escapeHtml(channel.name)}
                </span>

                <span class="channel-description">
                    ${escapeHtml(channel.description || "")}
                </span>
            </button>
        `).join("");

    document
        .querySelectorAll(".channel-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                const channelId =
                    Number(button.dataset.channelId);

                selectChannel(channelId);
            });
        });
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


messageForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const message =
            messageInput.value.trim();

        if (!activeChannelId || !message) {
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
                "Message sent.";

            await loadMessages(
                activeChannelId
            );

            setTimeout(() => {
                communityStatus.textContent = "";
            }, 2000);

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


document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadChannels();
    }
);
