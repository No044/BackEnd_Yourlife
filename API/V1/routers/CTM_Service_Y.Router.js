const express = require("express")
const router = express.Router()
const controller = require("../controller/CTM_Service_Y.controller")
router.post("/Post",controller.Post)
router.get("/GetAll",controller.GetALL)
router.patch("/changestatus/:id",controller.changestatus)

module.exports = router