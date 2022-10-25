const processProduct = (product) => {
    const variants = product.variants.edges.map(variant => variant.node)
    const featuredImage = product.featuredImage.url
    const images = product.images.edges.map(image => image.node)

    return {
        ...product,
        variants,
        featuredImage,
        images,
        price: variants[0].price
    }
}

const processProducts = (products) => {
    return products.map(product => processProduct(product))
}

const processCart = (cart) => {
    const totalQuantity = cart.totalQuantity
    let subTotal = 0
    let totalTax = 0
    let total = 0
    if (totalQuantity > 0) {
        subTotal = cart.cost.subtotalAmount.amount
        totalTax = cart.cost.totalTaxAmount.amount
        total = cart.cost.totalAmount.amount
    }
    const items = processCartItems(cart)
    const cartData = {
        id: cart.id,
        items,
        totalQuantity,
        total,
        subTotal,
        totalTax
    }
    return cartData
}

const processCartItems = (cart) => {
    const lines = cart.lines.edges.map(edge => edge.node)
    const lineItems = lines.map(line => {
        const product = line.merchandise.product
        const imgUrl = product.featuredImage.url
        const options = line.merchandise.title
        const price = line.merchandise.priceV2.amount
        return {
            ...product,
            imgUrl,
            variantId: line.merchandise.id,
            lineId: line.id,
            quantity: line.quantity,
            cost: line.cost.totalAmount.amount,
            price,
            options
        }
    })
    return lineItems
}

module.exports = {
    processProduct,
    processProducts,
    processCart
}