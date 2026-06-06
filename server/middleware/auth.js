const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    // Get token from header
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify token
    try {
        const secret = process.env.JWT_SECRET || "default_jwt_secret_flow_app";
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
