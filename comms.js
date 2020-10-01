const config = require("./config.json");
const knex = require("knex")(config.db);
const jwt = require("socketio-jwt");

/* TODO: WebSocket Events
    Channels
    ---
        Channel Created
        Channel Updated
        Channel Deleted
    Users
    ---
        User Connected
        User Disconnected
        User Status Changed => Online, Away, DNB, Offline?
    Messages
    ---
        Message Sent
        Message Delivered?
        Message Read
        Message Deleted
*/

module.exports = function(server) {
    const io = require("socket.io")(server);

    io.set('authorization', jwt.authorize({
        secret: config.security.secret,
        handshake: true
    }));

    io.on('connection', (socket) => {
        console.log(`RealTime Connection Made with User ID ${socket.decoded_token.userId}`);
    });



}
