const mongoose = require("mongoose")

const CTM_SVshenma = new mongoose.Schema({
    CTM_id: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
    Service_id: { type: mongoose.Schema.Types.ObjectId, ref: "service" },
    status : Number,
    deleted : {
        type : Boolean,
        default : false
    },
    CreateAt: String,
    CreateBy : String,
    updateAt : String,
    updateBy : String
})

const CTM_SV = mongoose.model("CTM_SV",CTM_SVshenma,"CTM_SV")
module.exports = CTM_SV