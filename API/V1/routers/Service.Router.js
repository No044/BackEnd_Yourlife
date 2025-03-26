const express = require("express")
const router = express.Router()
const controller = require("../controller/Service_Y.controller")
router.get("/GetALL",controller.GetAll)
router.get("/Getdetail/:id",controller.Getdetail)
router.post("/Post",controller.Post)
router.patch("/Patch",controller.patch)
router.patch("/changestatus",controller.changeStatus)


module.exports = router
