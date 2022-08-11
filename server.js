const express = require("express")
const fetch = require("node-fetch")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { productsQuery, productByHandleQuery, loginQuery, customerQuery, productVariantsByHandleQuery, createCartQuery, cartQuery, updateCartQuery, addToCartQuery, deleteCartItemQuery, getProductVariantsQuery, getProductsByPrice, getProductsByPriceQuery } = require("./query")
const { compareObjects, fetchStoreFrontApi, fetchAdminApi } = require("./utils")

const app = express()

app.use(express.json())
app.use(cors({
    origin: true,
    credentials: true
}))
app.use(cookieParser())

app.get("/products", async (req, res) => {
    try {
        const products = await getProducts()
        res.status(200).json(products.reverse())
    } catch (error) {
        console.log(error)        
    }
})

const getProducts = async () => {
    const data = await fetchAdminApi(productsQuery)
    if (!data.data) throw new Error("No data")
    const products = data.data.products.edges.map(edge => {
        const product = edge.node
        const featuredImage = product.featuredImage.url
        const variants = product.variants.edges.map(variant => variant.node)
        return {
            ...product,
            featuredImage,
            variants
        }
    })
    return products
}

app.get("/products/:handle", async (req, res) => {
    try {
        const handle = req.params.handle
        const query = productByHandleQuery(handle)
        const data = await fetchAdminApi(query)
        if (!data.data) throw new Error("No data")
        const product = data.data.productByHandle
        const variants = product.variants.edges.map(variant => variant.node)
        const featuredImage = product.featuredImage.url
        const images = product.images.edges.map(image => image.node)
    
        res.status(200).json({
            ...product,
            variants,
            featuredImage,
            images
        })
    } catch (error) {
        console.log(error)        
    }
})

app.post("/products/:handle", async (req, res) => {
    try {
        const productOption = req.body
        const handle = req.params.handle
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
        } )
        
        const result = _variants.find(variant => compareObjects(variant.options, productOption))
        res.status(200).json({variantId: result.id})
        
    } catch (error) {
        console.log(error)
    }
})

app.post("/cart-item", async (req, res) => {
    const {variantId, quantity, cartId} = req.body
    let outOfStockError = null

    try {
        if (!cartId) {
            const cart = await createCart(variantId, quantity)
            const {id} = cart
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.cookie("cartId", String(id))
            res.status(200).json({id, items: []})
        } else {
            const {items: cartItems}  = await getCart(cartId)
            const existed = cartItems.find(item => item.variantId === variantId)
            if (!existed) {
                // console.log("add");
                outOfStockError = await addToCart(cartId, variantId, quantity)
            } 
            else {
                // console.log("update");
                const {quantity: existedQuantity, lineId} = existed
                const newQuantity = quantity + existedQuantity
                outOfStockError = await updateCart(cartId, lineId, variantId, newQuantity)
            }
            res.status(200).json({id: cartId, items: [], outOfStockError})
        }
    } catch (error) {
        console.log(error);        
    }
})

app.delete("/cart-item", async (req, res) => {
    try {
        console.log(req.body);
        const {cartId, lineIds} = req.body
        const variables = {
            "cartId": cartId,
            "lineIds": lineIds
          }
        const data = await fetchStoreFrontApi(deleteCartItemQuery, variables)
        const {cart: {id}} = data.data.cartLinesRemove
        res.status(200).json({id, items: []})
    } catch (error) {
        console.log(error)        
    }

})

const createCart = async (variantId, quantity) => {
    const query = createCartQuery(variantId, quantity)
    const data = await fetchStoreFrontApi(query)
    const cart = data.data.cartCreate.cart
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

    const data = await fetchStoreFrontApi(addToCartQuery, variables)
    const cart = data.data.cartLinesAdd.cart
    const lines = cart.lines.edges.map(edge => edge.node)
    const curLine = lines.find(line => line.merchandise.id === variantId)
    if (curLine && curLine.quantity < quantity) {
        return {
            id: curLine.id,
            maximumQuantity: curLine.quantity
        }
    }
    return null
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

    const data = await fetchStoreFrontApi(updateCartQuery, variables)
    const cart = data.data.cartLinesUpdate.cart
    const lines = cart.lines.edges.map(edge => edge.node)
    const curLine = lines.find(line => line.id === lineId)
    if (curLine && curLine.quantity < newQuantity) {
        return {
            id: curLine.id,
            maximumQuantity: curLine.quantity
        }
    }
    return null
}

const getCart = async (cartId) => {
    const query = cartQuery(cartId)
    const data = await fetchStoreFrontApi(query)
    const cart = data.data.cart
    const totalQuantity = cart.totalQuantity
    const lines = cart.lines.edges.map(edge => edge.node)
    const lineItems = lines.map(line => {
        return {
            ...line.merchandise.product,
            variantId: line.merchandise.id,
            lineId: line.id,
            quantity: line.quantity
        }
    })
    return {
        totalQuantity,
        items: lineItems  
    } 
}

app.get("/cart-items", async(req, res) => {
    const {cartId} = req.query
    try {
        if (cartId) {
            console.log(cartId);
            const cartItems = await getCart(cartId)
            res.status(200).json(cartItems)
        } else {
            res.status(200).json([])
        }
    } catch (error) {
        console.log(error);        
    }
})

app.get("/search", async(req, res) => {
    try {
        const {term, type} = req.query
        const products = await getProducts()
        const results = products.filter(product => product.title.toLowerCase().includes(term))
        const _results = results.map(result => {
            const replaceReg = new RegExp(term, "gi")
            const replaceHtml = `<strong class="hightlight">${term}</strong>`
            const newTitle = result.title.replace(replaceReg, replaceHtml)
            const titleHtml = `<span class="title">${newTitle}</span>`
            const link = `/products/${result.handle}`
            
            return {
                ...result,
                titleHtml,
                link
            }
        })
        res.status(200).json(_results.slice(0, 10))
    } catch (error) {
        console.log(error);        
    }
})


app.post("/login", async (req, res) => {
    const {email, password} = req.body
    const query = loginQuery
    const variables = {
        "input": {
            "email": email,
            "password": password
        }
    }

    const data = await fetchStoreFrontApi(query, variables)
    const {customerUserErrors, customerAccessToken} = data.data.customerAccessTokenCreate
    if (customerAccessToken && customerUserErrors.length === 0) {
        console.log(customerAccessToken) 
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.cookie("sid", "123")
        const data = await fetchAdminApi(customerQuery(email))
        const customer = data.data.customers.edges[0].node
        res.status(200).json(customer)
    }
    if (!customerAccessToken && customerUserErrors.length > 0) {
        res.status(400).json({
            error: "Invalid email or password!"
        })
    } 
})

const getProductVariants = async (size, color) => {
    try {
        const data = await fetchAdminApi(getProductVariantsQuery(size, color))
        const variants = data.data.productVariants.edges.map(edge => edge.node)
        return variants
    } catch (error) {
        console.log(error);        
    }
}



app.get("/product-variants", async(req, res) => {
    const {size, color, minPrice, maxPrice, all} = req.query
    console.log(size, color, minPrice, maxPrice, all);
    let products = []
    const colors = {}
    const colorProductIds = {}
    const sizes = {}
    const sizeProductIds = {}
    let _selectedOptions = []
    let _product = {}

    const getColorsAndSizes = () => {
        const sizeValue = _selectedOptions[0].value 
        if (!(sizeValue in sizes)) {
            sizeProductIds[sizeValue] = new Set()
            sizes[sizeValue] = 0
        } 
        if (!sizeProductIds[sizeValue].has(_product.id)) {
            sizes[sizeValue]++
            sizeProductIds[sizeValue].add(_product.id)
        }
        
        const colorValue = _selectedOptions[1].value 
        if (!(colorValue in colors)) {
            colorProductIds[colorValue] = new Set()
            colors[colorValue] = 0
        } 
        if (!colorProductIds[colorValue].has(_product.id)) {
            colors[colorValue]++
            colorProductIds[colorValue].add(_product.id)
        }
    }
    
    try {
        if (!size && !color) {
            const data = await fetchAdminApi(getProductsByPriceQuery(minPrice, maxPrice))
            if (!data.data) return
            products = data.data.products.edges.map(edge => {
                const product = edge.node
                const featuredImage = product.featuredImage.url
                const variants = product.variants.edges.map(variant => variant.node)
                variants.forEach(({selectedOptions}) => {
                    if (selectedOptions.length === 2) _selectedOptions = selectedOptions
                    _product = product
                    getColorsAndSizes()
                })
                return {
                    ...product,
                    featuredImage,
                    variants,
                    price: variants[0].price
                }
            })
            // console.log("sizes", sizes);
            // console.log("colors", colors);
            res.status(200).json({products, colors, sizes})
    } else {
            const productIds = new Set()
            console.log("variant");
            const variants = await getProductVariants(size, color)
            variants.forEach(({price, product, selectedOptions}) => {
                _selectedOptions = selectedOptions
                _product = product
                getColorsAndSizes()
                const featuredImage = product.featuredImage.url
                const variants = product.variants.edges.map(variant => variant.node)
                if (price >= Number(minPrice) && price <= Number(maxPrice) && !productIds.has(product.id)) {
                    products.push({
                        ...product,
                        featuredImage,
                        variants,
                        price
                    })
                } 
                productIds.add(product.id)
            })
            console.log(productIds);
            console.log(products);
            // console.log(sizes);
            // console.log(colors);
            res.status(200).json({products, colors, sizes})
        }
    } catch (error) {
        console.log(error)        
    }
})

const users = {
    "123": {
        firstName: "fsfdf",
        lastName: "asfd",
        email: "def@gmail.com"
    }
}

app.get("/user", (req, res) => {
    const {sid} = req.cookies
    if (sid) {
        res.status(200).json(users[sid]) 
    }
})

app.get("/logout", (req, res) => {
    console.log("delete sid");
    res.clearCookie("sid", {domain: "localhost", path: "/"})
    res.send()
})

const server = app.listen(4000, () => {
    console.log("listening...");
})