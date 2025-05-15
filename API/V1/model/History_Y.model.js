const mongoose = require("mongoose")

const Historyschenma = new mongoose.Schema({
    authen_id : String,
    id_type : String,
    type : String,
    action : String,
    detailtype : {
        field_1: String,
        field_2 : {
            type : String,
            default : null
        },
        field_3 : {
            type : String,
            default : null
        },
        field_4 : {
            type : String,
            default : null
        }
    },
    revenue : Number,
    datesearch : String,
    createAt : String,
    CreateBy : String,
    status : {
        type : String,
        default : 1
    }
})

const History = mongoose.model("History",Historyschenma,"History")
module.exports = History 