const express = require("express")
const { collectionController } = require("../controllers")
const router = express.Router()

router.get("/", collectionController.getCollections)
router.get("/:handle", collectionController.getCollectionProducts)

module.exports = router