const { collectionService } = require("../services")

const getCollections = async (req, res) => {
    try {
        const collections = collectionService.getCollections()
        res.status(200).json(collections)
    } catch (error) {
        console.log(error)
    }
}

const getCollectionProducts = async (req, res) => {
    const { handle } = req.params
    try {
        const _products = collectionService.getCollectionProducts(handle)
        const products = processProducts(_products)
        res.status(200).json(products)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getCollections,
    getCollectionProducts
}