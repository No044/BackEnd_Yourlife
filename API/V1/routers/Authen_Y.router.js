const express = require("express")
const router = express.Router()
const controller = require("../controller/Authen_Y.controller")
const Authorizes = require("../middleware/Authentication_Y")
const loglimit = require("../middleware/Rate_limit_Y")
router.post("/create",Authorizes,controller.register)
router.get("/authorizes",Authorizes,controller.Authorizes)
router.post("/createpremission",Authorizes,controller.createrpremission)
router.get("/Getall",Authorizes,controller.Getall)
router.post("/login",loglimit(),controller.login)

module.exports = router