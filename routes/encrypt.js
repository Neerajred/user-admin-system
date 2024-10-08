const crypto = require('crypto');

// Encryption function
function encryptText(text, secretKey) {
  const key = crypto.createHash('sha256').update(secretKey).digest('base64').substring(0, 24); // 24 bytes for 3DES
  const iv = crypto.randomBytes(8); // IV for 3DES (8 bytes)

  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV + encrypted data, converted to hex for text file download
  return Buffer.concat([iv, Buffer.from(encrypted, 'hex')]).toString('hex'); // Convert binary data to hex for text file download
}

module.exports = encryptText;
