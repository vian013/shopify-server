const { process } = require("../utils")

const getProductByHandle = async (handle) => {
    try {
        const query = productByHandleQuery(handle)
        const data = await fetchAdminApi(query)
        if (!data.data) throw new Error("No data")
        const product = data.data.productByHandle
        return process.processProduct(product)
    } catch (error) {
        console.log(error)
    }
}

const getColorsAndSizes = (products) => {
    const colors = {}
    const colorProductIds = {}
    const sizes = {}
    const sizeProductIds = {}

    products.map(({ id, variants }) => {
        variants.forEach(({ selectedOptions }) => {
            if (selectedOptions.length === 2) {
                const sizeValue = selectedOptions[0].value
                if (!(sizeValue in sizes)) {
                    sizeProductIds[sizeValue] = new Set()
                    sizes[sizeValue] = 0
                }
                if (!sizeProductIds[sizeValue].has(id)) {
                    sizes[sizeValue]++
                }
                sizeProductIds[sizeValue].add(id)

                const colorValue = selectedOptions[1].value

                if (!(colorValue in colors)) {
                    colorProductIds[colorValue] = new Set()
                    colors[colorValue] = 0
                }
                if (!colorProductIds[colorValue].has(id)) {
                    colors[colorValue]++
                }
                colorProductIds[colorValue].add(id)
            }
        })
    })

    return { colors, sizes }
}

const filterProducts = (size, color, minPrice, maxPrice) => {
    let _products = []

    if (!size && !color) {
        _products = allProducts.filter(product => {
            const variants = product.variants.edges.map(variant => variant.node)
            return (variants.some(variant => variant.price >= minPrice) && variants.some(variant => variant.price <= maxPrice))
        })
    } else if (size && !color) {
        _products = allProducts.filter(product => {
            const variants = product.variants.edges.map(variant => variant.node)
            return (variants.some(({ selectedOptions, price }) => {
                return selectedOptions[0].value === size && price >= minPrice && price <= maxPrice
            }))
        })
    } else if (!size && color) {
        _products = allProducts.filter(product => {
            const variants = product.variants.edges.map(variant => variant.node)
            return (variants.some(({ selectedOptions, price }) => {
                return selectedOptions[1].value === color && price >= minPrice && price <= maxPrice
            }))
        })
    } else if (size && color) {
        _products = allProducts.filter(product => {
            const variants = product.variants.edges.map(variant => variant.node)
            return (variants.some(({ selectedOptions, price }) => {
                return (selectedOptions[0].value === size && selectedOptions[1].value === color && price >= minPrice && price <= maxPrice)
            }))
        })
    }

    const products = processProducts(_products)
    const { sizes, colors } = getColorsAndSizes(products)

    return { products, colors, sizes }
}

module.exports = {
    getProductByHandle,
    getColorsAndSizes,
    filterProducts,
    getColorsAndSizes
}