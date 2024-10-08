const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get the token from the header
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length).trimLeft() : token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
