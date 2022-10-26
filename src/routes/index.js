const express = require("express")
const productRouter = require("./products.route")
const cartRouter = require("./cart.route")
const accountRouter = require("./account.route")
const blogRouter = require("./blogs.route")
const collectionRouter = require("./collections.route")

const routes = express.Router()

routes.use("/products", productRouter)
routes.use("/cart", cartRouter)
routes.use("/account", accountRouter)
routes.use("/blogs", blogRouter)
routes.use("/collections", collectionRouter)

module.exports = routes