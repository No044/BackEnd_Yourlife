const express = require("express")
const router = express.Router()
const controller = require("../controller/Package_Y.controller")
router.get("/GetAll",controller.GetALL)
router.post("/PostAll",controller.Post)
router.patch("/changestatus",controller.changeStatus)
router.patch("/patch",controller.patch)
router.get("/Getdetail/:id",controller.Getdetail)
module.exports = router
