const express = require('express');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if the user is an admin
function adminMiddleware(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  next();
}

// Get all users pending approval
router.get('/users/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ isApproved: false });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Approve a user account
router.put('/users/approve/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ msg: 'Invalid value for isApproved' });
    }

    user.isApproved = isApproved;
    await user.save();

    res.json({ msg: `User ${isApproved ? 'approved' : 'rejected'} successfully` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Reject a user account
router.delete('/users/reject/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.deleteOne();  // Use deleteOne() instead of remove()
    res.json({ msg: 'User rejected and removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/users/active', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const activeUsers = await User.find({ isApproved: true });
    res.json(activeUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
