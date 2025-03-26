const mongoose = require("mongoose")

const Authenschenma = new mongoose.Schema({
    Email : String,
    password : String,
    status : String,
    deleted : String,
    role : String,
    permission : Array,
    CreateAT : String,
    CreateBy : String,
    UpdateAT : String,
    UpdateBy : String
})

const Authens = mongoose.model("Authens",Authenschenma,"Authens")
module.exports = Authens