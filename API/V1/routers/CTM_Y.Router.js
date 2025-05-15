const express = require("express")
const router = express.Router()
const controller = require("../controller/CTM_Y.controller")
const caculator = require("../middleware/Caculatorday_Y")
router.get("/Getall",caculator,controller.GetALL)
router.post("/Post/",controller.Post)
router.get("/Getdetail/:id",controller.GetDetail)
router.patch("/changeStatus",controller.changeStatus)
router.patch("/patch",controller.patch)
router.patch("/deleted",controller.deleted)
router.get("/checkfingerprint",caculator,controller.checkfingerprint)

module.exports = router