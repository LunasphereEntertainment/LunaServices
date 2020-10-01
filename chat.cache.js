const _USER_STATUS = {};
const _CHANNELS = {};
const _MESSAGE_STATUS = {};

class Cache {
    _USER_STATUS = {}; // MAP<SocketID, UserID>
    _USER_SOCKET = {}; // MAP<UserId, User>
    _CHANNELS = {};
    _MESSAGE_STATUS = {};

    Users = {
        connected: (socketId, userId) => {
            this._USER_STATUS[socketId] = userId;
        },
        disconnected: (socketId) => {
            delete this._USER_STATUS[socketId];
        },
        added: (user) => {
            let socketId = this._USER_SOCKET[user.userId];

        },
        deleted: (user) => {

        },

    };
}

module.exports = new Cache();

