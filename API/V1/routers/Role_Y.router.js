const express = require("express")
const router = express.Router()
const controller = require("../controller/Role_Y.controller")
router.get("/Getall",controller.GetALL)
router.get("/Getdetail/:id",controller.Getdetail)
router.post("/Post",controller.Post)

router.patch("/Patch",controller.patch)
router.patch("/createpremission",controller.createrpremission)

router.patch("/changestatus",controller.changeStatus)
router.patch("/deleted",controller.deleted)


module.exports = router
