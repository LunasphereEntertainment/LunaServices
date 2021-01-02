const { randomBytes, createHmac } = require("crypto");

module.exports = {
    genSalt: function(length){
        return randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
    },
    legacyAuth: function(pass, salt, hash) {
        let newHash = createHmac('sha512', salt).update(pass).digest('hex');

        return newHash === hash;
    }
}
