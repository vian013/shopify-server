const express = require("express")
const { blogController } = require("../controllers")

const router = express.Router()

router.get("/news/:handle", )

router.get("/news/tagged/:tag", blogController.getArticlesByTag)

module.exports = router