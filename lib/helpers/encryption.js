var crypto = require('crypto');
var algorithm = 'aes-256-ctr';

function encryptText(text,password){
    var cipher = crypto.createCipher(algorithm,password);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decryptText(text,password){
    var decipher = crypto.createDecipher(algorithm,password);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}



function encryptBuffer(buffer, password){
    var cipher = crypto.createCipher(algorithm,password);
    var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
    return crypted;
}

function decryptBuffer(buffer, password){
    var decipher = crypto.createDecipher(algorithm,password);
    var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
    return dec;
}


module.exports = {
    encryptText:encryptText,
    decryptText:decryptText,
    encryptBuffer:encryptBuffer,
    decryptBuffer:decryptBuffer
};