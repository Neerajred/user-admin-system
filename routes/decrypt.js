const crypto = require('crypto');

// Decryption function
function decryptText(hexData, secretKey) {
  const encryptedBuffer = Buffer.from(hexData, 'hex'); // Convert hex string back to binary buffer
  const key = crypto.createHash('sha256').update(secretKey).digest('base64').substring(0, 24); // 24 bytes for 3DES
  const iv = encryptedBuffer.slice(0, 8); // Extract IV from the beginning
  const encryptedData = encryptedBuffer.slice(8); // The remaining part is the encrypted data

  const decipher = crypto.createDecipheriv('des-ede3-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'binary', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = decryptText; // Use CommonJS export
