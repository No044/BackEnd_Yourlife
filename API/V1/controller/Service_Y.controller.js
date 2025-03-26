const service = require("../model/Service_Y.model")
const mongoose = require("mongoose");
const CTM_SV = require("../model/CTM_SV_Y.model")
const helper = require("../../../helper/helper")
const validate = require("../middleware/validate_Y")
module.exports.GetAll = async (req, res) => {
  try {
    const { key, status } = req.query
    const find = {
      deleted: false
    }
    if (key && key != "null") {
      const regex = new RegExp(key, "i")
      find.Name = regex
    }
    if (status && !isNaN(status) && status !== "0") {
      find.status = parseInt(status);
    }
    if (req.user.permission.includes("view_service") == false && req.user.role != "admin") {
      find.status = 1
      delete find.Name;
    }
    const Data = await service.find(find)
    return res.json({
      status: true,
      type: "service",
      error: null,
      data: Data
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "service",
      error: 500,
      data: null
    })
  }
}

module.exports.Post = async (req, res) => {
  try {
    if (req.user.permission.includes("create_service") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }   
   const requiredFields = ["Name", "Price", "Quatity"];
    const respondvalidate = validate.isValidRequest(req.body,requiredFields)
    if(respondvalidate == false){
     return res.json( {
       status: false,
       type: "Data",
       error: 300,
       data: null
   })
  }
    const newobject = {
      Name: req.body.Name,
      Price: req.body.Price,
      Quatity: req.body.Quatity,
      createAt: helper.timenow(),
      deleted: false,
      status: 1,
      CreateBy: req.user.email,
      updateAt: null,
      updateBy: null
    }
    const newdata = new service(newobject)
    await newdata.save()
    return res.json({
      status: true,
      type: "service",
      error: null,
      data: null
    })
  } catch (error) {
    console.log(error)
    return res.json({
      status: false,
      type: "service",
      error: 500,
      data: null
    })
  }
}


module.exports.patch = async(req,res) => {
  try {

    if(req.user.permission.includes("edit_service") == false && req.user.role != "admin"){
      return res.json( {
        status: false,
        type: "Auth",
        error: 100,
        data: null
    })
    }
    if (!req.body.id || !mongoose.Types.ObjectId.isValid(req.body.id)) {

      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
    }
     const requiredFields = ["Name", "Price", "Quatity", "id"];
     const respondvalidate = validate.isValidRequest(req.body,requiredFields)
     if(respondvalidate == false){
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
     }
    const existingService = await service.findById(req.body.id);
    const check = await CTM_SV.findOne({
      Service_id : req.body.id,
      deleted : false
    })

    if (!existingService) {

      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    }) 
    }
    if(check && (existingService.Price != req.body.Price)){
      return res.json({
        status: false,
        type: "Data",
        error: 700,
        data: null
      })
    }
    if (existingService.sold > req.body.Quatity) {
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
    }

      const NewObject = {
        Name: req.body.Name,
        Quatity: req.body.Quatity,
        Price: req.body.Price,
        updateAt: req.user.email,
        updateBy: helper.timenow()
      }
      const respond = await service.updateOne({
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
        type: "service",
        error: null,
        data: null
      })
    } catch (error) {
      return res.json({
        status: false,
        type: "service",
        error: 500,
        data: null
      })
    }
  
}



module.exports.Getdetail = async(req,res) => {
  try {
    const {id} = req.params
    const find = {
          _id : id
    }
    if (req.user.permission.includes("view_service") == false && req.user.role != "admin") {
      find.status = 1
    }
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
    } 
    const Data = await service.findOne(find);
    if (!Data) {
      return res.json( {
        status: false,
        type: "Data",
        error: 300,
        data: null
    })
    }
  return res.json({
      status : true,
      type : "service",
      error : null,
      data : Data
  })
  } catch (error) {
    console.log(error)
      return res.json({
          status : false,
          type : "service",
          error : 500,
          data : null
      })
  }
}


module.exports.changeStatus = async (req, res) => {
  try {
    if (req.user.permission.includes("reserve_service") == false && req.user.role != "admin") {
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
    const respond = await service.updateOne({
      _id: id
    }, { $set: { status: status } })


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