const mongoose = require("mongoose")

const CustomerSchema = new mongoose.Schema({
    FullName : String,
    Email : String,
    Phone_number : String,
    Status : Number,
    date_reserve : {
        type : String,
        default : null
    },
    deleted : Boolean,
    Description : String,
    startday : {
        type : String,
        default : null
    },
    totalDay : {
        type : Number,
        default : 0
    },
    createAt : String,
    CreateBy : String,
    updateAt : String,
    updateBy : String
})

const Customer = mongoose.model("customer",CustomerSchema,"customer")
module.exports = Customer