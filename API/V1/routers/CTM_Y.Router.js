const express = require("express")
const router = express.Router()
const controller = require("../controller/CTM_Y.controller")
router.get("/Getall",controller.GetALL)
router.post("/Post",controller.Post)
router.get("/Getdetail/:id",controller.GetDetail)
router.patch("/changeStatus",controller.changeStatus)
router.patch("/patch",controller.patch)

module.exports = router