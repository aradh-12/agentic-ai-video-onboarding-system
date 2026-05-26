const chatBox = document.getElementById("chat-box");
const inputField = document.getElementById("user-input");

// ==========================================
// ADD MESSAGE
// ==========================================

function addMessage(message, sender) {

    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message");

    if (sender === "user") {
        messageDiv.classList.add("user-message");
    } else {
        messageDiv.classList.add("bot-message");
    }

    messageDiv.innerText = message;

    chatBox.appendChild(messageDiv);

    // Auto scroll
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==========================================
// SHOW TYPING
// ==========================================

function showTyping() {

    const typingDiv = document.createElement("div");

    typingDiv.classList.add("message", "bot-message");

    typingDiv.id = "typing-indicator";

    typingDiv.innerText = "AI is typing...";

    chatBox.appendChild(typingDiv);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==========================================
// REMOVE TYPING
// ==========================================

function removeTyping() {

    const typingDiv = document.getElementById("typing-indicator");

    if (typingDiv) {
        typingDiv.remove();
    }
}

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

    const userMessage = inputField.value.trim();

    if (userMessage === "") {
        return;
    }

    // Show user message
    addMessage(userMessage, "user");

    // Clear input field
    inputField.value = "";

    // Show typing
    showTyping();

    try {

        // Send request to Flask backend
        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: userMessage
            })

        });

        // Convert response
        const data = await response.json();

        // Remove typing indicator
        removeTyping();

        // Show AI response
        addMessage(data.reply, "bot");

    } catch (error) {

        removeTyping();

        addMessage("Error connecting to AI server.", "bot");
    }
}

// ==========================================
// ENTER KEY SUPPORT
// ==========================================

inputField.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }
});
// ==========================================
// RESUME UPLOAD
// ==========================================

async function uploadResume() {

    const fileInput = document.getElementById("resume-upload");

    const file = fileInput.files[0];

    if (!file) {

        addMessage("Please select a PDF resume first.", "bot");

        return;
    }

    const formData = new FormData();

    formData.append("resume", file);

    addMessage("Uploading resume...", "bot");

    try {

        const response = await fetch("/upload_resume", {

            method: "POST",

            body: formData

        });

        const data = await response.json();

        addMessage(data.reply, "bot");

    } catch (error) {

        addMessage("Resume upload failed.", "bot");
    }
    if (data.reply.includes("Resume Upload is now enabled")) {

    document.getElementById("upload-btn").disabled = false;
}
}