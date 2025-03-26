const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/Authen_Y.model");
const helper = require("../../../helper/helper")
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

module.exports.register = async (req, res) => {

    const { email, password } = req.body;
    const existingUser = await User.findOne({ Email: email });
    if (existingUser) {
        return res.json({
            status: false,
            type: "Login",
            error: 200,
            data: null
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        Email: email,
        password: hashedPassword,
        permission: [],
        status: '1',
        role: "user",
        deleted: false,
        CreateAT: helper.timenow(),
        CreateBy: "string",
        UpdateAT: "String",
        UpdateBy: "String"
    });

    await newUser.save();
    return res.json({
        status: true,
        type: "Login",
        error: null,
        data: null
    })

};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ Email: email });
    if (!user) {
        return res.json({
            status: false,
            type: "Login",
            error: 200,
            data: null
        })

    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.json({
            status: false,
            type: "Login",
            error: 200,
            data: null
        })
    }
    const token = jwt.sign(
        { userId: user._id, role: user.role, email: user.Email, permission: user.permission },
        SECRET_KEY,
        { expiresIn: "1h" }
    );
    res.cookie("Token", token, {
        httpOnly: true,
        secure: true, 
        sameSite: "lax",
        maxAge: 150 * 60 * 1000
    });
    return res.json({
        status: true,
        type: "Login",
        error: null,   
        data: []
    })

};
module.exports.logout = (req, res) => {
    res.cookie("Token", "", { 
        httpOnly: true,
        secure: true, 
        sameSite: "lax",
        expires: new Date(0) 
    });
    return res.json({
        status: true,
        type: "Login",
        error: null,
        data: []
    });
};
module.exports.Authorizes = async (req, res) => {
    return res.json({
        status: true,
        type: "Login",
        error: null,
        data: {
            role : req.user.role,
            permission : req.user.permission
        }
    })
}

module.exports.createrpremission = async (req, res) => {
    try {   
        if (req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Login",
                error: 100,
                data: null
            })
        }
        const respond = await User.updateOne({
            _id: req.body.id
        }, { $set: {permission : req.body.array} })
        return res.json({
            status: true,
            type: "Login",
            error: null,
            data: []
        })
    } catch (error) {
        return res.json({
            status: false,
            type: "Login",
            error: 500,
            data: null
        })
    }
}


module.exports.Getall = async (req, res) => {
    try {
        const Data = await User.find({
            role: "user"
        })
        return res.json({
            status: true,
            type: "Login",
            error: null,
            data: Data
        })
    } catch (error) {
        return res.json({
            status: false,
            type: "Login",
            error: 500,
            data: Data
        })
    }
}
