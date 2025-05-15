const mongoose = require("mongoose")

const ServiceSchema = new mongoose.Schema({
  Name : {
    type: String,
    required: true
},
  Price : {
    type: Number,
    required: true
},
  Quatity : {
    type: Number,
    required: true
},
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