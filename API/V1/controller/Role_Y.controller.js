const role = require("../model/Role_Y.model")
const auth = require("../model/Authen_Y.model")
const mongoose = require("mongoose");


const helper = require("../../../helper/helper")
const validate = require("../middleware/validate_Y");
const Role = require("../model/Role_Y.model");

module.exports.GetALL = async (req, res) => {
  try {
    if (req.user.role != "admin") {
        return res.json({
            status: false,
            type: "Auth",
            error: 100,
            data: null
          })
      }
    const { key, status } = req.query
    const find = {
      deleted : false,
      _id: { $ne: "67ec3773c1fd92dd7c6de7fe" }
    }
    if (key && key != "null") {
      const regex = new RegExp(key, "i")
      find.title = regex
    }
    if (status && status != "0" && status != "null") {
      find.status = status.toString()
    }
    const Data = await Role.find(find)
    return res.json({
      status: true,
      type: "Role",
      error: null,
      data: Data
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


module.exports.Post = async (req, res) => {
  try {
    if (req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    const requiredFields = ["title", "role","description"];
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
      title: req.body.title,
      role: req.body.role,
      description: req.body.description,
      createAt: helper.timenow(),
      deleted : false,
      status: 1,
    }
    const newdata = new Role(newobject)
    await newdata.save()
    return res.json({
      status: true,
      type: "Role",
      error: null,
      data: null
    })
  } catch (error) {
    if(error.name == "MongoServerError"){
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    return res.json({
      status: false,
      type: "Role",
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
    const respond = await Role.updateOne({
      _id: id,
      deleted : false
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


module.exports.patch = async (req, res) => {
  try {
    if (req.user.role != "admin") {
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
    const requiredFields = ["title", "role", "description"];
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
      Name: req.body.title,
      Duration: req.body.role,
      Price: req.body.description,
      updateAt: helper.timenow()
    }

    const respond = await Role.updateOne({
      _id: req.body.id,
      deleted : false
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
      type: "Role",
      error: null,
      data: null
    })
  } catch (error) {
    if(error.name == "MongoServerError"){
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    return res.json({
      status: false,
      type: "Role",
      error: 500,
      data: null
    })
  }

}

module.exports.Getdetail = async (req, res) => {
    try {
      if (req.user.role != "admin") {
        return res.json({
          status: false,
          type: "Auth",
          error: 100,
          data: null
        })
      }
      const { id } = req.params
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.json( {
              status: false,
              type: "Data",
              error: 300,
              data: null
          })
          }
      const Data = await Role.findOne({
        _id: id,
        deleted : false
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
module.exports.deleted = async(req,res) => {
  try {
    if (req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    const {id} = req.body
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const check = await auth.findOne({
       role : id,
       deleted : false
    })
    if(check){
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const respond = await Role.updateOne({
      _id : id,
      deleted : false
    },{$set : {deleted : true}})
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
        if (!req.body.id || !mongoose.Types.ObjectId.isValid(req.body.id)) {
            return res.json({
              status: false,
              type: "Data",
              error: 300,
              data: null
            })
          }
        const respond = await Role.updateOne({
            _id: req.body.id,
            deleted : false
        }, { $set: {permissions : req.body.array} })
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

