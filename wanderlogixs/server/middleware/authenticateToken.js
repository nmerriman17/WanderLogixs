const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (token == null) {
        return res.sendStatus(401); // No token, unauthorized
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Token is no longer valid
        }

        req.user = user; // Add the user payload to the request object
        next(); // Move to the next middleware or route handler
    });
}

module.exports = authenticateToken;
