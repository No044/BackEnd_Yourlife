const jwt = require("jsonwebtoken");
require("dotenv").config();
const Role = require("../model/Role_Y.model");
const BlackList = require("../model/BlackList_Y.model")
const SECRET_KEY = process.env.JWT_SECRET;

module.exports = async(req, res, next) => {
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
        const check = await BlackList.findOne({
            token : token,
            status : 2
        })
        if(check){
            return res.json( {
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        const role = await Role.findOne({
           deleted : false,
           status : 1,
           _id : decoded.role
        })
        decoded.role = role?.role || "null";
        decoded.permission = role?.permissions || [];
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
