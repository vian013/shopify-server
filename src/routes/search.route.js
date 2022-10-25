const express = require("express")
const { getSearch } = require("../controllers/search.controller")

const router = express.Router()

router.get("/", getSearch)