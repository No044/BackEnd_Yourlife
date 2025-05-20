const History = require("../model/History_Y.model")
const CTM = require("../model/Customer_Y.model")
const Service = require("../model/Service_Y.model")
const Package = require("../model/Package_Y.model")
module.exports.GetALl = async (req, res) => {
    try {
        if (req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }
        const { key } = req.params
        if (!key && key == "null") {

        }
        const Data = await History.find({
            datesearch: key
        })
        return res.json({
            status: true,
            type: "history",
            error: null,
            data: Data
        })
    } catch (error) {
        return res.json({
            status: false,
            type: "history",
            error: 500,
            data: null
        })
    }
}

module.exports.GetToTal = async (req, res) => {
    try {
        const respond = await History.find({
            type: { $in: ["Đăng Ký Gói Tập", "Dịch Vụ Khách Hàng"] }
        }).sort({ status: 1 });

        let total = {
            totalservice: 0,
            totalpackaged: 0
        }

        let totalmonth = [

        ]

        for (const item of respond) {

            if (item.type == "Dịch Vụ Khách Hàng") {
                total.totalservice += item.revenue
            }
            else {
                if (item.status == 1) {
                    total.totalpackaged += item.revenue
                }
                else {
                    total.totalpackaged -= item.revenue
                }
            }

            let month = "Tháng " + item.datesearch.split("-").slice(1, 2).join("-")
            let check = totalmonth.findIndex(itemmonth => itemmonth.type == item.type && itemmonth.year == month)

            if (check != -1) {
                item.status == 1 ? totalmonth[check].value += item.revenue : totalmonth[check].value -= item.revenue
            } else {
                totalmonth.push({ year: month, value: item.revenue, type: item.type })
            }
        }

        let data = {


        }

        data.totalmonth = totalmonth.sort((a, b) => {
            const monthA = parseInt(a.year.split(' ')[1]);
            const monthB = parseInt(b.year.split(' ')[1]);
            return monthA - monthB;
        });
        data.total = total

        console.log(data)
        return res.json({
            status: true,
            type: "history",
            error: null,
            data: data
        })

    } catch (error) {
        return res.json({
            status: false,
            type: "history",
            error: 500,
            data: null
        })
    }
}

module.exports.Getoverview = async (req, res) => {
    try {
        const { key } = req.params
        switch (key) {
            case "CTM":
                const countCTM = await CTM.countDocuments();
                return res.json({
                    status: true,
                    type: "Lấy Dữ Liệu Thành Công",
                    area: "HistoryGetoverview",
                    error: null,
                    data: countCTM
                });

            case "Service":
                const CountSV = await Service.countDocuments();
                return res.json({
                    status: true,
                    type: "Lấy Dữ Liệu Thành Công",
                    area: "HistoryGetoverview",
                    error: null,
                    data: CountSV
                });
            case "Package":
                const CountPK = await Package.countDocuments();
                return res.json({
                    status: true,
                    type: "Lấy Dữ Liệu Thành Công",
                    area: "HistoryGetoverview",
                    error: null,
                    data: CountPK
                });
            case "expired" : 
               const countday = await CTM.countDocuments({totalDay : {$lte : 5}});
               return res.json({
                status: true,
                type: "Lấy Dữ Liệu Thành Công",
                area: "HistoryGetoverview",
                error: null,
                data: countday
            });
            default:
                return res.json({
                    status: false,
                    type: "Key không hợp lệ",
                    area: "HistoryGetoverview",
                    error: "Invalid key",
                    data: null
                });
        }
    } catch (error) {
        return res.json({
            status: false,
            area: "HistoryGetoverview",
            type: "Có Lỗi Hệ Thống Vui Lòng Liên Hệ ADMIN",
            error: 500,
            data: null
        })
    }
}