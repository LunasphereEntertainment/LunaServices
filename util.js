const { randomBytes } = require("crypto");

module.exports = {
    genSalt: function(length){
        return randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
    }
}
