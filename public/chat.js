const socket = io();

document.getElementById('chat-send').addEventListener('click', () => {
    const message = document.getElementById('chat-input').value;
    socket.emit('chatMessage', message);
    document.getElementById('chat-input').value = '';
});

socket.on('chatMessage', (msg) => {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = msg;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});