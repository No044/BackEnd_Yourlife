const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const helper = require("../../../helper/helper")

const User = require("../model/Authen_Y.model");
const mongoose = require("mongoose");
const Role = require("../model/Role_Y.model")
const BlackList = require("../model/BlackList_Y.model")
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;



module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ Email: email, deleted: false });
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
        if (user.status == 2) {
            return res.json({
                status: false,
                type: "Login",
                error: 800,
                data: null
            })
        }
        const token = jwt.sign(
            { userId: user._id, role: user.role, email: user.Email },
            SECRET_KEY,
            { expiresIn: "1h" }
        );
        const objectBlack_list = {
            CTM_id: user._id,
            token: token
        }
        const responddeleted = await BlackList.deleteOne({
            CTM_id: user._id
        })
        const saveblacklist = new BlackList(objectBlack_list)
        await saveblacklist.save()
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
    } catch (error) {
        return res.json({
            status: false,
            type: "Login",
            error: 500,
            data: null
        })
    }

};

module.exports.adminlogout = async (req, res) => {
    try {
        if (req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Login",
                error: 100,
                data: null
            })
        }
        const { id } = req.body
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        const respond = await BlackList.updateOne({
            CTM_id: id,
            status: 1
        }, { $set: { status: 2 } })

        if (respond.modifiedCount === 0) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        return res.json({
            status: true,
            type: "Login",
            error: null,
            data: null
        })
    } catch (error) {
        console.log(error)
        return res.json({
            status: false,
            type: "Login",
            error: 500,
            data: null
        })
    }
}
module.exports.logout = (req, res) => {
    try {
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
    } catch (error) {
        return res.json({
            status: false,
            type: "Login",
            error: 500,
            data: null
        })
    }
};



module.exports.Authorizes = async (req, res) => {
    return res.json({
        status: true,
        type: "Login",
        error: null,
        data: {
            role: req.user.role,
            permission: req.user.permission
        }
    })
}


module.exports.register = async (req, res) => {
    try {
        if (req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Login",
                error: 100,
                data: null
            })
        }
        const { email, password } = req.body;
        const existingUser = await User.findOne({ Email: email, deleted: false });
        if (existingUser) {
            return res.json({
                status: false,
                type: "Login",
                error: 300,
                data: null
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            Email: email,
            password: hashedPassword,
            status: 1,
            role: "null",
            deleted: false,
            CreateAT: helper.timenow(),
            CreateBy: req.user.email,
            UpdateAT: null,
            UpdateBy: null
        });

        await newUser.save();
        return res.json({
            status: true,
            type: "Login",
            error: null,
            data: null
        })
    } catch (error) {
        return res.json({
            status: false,
            type: "Login",
            error: 500,
            data: null
        })
    }
};
module.exports.Getall = async (req, res) => {
    try {
        if (req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Login",
                error: 100,
                data: null
            })
        }
        const { key, status } = req.query
        const find = {
            deleted: false,
            role: { $ne: "67ec3773c1fd92dd7c6de7fe" }
        }
        if (key && key != "null") {
            const regex = new RegExp(key, "i")
            find.Email = regex
        }
        if (status && status != "0" && status != 4 && status != "null") {
            find.status = status
        }
        const Data = await User.find(find).select('-password').lean();
        for (const item of Data) {
            if (!item.role || !mongoose.Types.ObjectId.isValid(item.role)) {
                continue;
            }
            const datarole = await Role.findOne({
                _id: item.role,
                deleted: false,
            }).select("title")
            item.titlerole = datarole?.title;

            const datablacklist = await BlackList.findOne({
                CTM_id: item._id,
                status: 1
            })
            datablacklist ? item.online = true : item.online = false
        }
        return res.json({
            status: true,
            type: "Login",
            error: null,
            data: Data
        })
    } catch (error) {
        console.log(error)
        return res.json({
            status: false,
            type: "Login",
            error: 500,
            data: null
        })
    }
}


module.exports.patch = async (req, res) => {
    try {
        if (req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Login",
                error: 100,
                data: null
            })
        }
        const { iduser, idrole } = req.body
        if (!iduser || !mongoose.Types.ObjectId.isValid(iduser)) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        if (!idrole || !mongoose.Types.ObjectId.isValid(idrole)) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        const respond = await User.updateOne({
            _id: iduser
        }, { $set: { role: idrole } })

        if (respond.modifiedCount === 0) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        return res.json({
            status: true,
            type: "Login",
            error: null,
            data: null
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

module.exports.deleted = async (req, res) => {
    try {
        if (req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Login",
                error: 100,
                data: null
            })
        }
        const { id } = req.body
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        const respond = await User.updateOne({
            _id: id
        }, { $set: { deleted: true } })

        if (respond.modifiedCount === 0) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        return res.json({
            status: true,
            type: "Login",
            error: null,
            data: null
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



module.exports.changeStatus = async (req, res) => {
    try {
        if (req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }

        const { status, id } = req.body
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        const respond = await User.updateOne({
            _id: id,
            deleted: false
        }, { $set: { status: status } })


        if (respond.modifiedCount === 0) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        return res.json({
            status: true,
            type: "Role",
            error: null,
            data: null
        })
    } catch (error) {
        return res.json({
            status: false,
            type: "Role",
            error: 500,
            data: null
        })
    }
}

module.exports.password = async (req, res) => {
 try {
    const { oldPassword, newPassword } = req.body
    const respond = await User.findOne({
        Email: req.user.email
    })
    if (!respond) {
        return res.json({
            status: false,
            type: "Tài Khoản Không Tồn Tại",
            error: 300,
            data: null,
            Area: "AuthenPassword"

        })

    }
    const isMatch = await bcrypt.compare(oldPassword, respond.password);
    if (!isMatch) {
        return res.json({
            status: false,
            type: "Mật Khẩu Không Đúng",
            error: 300,
            data: null,
            Area: "AuthenPassword"

        })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const respondupdate = await User.updateOne({
        Email: req.user.email
    }, { $set: { password: hashedPassword } })
    return res.json({
        status: true,
        type: "Đổi Mật Khẩu Thành Công",
        error: null,
        data: null,
        Area: "AuthenPassword"
    })
 } catch (error) {
    console.log(error)
    return res.json({
        status: false,
        type: "Đã Có Lỗi Hệ Thống Vui Lòng Liện Hệ Admin",
        error: 500,
        data: null,
        Area: "AuthenPassword"
    })
 }
}