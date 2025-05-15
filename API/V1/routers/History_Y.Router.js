const express = require("express")
const router = express.Router()
const controller = require("../controller/History_Y.controller")
router.get("/Getall/:key",controller.GetALl)
router.get("/Gettotal/:key",controller.GetToTal)

module.exports = router