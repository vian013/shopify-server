const express = require("express")
const { accountController } = require("../controllers")

const router = express.Router()

router.post("/login", accountController.postLogin)

router.post("/logout", accountController.postLogout)

router.route("/")
.get(accountController.getUser)
.post(accountController.postUser)

module.exports = router