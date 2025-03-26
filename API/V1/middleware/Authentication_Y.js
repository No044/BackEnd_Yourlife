const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    try {
        let token = null;
        if (req.cookies && req.cookies.Token) {
            token = req.cookies.Token;
        }
        if (!token) {
            return res.json( {
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; 
        next(); 
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.json( {
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }
        if (error.name === "JsonWebTokenError") {
            return res.json( {
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }
        return res.json( {
            status: false,
            type: "Auth",
            error: 500,
            data: null
        })
    }
};
