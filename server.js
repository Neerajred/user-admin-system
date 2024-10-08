const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const fileRoutes = require('./routes/file'); 
const cors = require('cors');
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors())

app.use('/api/file', fileRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
