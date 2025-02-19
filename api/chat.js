const { Server } = require("socket.io");

module.exports = (req, res) => {
    if (!res.socket.server.io) {
        console.log("Setting up Socket.io server...");
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on("connection", (socket) => {
            console.log("Ny bruker tilkoblet");

            socket.on("chatMessage", (msg) => {
                console.log("Mottatt melding på server:", msg); // Feilsøkingsmelding
                io.emit("chatMessage", msg);
            });

            socket.on("disconnect", () => {
                console.log("Bruker frakoblet");
            });
        });
    }
    res.end();
};