const mongoose = require("mongoose")

const CTM_PKschenma = new mongoose.Schema({
    CTM_id : { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
    Package_id : { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    status : {
        type : Number,
         default : 1
    },
    deleted : {
        type : Boolean,
        default : false
    },
    CreateAt: String,
    CreateBy : String,
    updateAt : String,
    updateBy : String
})

const CTM_PK = mongoose.model("CTM_PK",CTM_PKschenma,"CTM_PK")
module.exports = CTM_PK 