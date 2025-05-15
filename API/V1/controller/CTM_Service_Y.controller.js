const CTM_SV = require("../model/CTM_SV_Y.model")
const Service = require("../model/Service_Y.model")
const CTM = require("../model/Customer_Y.model")
const mongoose = require("mongoose");
const History = require("../model/History_Y.model")
const helper = require("../../../helper/helper")
module.exports.GetALL = async (req, res) => {
    try {
        if (req.user.permission.includes("detail_svctm") == false && req.user.role != "admin") {
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
                error: 300,
                data: null
            })
        }
        let Data = null
        const find = {
            
        }
        if (status && status != "0" && status != "null") {
            find.status = status
        }
        if (type == "svctm") {
            find.Service_id = id
            if (key && key != "null") {
                const regex = new RegExp(key, "i")
                const id = await CTM.find({
                    FullName: regex
                }).select("id")
                find.CTM_id = id
            }
            Data = await CTM_SV.find(find)
                .populate("CTM_id")
                .populate("Service_id")
                .lean();
        }else if(type == "ctmsv"){
            find.CTM_id = id
            if (key && key != "null") {
                const regex = new RegExp(key, "i")
                const id = await Service.find({
                    Name: regex
                }).select("id")
                find.Service_id = id
            }
            Data = await CTM_SV.find(find)
                .populate("CTM_id")
                .populate("Service_id")
                .lean();
        }
        else{
            return res.json({
                status: false,
                type: "Data",
                error: 300,
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
                    revenue.totalpay += item.Service_id.Price
                    break;
                case 2:
                    revenue.unpay += 1
                    revenue.totalunpay += item.Service_id.Price
                    break;

                default:
                    revenue.remove += 1
                    
            }
            revenue.total += item.Service_id.Price
        }
        return res.json({
            status: true,
            type: "CTM_SV",
            error: null,
            data: Data,
            revenue : revenue
        })
    } catch (error) {
        return res.json({
            status: false,
            type: "CTM_SV",
            error: 500,
            data: null,
        })
    }
}
module.exports.Post = async (req, res) => {
    try {
        const { id_ser, id_user, status } = req.body
        if (req.user.permission.includes("create_svctm") == false && req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }
        if (!id_ser || !mongoose.Types.ObjectId.isValid(id_ser)) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }

        const newobject = {
            CTM_id: id_user,
            Service_id: id_ser,
            CreateAt: helper.timenow(),
            status: status,
            CreateBy: req.user.email,
            updateAt: null,
            updateBy: null
        }

        if (status == 1) {
            newobject.updateAt = helper.timenow()
            newobject.updateBy = req.user.email
        }

        const service = await Service.findOne({
            _id: id_ser,
            deleted: false,
            status : 1
        })

        if (!service) {
            return res.json({
                status: false,
                type: "CTM_SV",
                error: 300,
                data: null
            })
        }

        const custormer = await CTM.findOne({
            _id : id_user,
            deleted : false,

        })
        
        if(!custormer){
            return res.json({
                status: false,
                type: "CTM_SV",
                error: 300,
                data: null
            })
        }
       
        if (service.Quatity - service.sold <= 0) {
            service.status = 2
            await service.save()
            return res.json({
                status: false,
                type: "CTM_SV",
                error: 300,
                data: null
            })
        }

        service.sold = service.sold + 1
        if (service.Quatity - service.sold == 0) {
            service.status = 2
        }
        await service.save()
        
        const handle = new CTM_SV(newobject)
        await handle.save()

        const history = new History(
            {
              authen_id: req.user.userId,
              id_type: id_ser,
              action: "Thêm Dịch Vụ",
              type: "Dịch Vụ Khách Hàng",
              detailtype: {
               field_1 : service.Name,
               field_2 : custormer.FullName
              },
              revenue: status == 1 ? service.Price : 0,
              datesearch : helper.YearNow(),
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
        console.log(error)
        return res.json({
            status: false,
            type: "CTM_SV",
            error: 500,
            data: null
        })
    }
}


module.exports.changestatus = async (req, res) => {
    try {

        if (req.user.permission.includes("edit_svctm") == false && req.user.role != "admin") {
            return res.json({
                status: false,
                type: "Auth",
                error: 100,
                data: null
            })
        }

        const { array_id, type } = req.body

        if(type != "pay" &&  type != "unpay"){
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }


        const { id } = req.params
        const allValid = array_id.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }
        
        const Respond = await CTM_SV.updateMany(
            { _id: { $in: array_id }, status : 2},
            { 
                $set: { 
                    status: type == "pay" ? 1 : 3, 
                    updateBy: req.user.email, 
                    updateAt: helper.timenow(),
                    deleted: type == "pay" ? false : true 
                } 
            }
        );
        
        if (Respond.modifiedCount === 0) {
            return res.json({
                status: false,
                type: "Data",
                error: 300,
                data: null
            })
        }

        const Data_CTMSV = await CTM_SV.find({ _id: { $in: array_id } }).populate("CTM_id")
        .populate("Service_id")
        console.log(Data_CTMSV)
        for(const item of Data_CTMSV){
            const history = new History(
                {
                  authen_id: req.user.userId,
                  id_type: array_id.join(","),
                  type: "Dịch Vụ Khách Hàng",
                  action: "Thanh Toán Dịch Vụ",
                  detailtype: {
                    field_1: item.CreateAt,
                    field_2: item.CTM_id.FullName,
                    field_3 : item.Service_id.Name,
                    field_4 : type == "pay" ? "Đã Thanh Toán" : "Đã Hủy"
                },
                revenue: type == "pay" ? item.Service_id.Price : 0,
                  datesearch : helper.YearNow(),
                  createAt: helper.timenow(),
                  CreateBy: req.user.email,
                }
              )
              await history.save()
        }

        if (type == "unpay") {
            const decrementValue = -array_id.length
            const Respond = await Service.updateOne(
                { _id: id },
                { $inc: { sold: decrementValue } }
            )
        }

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