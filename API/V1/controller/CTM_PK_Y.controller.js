const CTM_PK = require("../model/CTM_PK_Y.model")
const CTM = require("../model/Customer_Y.model")
const custormer = require("../model/Customer_Y.model")
const package = require("../model/Package_Y.model")
const History = require("../model/History_Y.model")
const helper = require("../../../helper/helper")
const mongoose = require("mongoose");

module.exports.GetALL = async (req, res) => {
    try {
        if (req.user.permission.includes("detail_pkctm") == false && req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }
        const { id, type, key, status } = req.query
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: false,
                type: "Data",
                error: 3001,
                data: null
            })
        }
        let Data = null
        const find = {
        }
        if (status && status != "0" && status != "null") {
            find.status = status
        }
        if (type == "pkctm") {
            find.Package_id = id
            if (key && key != "null") {
                const regex = new RegExp(key, "i")
                const id = await CTM.find({
                    FullName: regex
                }).select("id")
                find.CTM_id = id
            }
            Data = await CTM_PK.find(find)
                .populate("CTM_id")
                .populate("Package_id")
                .lean();
        } else if (type == "ctmpk") {
            console.log("dã chạy vào đây")
            find.CTM_id = id
            if (key && key != "null") {
                const regex = new RegExp(key, "i")
                const id = await package.find({
                    Name: regex
                }).select("id")
                find.Package_id = id
            }
            Data = await CTM_PK.find(find)
                .populate("CTM_id")
                .populate("Package_id")
                .lean();
            console.log(Data)
        }
        else {
            return res.json({
                status: false,
                type: "Data",
                error: 3002,
                data: null
            })
        }
        let revenue = {
            pay: 0,
            unpay: 0,
            remove: 0,
            totalpay: 0,
            totalunpay: 0,
            total: 0
        }

        for (let item of Data) {
            switch (item.status) {
                case 1:
                    revenue.pay += 1
                    revenue.totalpay += item.Package_id.Price
                    break;

                default:
                    revenue.remove += 1

            }
        }
        return res.json({
            status: true,
            type: "CTM_PK",
            error: null,
            data: Data,
            revenue: revenue
        })
    } catch (error) {
        console.log(error)
        return res.json({
            status: false,
            type: "CTM_PK",
            error: 500,
            data: null,
        })
    }
}
module.exports.Post = async (req, res) => {
    try {
        if (req.user.permission.includes("create_pkctm") == false && req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }

        const { id_pack, id_user } = req.body
        if (!id_pack || !mongoose.Types.ObjectId.isValid(id_pack)) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        if (!id_user || !mongoose.Types.ObjectId.isValid(id_user)) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }


        const newobject = {
            CTM_id: id_user,
            Package_id: id_pack,
            status: 1,
            CreateAt: helper.timenow(),
            CreateBy: req.user.email,
            updateAt: null,
            updateBy: null
        }

        const user = await custormer.findOne({
            _id: id_user,
            deleted: false
        })
        if (!user) {
            return res.json({
                status: false,
                type: "CTM_PK",
                error: 300,
                data: null
            })
        }
        const pack = await package.findOne({
            _id: id_pack,
            status: 1,
            deleted: false
        })
        if (!pack) {
            return res.json({
                status: false,
                type: "CTM_PK",
                error: 300,
                data: null
            })
        }


        user.totalDay = user.totalDay + parseInt(pack.Duration)
        if (user.startday == null && user.Status != "3") {
            user.startday = Date.now()
            user.Status = 1
        }
        await user.save()

        const handle = new CTM_PK(newobject)
        await handle.save()
        const content = `
    <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
    <tbody>
        <tr>
            <td align="center" valign="top">
                <div></div>
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border:1px solid #dedede;border-radius:3px">
                    <tbody>
                        <tr>
                            <td align="center" valign="top">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #30C2EC; object-fit:cover;background-position:center;color:#ffffff;border-bottom:0;font-weight:bold;line-height:100%;vertical-align:middle;font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;border-radius:3px 3px 0 0">
                                    <tbody>
                                        <tr>
                                            <td style="padding:36px 48px;display:block">
                                                <h1 style="font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;font-size:30px;font-weight:300;line-height:150%;margin:0;text-align:left;color:#ffffff;background-color:inherit">YourLifeFitness</h1>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" valign="top">
                                <table border="0" cellpadding="0" cellspacing="0" width="600">
                                    <tbody>
                                        <tr>
                                            <td valign="top" style="background-color:#ffffff">
                                                <table border="0" cellpadding="20" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td valign="top" style="padding:48px 48px 32px">
                                                                <div style="color:#636363;font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;font-size:14px;line-height:150%;text-align:left">
                                                                    <p style="margin:0 0 16px">Bạn có hóa đơn mới , chi tiết bên dưới:</p>
                                                                    <h3 style="color:#30C2EC;display:block;font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;font-size:18px;font-weight:bold;line-height:130%;margin:0 0 18px;text-align:left">
                                                                       Thời Gian : ${helper.timenow()}
                                                                    </h3>
                                                                    <div style="margin-bottom:40px">
                                                                        <table cellspacing="0" cellpadding="6" border="1" style="color:#636363;border:1px solid #e5e5e5;vertical-align:middle;width:100%;font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif">
                                                                      
                                                                            <tbody>
           
                                                               
                                                                                 <tr>
                                                                                    <th scope="row" colspan="2" style="color:#636363;border:1px solid #e5e5e5;vertical-align:middle;padding:12px;text-align:left">Tên Gói Tập :</th>
                                                                                    <td style="color:#636363;border:1px solid #e5e5e5;vertical-align:middle;padding:12px;text-align:left"><span> ${pack.Name} </span> <small></small></td>
                                                                                </tr>
                                                                                 <tr>
                                                                                    <th scope="row" colspan="2" style="color:#636363;border:1px solid #e5e5e5;vertical-align:middle;padding:12px;text-align:left">Giá Gói Tập:</th>
                                                                                    <td style="color:#636363;border:1px solid #e5e5e5;vertical-align:middle;padding:12px;text-align:left"><span> ${(pack.Price).toLocaleString("vi-VN") + " VNĐ"} </span> <small></small></td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <th scope="row" colspan="2" style="color:#636363;border:1px solid #e5e5e5;vertical-align:middle;padding:12px;text-align:left">Số Buổi :</th>
                                                                                    <td style="color:#636363;border:1px solid #e5e5e5;vertical-align:middle;padding:12px;text-align:left"><span> ${pack.Duration + 1} <span>Buổi</span></span> <small></small></td>
                                                                                </tr>
                                                                          
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    <table cellspacing="0" cellpadding="0" border="0" style="width:100%;vertical-align:top;margin-bottom:40px;padding:0">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td valign="top" width="50%" style="text-align:left;font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;border:0;padding:0">
                                                                                    <h2 style="color:#30C2EC;display:block;font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;font-size:18px;font-weight:bold;line-height:130%;margin:0 0 18px;text-align:left">Thông tin nhân viên</h2>
                                                                                    <address style="padding:12px;color:#636363;border:1px solid #e5e5e5">${req.user.email}</address>
                                                                                </td>
                                                                                <td valign="top" width="50%" style="text-align:left;font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;padding:0">
                                                                                    <h2 style="color:#30C2EC;display:block;font-family:'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif;font-size:18px;font-weight:bold;line-height:130%;margin:0 0 18px;text-align:left">Thông tin người nhận</h2>
                                                                                    <address style="padding:12px;color:#636363;border:1px solid #e5e5e5">${user.FullName}</address>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>
    `;
        helper.SendMail(user.Email, "Hóa Đơn", content)


        const history = new History(
            {
                authen_id: req.user.userId,
                id_type: handle._id,
                action: "Thêm Gói Tập",
                type: "Đăng Ký Gói Tập",
                detailtype: {
                    field_1: pack.Name,
                    field_2: user.FullName
                },
                revenue: pack.Price,
                datesearch: helper.YearNow(),
                createAt: helper.timenow(),
                CreateBy: req.user.email,
            }
        )
        await history.save()


        return res.json({
            status: true,
            type: "CTM_PK",
            error: null,
            data: null
        })
    } catch (error) {
        return res.json({
            status: false,
            type: "CTM_PK",
            error: 500,
            data: null
        })
    }
}


module.exports.changestatus = async (req, res) => {
    try {
        if (req.user.permission.includes("edit_pkctm") == false && req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Auth",
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

        const Data = await CTM_PK.findOne({ _id: id, deleted: false , status : 1})
            .populate("CTM_id")
            .populate("Package_id")

        if (!Data) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }

        const Responduser = await CTM.updateOne({
            _id: Data.CTM_id._id,
            deleted: false
        }, { $inc: { totalDay: -Data.Package_id.Duration } })

        const Respond = await CTM_PK.updateOne(
            { _id: id, deleted: false },
            {
                $set: {
                    status: 2,
                    updateBy: req.user.email,
                    updateAt: helper.timenow(),
                    deleted: true
                }
            }
        );


        if (Respond.modifiedCount === 0 || Responduser === 0) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }


        const history = new History(
            {
                authen_id: req.user.userId,
                id_type: Data._id,
                action: "Hủy Gói Tập",
                type: "Đăng Ký Gói Tập",
                detailtype: {
                    field_1: Data.Package_id.Name,
                    field_2: Data.CTM_id.FullName
                },
                status : 2,
                revenue: Data.Package_id.Price,
                datesearch: helper.YearNow(),
                createAt: helper.timenow(),
                CreateBy: req.user.email,
            }
        )
        await history.save()
        return res.json({
            status: true,
            type: "CTM_SV",
            error: null,
            data: null
        })

    } catch (error) {
        return res.json({
            status: false,
            type: "CTM_SV",
            error: 500,
            data: null
        })
    }
}