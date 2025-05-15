const mongoose = require("mongoose")

const PackageSchema = new mongoose.Schema({
    Name : {
        type: String,
        required: true
    },
    Price : {
        type: Number,
        required: true
    },
    Duration :  {
        type: Number,
        required: true
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

const Package = mongoose.model("Package",PackageSchema,"package")

module.exports = Package