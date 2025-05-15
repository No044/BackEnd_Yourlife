const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  title: String,
  role : String,
  description : String,
  status : Number,
  permissions: {
    type: Array,
    default: []
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createAt : String,
  updateAt : String
});

const Role = mongoose.model("Role", roleSchema, "roles");

module.exports = Role;