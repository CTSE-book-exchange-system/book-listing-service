const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

const authenticateInternal = (req, res, next) => {
    const key = req.headers['x-internal-key'];

    if (!key || key !== process.env.INTERNAL_API_KEY) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    next();
};

module.exports = { authenticate, authenticateInternal };