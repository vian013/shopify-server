const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const routes = require("./routes")
const { fetchAllProducts, fetchAllArticles } = require("./subscribers/onServerStart")

const app = express()
app.use(express.json())
app.use(cors({
    origin: true,
    credentials: true
}))
app.use(cookieParser())

app.use("/", routes)

const server = app.listen(4000, async () => {
    console.log("listening...");
    fetchAllProducts()
    fetchAllArticles()
})