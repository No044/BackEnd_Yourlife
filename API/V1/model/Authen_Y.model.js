const mongoose = require("mongoose")

const Authenschenma = new mongoose.Schema({
    Email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    status : Number,
    deleted : Boolean,
    role : String,
    CreateAT : String,
    CreateBy : String,
    UpdateAT : String,
    UpdateBy : String
})

const Authens = mongoose.model("Authens",Authenschenma,"Authens")
module.exports = Authens