const Customer = require("../model/Customer_Y.model")
const package = require("../model/Package_Y.model")
const CTM_PK = require("../model/CTM_PK_Y.model")
const helper = require("../../../helper/helper")
const validate = require("../middleware/validate_Y")
const mongoose = require("mongoose");
module.exports.GetALL = async (req, res) => {
  try {
    if (!req.user?.permission?.includes("view_customer") && req.user.role !== "admin"){
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    const { key, status } = req.query
    const find = {
      deleted: false
    }
    if (key && key != "null") {
      const regex = new RegExp(key, "i")
      find.FullName = regex
    }
    if (status && status != "0" && status != 4 && status != "null") {
      find.Status = status
    }

    let Data = []
    if (status == 4) {
      delete find.FullName;
      find.Status = "1"
      find.totalDay = { $lte: 5 };
      Data = await Customer.find(find)
    } else {
      Data = await Customer.find(find)

    }

    const bulkOps = [];

    for (let item of Data) {
      if (item.startday != null && item.Status == "1") {
        const startDate = new Date(Number(item.startday));
        const now = new Date();
        const diffDays = (now - startDate) / (1000 * 60 * 60 * 24);
          item.totalDay = item.totalDay - diffDays
          item.startday = Date.now()
       

      }
      if (item.totalDay <= 0) {
        item.Status = "2"
        item.totalDay = 0
        item.startday = null
      }
      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              totalDay: item.totalDay,
              startday: item.startday,
              Status: item.Status,
            },
          },
        },
      });
    }
    if (bulkOps.length > 0) {
      await Customer.bulkWrite(bulkOps);
    }
    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: Data
    })

  } catch (error) {
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null

    })
  }
}

module.exports.GetDetail = async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    let Data = null
    if (req.user.permission.includes("detail_customer") == false && req.user.role != "admin") {
      Data = await Customer.findOne({ _id: id }).select("FullName Email Phone_number Description");
      if (!Data) {
        return res.json({
          status: false,
          type: "Data",
          error: 300,
          data: null
        })
      }
      return res.json({
        status: true,
        type: "Auth",
        error: null,
        data: Data
      })
    }
    Data = await Customer.findOne({ _id: id });
    if (!Data) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: Data
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }
}

module.exports.patch = async (req, res) => {
  try {
    if (req.user.permission.includes("edit_customer") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    if (!req.body.Id || !mongoose.Types.ObjectId.isValid(req.body.Id)) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const requiredFields = ["FullName", "Email", "PhoneNumBer", "Description"];
    const respondvalidate = validate.isValidRequest(req.body, requiredFields)
    if (respondvalidate == false) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const NewObject = {
      FullName: req.body.FullName,
      Email: req.body.Email,
      Phone_number: req.body.Phone_number,
      Description: req.body.Description,
      updateAt: req.user.email,
      updateBy: helper.timenow()
    }
    const respond = await Customer.updateOne({
      _id: req.body.Id
    }, { $set: NewObject })


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
      type: "Customer",
      error: null,
      data: null
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }

}

module.exports.Post = async (req, res) => {
  try {
    if (req.user.permission.includes("create_customer") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    const requiredFields = ["FullName", "Email", "PhoneNumBer", "Description","Status","Package_id"];
    const respondvalidate = validate.isValidRequest(req.body, requiredFields)
    if(respondvalidate == false){
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
   }
    if (!req.body.Package_id || !mongoose.Types.ObjectId.isValid(req.body.Package_id)) {
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
    }
    const NewObject = {
      FullName: req.body.FullName,
      Email: req.body.Email,
      Phone_number: req.body.PhoneNumBer,
      Status: req.body.Status,
      deleted: false,
      Description: req.body.Description != null ? req.body.Description : null,
      createAt: helper.timenow().toString(),
      CreateBy: req.user.email,
      updateAt: req.user.email,
      updateBy: helper.timenow()
    }

    const data = new Customer(NewObject)
    const pack = await package.findOne({
      _id: req.body.Package_id,
      deleted : false
    })
    if (!pack) {
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
    }
    data.totalDay = parseInt(data.totalDay) + parseInt(pack.Duration);
    if (data.startday == null && data.Status != "3") {
      data.startday = Date.now()
    }
    await data.save()
    const CTM_PKobject = {
      CTM_id: data._id,
      Package_id: req.body.Package_id,
      CreateAt: helper.timenow(),
      CreateBy: req.user.email,
      updateAt: null,
      updateBy: null
    }
    console.log(CTM_PKobject)
    const handle = new CTM_PK(CTM_PKobject)
    await handle.save()
    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: null
    })

  } catch (error) {
    console.log(error)
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }
}

module.exports.changeStatus = async (req, res) => {
  try {
    if (req.user.permission.includes("reserve_customer") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    const { changetype, type, arraycheck, date } = req.body
    const requiredFields = ["changetype", "type", "arraycheck"];
    const respondvalidate = validate.isValidRequest(req.body, requiredFields)
    if(respondvalidate == false){
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
   }
   let respond = null
    if (type == "All") {
      if (changetype == "active") {
        const find = {
          Status: "3",
        }
        if (date.length > 0) {
          find.date_reserve = date
        }
         respond = await Customer.updateMany(find,
          { $set: { Status: 1, date_reserve: null, startday: Date.now() } })
      } else {
         respond = await Customer.updateMany({
          Status: "1"
        }, { $set: { Status: 3, date_reserve: helper.YearNow(), startday: null } })
      }
      
    } else {
      if (changetype == "active") {
         respond = await Customer.updateMany({
          _id: { $in: arraycheck },
          Status: "3"
        }, { $set: { Status: 1, date_reserve: null, startday: Date.now() } })
      } else {
         respond = await Customer.updateMany({
          _id: { $in: arraycheck },
          Status: "1"
        }, { $set: { Status: 3, date_reserve: helper.YearNow(), startday: null } })
      }
    }
    if (respond.modifiedCount === 0) {
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
    }
    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: null
    })
  } catch (error) {
    console.log(error)
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }
}
