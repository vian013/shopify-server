const { cartQueries } = require("../db/query")
const { fetchApi } = require("../utils")

const createCart = async (variantId, quantity) => {
    const query = createCartQuery(variantId, quantity)
    const data = await fetchStoreFrontApi(query)
    const cart = data.data.cartCreate.cart
    return cart
}

const getCart = async (cartId) => {
    const query = cartQueries.getCartQuery(cartId)
    const data = await fetchStoreFrontApi(query)
    const cart = data.data.cart
    return cart
}

const addToCart = async (cartId, variantId, quantity) => {
    const variables = {
        "cartId": cartId,
        "lines": {
            "merchandiseId": variantId,
            "quantity": quantity
        }
    }
    let outOfStockError = null

    const data = await fetchApi.fetchStoreFrontApi(addToCartQuery, variables)
    const cart = data.data.cartLinesAdd.cart
    const lines = cart.lines.edges.map(edge => edge.node)
    const curLine = lines.find(line => line.merchandise.id === variantId)
    if (curLine && curLine.quantity < quantity) {
        outOfStockError = {
            lineId: curLine.id,
            maximumQuantity: curLine.quantity
        }
    }
    return {
        cart,
        outOfStockError
    }
}

const updateCart = async (cartId, lineId, variantId, newQuantity) => {
    const variables = {
        "cartId": cartId,
        "lines": {
            "id": lineId,
            "merchandiseId": variantId,
            "quantity": newQuantity
        }
    }
    let outOfStockError = null

    const data = await fetchApi.fetchStoreFrontApi(updateCartQuery, variables)
    const cart = data.data.cartLinesUpdate.cart
    const lines = cart.lines.edges.map(edge => edge.node)
    const curLine = lines.find(line => line.id === lineId)
    if (curLine && curLine.quantity < newQuantity) {
        outOfStockError = {
            id: curLine.id,
            maximumQuantity: curLine.quantity
        }
    }
    return {
        cart,
        outOfStockError
    }
}

const deleteCart = async(cartId, lineId) => {
    const variables = {
        "cartId": cartId,
        "lineIds": lineId
    }
    const data = await fetchStoreFrontApi(deleteCartItemQuery, variables)
    const cart = data.data.cartLinesRemove.cart
    return cart
}

const getVariantId = async(handle, options) => {
    const query = productVariantsByHandleQuery(handle)
    const data = await fetchAdminApi(query)
    const product = data.data.productByHandle
    const variants = product.variants.edges.map(variant => variant.node)
    const _variants = variants.map(variant => {
        const option = variant.selectedOptions
        const o2 = {}
        option.forEach(pair => o2[pair.name] = pair.value)
        return {
            id: variant.id,
            options: o2
        }
    })

    const variant = _variants.find(variant => compareObjects(variant.options, options))

    return variant.id
}

module.exports = {
    getCart,
    createCart,
    addToCart,
    updateCart,
    deleteCart,
    getVariantId
}