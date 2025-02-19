// chat.js - Håndterer chat-funksjonaliteten

const socket = io(); // Initialiserer WebSocket-tilkoblingen

const chatContainer = document.getElementById("chat-container");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSendButton = document.getElementById("chat-send");
const chatToggleButton = document.getElementById("chat-toggle");
const chatNotification = document.getElementById("chat-notification");

let unreadMessages = 0;

// Toggle chat-vinduet
chatToggleButton.addEventListener("click", () => {
    chatContainer.classList.toggle("hidden");
    if (!chatContainer.classList.contains("hidden")) {
        unreadMessages = 0;
        chatNotification.textContent = "";
    }
});

// Send melding
chatSendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const message = chatInput.value.trim();
    if (message === "") return;
    
    console.log("Sender melding:", message); // Feilsøkingsmelding
    socket.emit('chatMessage', message); // Send melding til server via WebSocket
    displayMessage("Du", message);
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Mottak av melding fra server
socket.on('chatMessage', (msg) => {
    console.log("Mottatt melding:", msg); // Feilsøkingsmelding
    receiveMessage("Annen bruker", msg);
});

function receiveMessage(user, message) {
    displayMessage(user, message);
    if (chatContainer.classList.contains("hidden")) {
        unreadMessages++;
        chatNotification.textContent = unreadMessages;
    }
}

// Viser melding i chatten
function displayMessage(user, message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.innerHTML = `<strong>${user}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
}
