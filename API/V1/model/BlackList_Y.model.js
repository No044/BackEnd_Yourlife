const mongoose = require("mongoose")

const BlackListschenma = new mongoose.Schema({
    CTM_id : String,
    token : String,
    status : {
        type : Number,
        default : 1
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 930 
    },
})

const BlackList = mongoose.model("BlackList",BlackListschenma,"BlackList")
module.exports = BlackList 