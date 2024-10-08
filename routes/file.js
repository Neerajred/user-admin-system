const express = require('express');
const multer = require('multer');
const encryptText = require('./encrypt.js');
const decryptText = require('./decrypt.js');

const router = express.Router();

// Multer setup to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Encrypt route
router.post('/encrypt', upload.single('file'), (req, res) => {
  const { secretKey } = req.body;
  const fileBuffer = req.file.buffer.toString('utf-8');

  try {
    // Encrypt the text using the secret key
    const encryptedDataHex = encryptText(fileBuffer, secretKey);

    // Respond with a text file containing the encrypted hex data
    res.setHeader('Content-Disposition', `attachment; filename=encrypted_${req.file.originalname}.txt`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(encryptedDataHex); // Send the hex string
  } catch (error) {
    console.error('Encryption failed:', error);
    res.status(500).send('File encryption failed.');
  }
});

// Decrypt route
router.post('/decrypt', upload.single('file'), (req, res) => {
  const { secretKey } = req.body;
  const encryptedHex = req.file.buffer.toString(); // Get the encrypted hex data from the text file

  try {
    // Decrypt the hex data back to the original binary file
    const decryptedData = decryptText(encryptedHex, secretKey);

    // Respond with the decrypted text
    res.setHeader('Content-Disposition', `attachment; filename=decrypted_${req.file.originalname}`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(decryptedData); // Send the decrypted text data
  } catch (error) {
    console.error('Decryption failed:', error);
    res.status(500).send('File decryption failed.');
  }
});

module.exports = router; // Use CommonJS export
