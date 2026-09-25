"use strict";

const API_BASE =
    "https://card4me-backend-1.onrender.com";

const form = document.getElementById("aiHelpForm");
const input = document.getElementById("aiHelpInput");
const sendButton = document.getElementById("aiHelpSend");
const messages = document.getElementById("aiChatMessages");

function addMessage(type, text) {
    const wrapper = document.createElement("div");

    wrapper.className =
        type === "user"
            ? "ai-message ai-message-user"
            : "ai-message ai-message-bot";

    if (type === "user") {
        wrapper.innerHTML = `
            <div class="ai-message-content">
                <span class="ai-message-name">You</span>
                <p></p>
            </div>
        `;
    } else {
        wrapper.innerHTML = `
            <div class="ai-message-avatar">✦</div>

            <div class="ai-message-content">
                <span class="ai-message-name">CARD4ME AI</span>
                <p></p>
            </div>
        `;
    }

    wrapper.querySelector("p").textContent = text;

    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
}

function setLoading(isLoading) {
    input.disabled = isLoading;
    sendButton.disabled = isLoading;

    if (isLoading) {
        sendButton.innerHTML = '<span>•••</span>';
    } else {
        sendButton.innerHTML = '<span>➤</span>';
    }
}

async function askAI(question) {
    const cleanQuestion = String(question || "").trim();

    if (!cleanQuestion) {
        return;
    }

    addMessage("user", cleanQuestion);

    setLoading(true);

    try {
        const response = await fetch(
            `${API_BASE}/api/ai/help`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: cleanQuestion
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "CARD4ME AI Help is temporarily unavailable."
            );
        }

        addMessage(
            "bot",
            data.answer ||
            "I couldn't generate an answer for that question."
        );
    } catch (error) {
        console.error("AI HELP ERROR:", error);

        addMessage(
            "bot",
            "I'm having trouble connecting right now. Please try again or contact CARD4ME Support."
        );
    } finally {
        setLoading(false);
        input.focus();
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question || sendButton.disabled) {
        return;
    }

    input.value = "";

    askAI(question);
});

document
    .querySelectorAll("[data-question]")
    .forEach(button => {
        button.addEventListener("click", () => {
            if (sendButton.disabled) {
                return;
            }

            askAI(button.dataset.question);
        });
    });
