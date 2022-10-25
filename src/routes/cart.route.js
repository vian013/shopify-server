const express = require("express")
const { cartController } = require("../controllers")

const router = express.Router()

router.route("/")
.get(cartController.getCart)
.post(cartController.postCart)

router.route("/:handle")
.post(cartController.postCartItem)
.put(cartController.putCartItem)
.delete(cartController.deleteCartItem)