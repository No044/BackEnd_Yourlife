const rateLimit = require("express-rate-limit");

const loginLimit = () => {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50, 
        keyGenerator: (req) => `${req.ip}-${req.headers["user-agent"]}`,
        message: {
            status: false,
            type: "RateLimit",
            error: 400,
            data: "Too many login attempts, please try again later",
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

module.exports = loginLimit;
