const { cartService } = require("../services")
const { process } = require("../utils")

const getCart = async (req, res) => {
    const { cartId } = req.query
    try {
        if (cartId) {
            const cart = await cartService.getCart(cartId)
            res.status(200).json(process.processCart(cart))
        } 
    } catch (error) {
        console.log(error);
    }
}

const postCart = async (req, res) => {
    const { productHandle: handle, options, quantity } = req.body
    try {
        const variantId = await getVariantId(handle, options)
        const cart = await createCart(variantId, quantity)
        const {id} = cart
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.cookie("cartId", String(id))
        res.status(201).json(processCart(cart))
    } catch (error) {
        console.log(error);
    }
}

const postCartItem = async (req, res) => {
    const { handle } = req.params
    const { options, quantity, cartId } = req.body
    try {
        const variantId = await cartService.getVariantId(handle, options)
        const cart = await cartService.getCart(cartId)
        const {items} = process.processCart(cart)
    
        const isInCart = items.find(item => item.variantId === variantId)
        if (!isInCart) {
            const {cart, outOfStockError} = await cartService.addToCart(cartId, variantId, quantity)
            res.status(200).json({cart: process.processCart(cart), outOfStockError})
        }
        else {
            const { quantity: previousQuantity, lineId } = isInCart
            const newQuantity = previousQuantity + quantity
            const {cart, outOfStockError} = await cartService.updateCart(cartId, lineId, variantId, newQuantity)
            res.status(200).json({cart: process.processCart(cart), outOfStockError})
        }
    } catch (error) {
        console.log(error);        
    }
}

const putCartItem = async (req, res) => {
    const {cartId, lineId, variantId, newQuantity} = req.body
    
    try {
        const {cart, outOfStockError} = await updateCart(cartId, lineId, variantId, newQuantity)
        res.status(200).json({cart: process.processCart(cart), outOfStockError})
    } catch (error) {
    }
}

const deleteCartItem = async (req, res) => {
    const { cartId, lineId } = req.body
    
    try {
        const cart = cartService.deleteCart(cartId, lineId)
        res.status(200).json(processCart(cart))
    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    getCart,
    postCart,
    postCartItem,
    putCartItem,
    deleteCartItem
}