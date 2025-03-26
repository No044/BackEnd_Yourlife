const mongoose = require("mongoose")

const PackageSchema = new mongoose.Schema({
    Name : String,
    Price : Number,
    Duration : Number,
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