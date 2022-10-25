const express = require("express")
const { productsController } = require("../controllers")
const router = express.Router()

router.get("/", productsController.getAllProducts)

router.get("/:handle", productsController.getProductByHandle)

router.get("/variants/all", productsController.getAllVariants)

router.get("/variants", productsController.getVariants)

module.exports = router 