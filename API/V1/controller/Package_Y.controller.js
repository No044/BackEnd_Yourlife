const Package = require("../model/Package_Y.model")
const mongoose = require("mongoose");
const CTM_Package = require("../model/CTM_PK_Y.model")
const helper = require("../../../helper/helper")
const validate = require("../middleware/validate_Y");

module.exports.GetALL = async (req, res) => {
  try {
    const { key, status } = req.query
    const find = {
      deleted: false
    }
    if (key && key != "null") {
      const regex = new RegExp(key, "i")
      find.Name = regex
    }
    if (status && status != "0" && status != "null") {
      find.status = status.toString()
    }
    if (req.user.permission.includes("view_package") == false && req.user.role != "admin") {
      find.status = 1
      delete find.Name;
    }
    const Data = await Package.find(find)
    return res.json({
      status: true,
      type: "Package",
      error: null,
      data: Data
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Package",
      error: 500,
      data: null
    })
  }
}


module.exports.Post = async (req, res) => {
  try {
    if (req.user.permission.includes("create_package") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    const requiredFields = ["Name", "Price", "Duration"];
    const respondvalidate = validate.isValidRequest(req.body, requiredFields)
    if (respondvalidate == false) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const newobject = {
      Name: req.body.Name,
      Price: req.body.Price,
      Duration: req.body.Duration,
      createAt: helper.timenow(),
      deleted: false,
      status: 1,
      CreateBy: req.user.email,
      updateAt: null,
      updateBy: null
    }
    const newdata = new Package(newobject)
    await newdata.save()
    return res.json({
      status: true,
      type: "Package",
      error: null,
      data: null
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Package",
      error: 500,
      data: null
    })
  }
}

module.exports.changeStatus = async (req, res) => {
  try {
    if (req.user.permission.includes("reserve_package") == false && req.user.role != "admin") {
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
    const respond = await Package.updateOne({
      _id: id
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
      type: "Package",
      error: null,
      data: null
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Package",
      error: 500,
      data: null
    })
  }
}

module.exports.Getdetail = async (req, res) => {
  try {

    const { id } = req.params
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
          return res.json( {
            status: false,
            type: "Data",
            error: 300,
            data: null
        })
        }
    const Data = await Package.findOne({
      _id: id
    })
    if (!Data) {
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
    }
    return res.json({
      status: true,
      type: "Package",
      error: null,
      data: Data
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Package",
      error: 500,
      data: null
    })
  }
}

module.exports.patch = async (req, res) => {
  try {
    if (req.user.permission.includes("edit_package") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    if (!req.body.id || !mongoose.Types.ObjectId.isValid(req.body.id)) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const requiredFields = ["Name", "Price", "Duration"];
    const respondvalidate = validate.isValidRequest(req.body, requiredFields)
    if (respondvalidate == false) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const check = await CTM_Package.findOne({
      Package_id : req.body.id,
      deleted : false
    })
    const Datapackage = await Package.findOne({
      _id : req.body.id
    })
    if(!Datapackage){
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    if(check && (Datapackage.Price != req.body.Price || Datapackage.Duration != req.body.Duration)){
      return res.json({
        status: false,
        type: "Data",
        error: 700,
        data: null
      })
    }
   
    const NewObject = {
      Name: req.body.Name,
      Duration: req.body.Duration,
      Price: req.body.Price,
      updateAt: req.user.email,
      updateBy: helper.timenow()
    }
    const respond = await Package.updateOne({
      _id: req.body.id
    }, { $set: NewObject })
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
      type: "package",
      error: null,
      data: null
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "package",
      error: 500,
      data: null
    })
  }

}