const mongoose = require("mongoose")

const ServiceSchema = new mongoose.Schema({
  Name : String,
  Price : Number,
  Quatity : Number,
  sold : {
    type : Number,
    default : 0
  },
  status : Number,
  deleted : {
    type : Boolean,
    default : false
  },
  createAt : String,
  CreateBy : String,
  updateAt : String,
  updateBy : String
})

const Service = mongoose.model("service",ServiceSchema,"service")
module.exports = Service