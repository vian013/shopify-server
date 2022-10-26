const {process} = require("../utils")
const {productService} = require("../services")
const { getAllProducts: _getAllProducts} = require("../subscribers/onServerStart")
const getAllProducts = async (req, res) => {
    const allProducts = _getAllProducts()
    try {
        const products = process.processProducts(allProducts)
        res.status(200).json(products.reverse())
    } catch (error) {
        console.log(error)
    }
}

const getProductByHandle = async (req, res) => {
    const handle = req.params.handle
    
    try {
        const products = await productService.getProductByHandle(handle)
        res.status(200).json(products)
    } catch (error) {
        console.log(error)
    }
}

const getAllVariants = async (req, res) => {
    const allProducts = await fetchAllProducts()
    const products = process.processProducts(allProducts)
    const { sizes, colors } = productService.getColorsAndSizes(products)
    res.status(200).json({ products, colors, sizes })
}

const getVariants = async (req, res) => {
    const { size, color, minPrice, maxPrice } = req.query
    const { products, colors, sizes } = productService.filterProducts(size, color, Number(minPrice), Number(maxPrice))
    res.status(200).json({ products, colors, sizes })
}

module.exports = {
    getAllProducts,
    getProductByHandle,
    getAllVariants,
    getVariants
}