const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const router = express.Router();

// Multer setup to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Encryption function using Triple DES (3DES)
function encryptFile(buffer, secretKey) {
  const key = crypto.createHash('sha256').update(secretKey).digest('base64').substring(0, 24); // 24 bytes for 3DES
  const iv = crypto.randomBytes(8); // IV for 3DES (8 bytes)

  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  // Return IV + encrypted data, converted to hex for text file download
  return Buffer.concat([iv, encrypted]).toString('hex'); // Convert binary data to hex for text file download
}

// Decryption function using Triple DES (3DES)
function decryptFile(hexData, secretKey) {
  const encryptedBuffer = Buffer.from(hexData, 'hex'); // Convert hex string back to binary buffer
  const key = crypto.createHash('sha256').update(secretKey).digest('base64').substring(0, 24); // 24 bytes for 3DES
  const iv = encryptedBuffer.slice(0, 8); // Extract IV from the beginning
  const encryptedData = encryptedBuffer.slice(8); // The remaining part is the encrypted data

  const decipher = crypto.createDecipheriv('des-ede3-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

  return decrypted;
}

// Encrypt file and return encrypted binary data as a text file
router.post('/encrypt', upload.single('file'), (req, res) => {
  const { secretKey } = req.body;
  const fileBuffer = req.file.buffer;

  try {
    // Encrypt the file using Triple DES and convert it to hex string
    const encryptedDataHex = encryptFile(fileBuffer, secretKey);

    // Respond with a text file containing the encrypted hex data
    res.setHeader('Content-Disposition', `attachment; filename=encrypted_${req.file.originalname}.txt`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(encryptedDataHex); // Send the hex string
  } catch (error) {
    console.error('Encryption failed:', error);
    res.status(500).send('File encryption failed.');
  }
});

// Decrypt the file and return the original binary data with the correct file type
router.post('/decrypt', upload.single('file'), (req, res) => {
  const { secretKey, fileType } = req.body;
  const encryptedHex = req.file.buffer.toString(); // Get the encrypted hex data from the text file

  try {
    // Decrypt the hex data back to the original binary file
    const decryptedData = decryptFile(encryptedHex, secretKey);

    // Return the decrypted binary file with the correct MIME type
    res.setHeader('Content-Disposition', `attachment; filename=decrypted_${req.file.originalname}`);
    res.setHeader('Content-Type', fileType); // Set the correct file type (e.g., 'image/png')
    res.send(decryptedData); // Send the decrypted binary data
  } catch (error) {
    console.error('Decryption failed:', error);
    res.status(500).send('File decryption failed.');
  }
});

module.exports = router;
