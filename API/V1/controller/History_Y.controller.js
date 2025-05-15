const History = require("../model/History_Y.model")
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
                else{
                    total.totalpackaged -= item.revenue
                }
            }  

            let month = "Tháng " + item.datesearch.split("-").slice(1,2).join("-")
            let check = totalmonth.findIndex(itemmonth => itemmonth.type == item.type && itemmonth.year == month)

            if(check != -1){
                 item.status == 1 ? totalmonth[check].value += item.revenue : totalmonth[check].value -= item.revenue
            }else{
                totalmonth.push({year : month , value : item.revenue , type : item.type})
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