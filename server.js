const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { productByHandleQuery, loginQuery, customerQuery, productVariantsByHandleQuery, createCartQuery, cartQuery, updateCartQuery, addToCartQuery, deleteCartItemQuery, getAllProductsQuery, getCollectionProductsQuery, blogArticlesByHandleQuery, getCollectionsQuery, getAllArticlesQuery, getArticleByHandleQuery, getCustomerByIdQuery, createAccountQuery } = require("./query")

const { compareObjects, fetchStoreFrontApi, fetchAdminApi } = require("./utils")

let allProducts = []
let allArticles = []

const app = express()
app.use(express.json())
app.use(cors({
    origin: true,
    credentials: true
}))
app.use(cookieParser())

app.get("/products", async (req, res) => {
    try {
        const products = await getAllProducts()
        res.status(200).json(products.reverse())
    } catch (error) {
        console.log(error)
    }
})

const getAllProducts = () => {
    const products = allProducts.map(product => {
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
    const handle = req.params.handle
    
    try {
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
        })

        const result = _variants.find(variant => compareObjects(variant.options, productOption))
        res.status(200).json({ variantId: result.id })

    } catch (error) {
        console.log(error)
    }
})

app.post("/cart-item", async (req, res) => {
    const { productHandle: handle, options, quantity, cartId } = req.body
    const variantId = await getVariantId(handle, options)
    const {items} = await getCart(cartId)

    const isInCart = items.find(item => item.variantId === variantId)
    if (!isInCart) {
        const {cart, outOfStockError} = await addToCart(cartId, variantId, quantity)
        res.status(200).json({cart: processCart(cart), outOfStockError})
    }
    else {
        const { quantity: previousQuantity, lineId } = isInCart
        const newQuantity = previousQuantity + quantity
        const {cart, outOfStockError} = await updateCart(cartId, lineId, variantId, newQuantity)
        res.status(200).json({cart: processCart(cart), outOfStockError})
    }
})

app.put("/cart-item", async (req, res) => {
    const {cartId, lineId, variantId, newQuantity} = req.body
    
    try {
        const {cart, outOfStockError} = await updateCart(cartId, lineId, variantId, newQuantity)
        res.status(200).json({cart: processCart(cart), outOfStockError})
    } catch (error) {
    }
})

app.delete("/cart-item", async (req, res) => {
    const { cartId, lineId } = req.body
    const variables = {
        "cartId": cartId,
        "lineIds": lineId
    }
    try {
        const data = await fetchStoreFrontApi(deleteCartItemQuery, variables)
        const cart = data.data.cartLinesRemove.cart
        res.status(200).json(processCart(cart))
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
    let outOfStockError = null

    const data = await fetchStoreFrontApi(addToCartQuery, variables)
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

    const data = await fetchStoreFrontApi(updateCartQuery, variables)
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

const getCart = async (cartId) => {
    const query = cartQuery(cartId)
    const data = await fetchStoreFrontApi(query)
    const cart = data.data.cart
    return processCart(cart)
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

app.get("/cart-items", async (req, res) => {
    const { cartId } = req.query
    try {
        if (cartId) {
            const cartItems = await getCart(cartId)
            res.status(200).json(cartItems)
        } else {
            res.status(200).json([])
        }
    } catch (error) {
        console.log(error);
    }
})

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

app.post("/cart-items", async (req, res) => {
    const { productHandle: handle, options, quantity } = req.body
    try {
        const variantId = await getVariantId(handle, options)
        const cart = await createCart(variantId, quantity)
        const {id} = cart
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.cookie("cartId", String(id))
        res.status(200).json(processCart(cart))
    } catch (error) {
    }
})

app.get("/search", async (req, res) => {
    try {
        const { term } = req.query
        const _products = getAllProducts().filter(product => product.title.toLowerCase().includes(term))
        const products = _products.map(product => {
            const replaceReg = new RegExp(term, "gi")
            const replaceHtml = `<strong class="hightlight">${term}</strong>`
            const newTitle = product.title.replace(replaceReg, replaceHtml)
            const titleHtml = `<span class="title">${newTitle}</span>`
            const link = `/products/${product.handle}`
            const imgUrl = product.featuredImage
            const price = product.variants[0].price

            return {
                ...product,
                titleHtml,
                link,
                imgUrl,
                price
            }
        })

        const _articles = allArticles.filter(article => article.title.toLowerCase().includes(term))
        const articles = _articles.map(article => {
            const replaceReg = new RegExp(term, "gi")
            const replaceHtml = `<strong class="hightlight">${term}</strong>`
            const newTitle = article.title.replace(replaceReg, replaceHtml)
            const titleHtml = `<span class="title">${newTitle}</span>`
            const link = `/blogs/${article.handle}`
            const imgUrl = article.image.url

            return {
                ...article,
                titleHtml,
                link,
                imgUrl
            }
        })

        const result = {
            products: products.slice(0, 10),
            articles: articles.slice(0, 10),
        }

        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
})


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

const processProducts = (products) => {
    return products.map(product => {
        const featuredImage = product.featuredImage.url
        const variants = product.variants.edges.map(variant => variant.node)
        const images = product.images.edges.map(image => image.node)
        return {
            ...product,
            featuredImage,
            variants,
            images,
            price: variants[0].price
        }
    })
}

app.get("/product-variants", async (req, res) => {
    const { size, color, minPrice, maxPrice } = req.query
    const { products, colors, sizes } = filterProducts(size, color, Number(minPrice), Number(maxPrice))
    res.status(200).json({ products, colors, sizes })
})

app.get("/product-variants/all", async (req, res) => {
    const products = processProducts(allProducts)
    const { sizes, colors } = getColorsAndSizes(products)
    res.status(200).json({ products, colors, sizes })
})

app.get("/collections", async (req, res) => {
    try {
        const result = await fetchAdminApi(getCollectionsQuery)
        const collections = result.data.collections.edges
            .map(edge => edge.node)
            .map(collection => {
                const { title, handle, image } = collection
                const imgUrl = image.url
                return {
                    title,
                    handle,
                    imgUrl
                }
            })

        res.status(200).json(collections)
    } catch (error) {
        console.log(error)
    }
})

app.get("/collections/:handle", async (req, res) => {
    const { handle } = req.params
    try {
        const result = await fetchAdminApi(getCollectionProductsQuery(handle))
        const _products = result.data.collectionByHandle.products.edges.map(edge => edge.node)
        const products = processProducts(_products)
        res.status(200).json(products)
    } catch (error) {
        console.log(error);
    }
})


app.get("/blogs/news/tagged/:handle", async (req, res) => {
    const { handle } = req.params
    const { startCursor, endCursor, tag } = req.query
    const query = blogArticlesByHandleQuery(startCursor, endCursor, tag)

    if (!handle) return
    try {
        const result = await fetchStoreFrontApi(query)
        const _articles = result.data.articles.edges.map(edge => edge.node)
        const pageInfo = result.data.articles.pageInfo
        const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo
        const articles = _articles.map(article => {
            const { title, handle, excerpt } = article
            const imgUrl = article.image.url
            const publishedAt = new Date(article.publishedAt).toDateString()
            return {
                title,
                publishedAt,
                handle,
                imgUrl,
                excerpt
            }
        })
        res.status(200).json({ articles, hasNextPage, hasPreviousPage, startCursor, endCursor })
    } catch (error) {

    }
})

app.get("/blogs/:handle", async (req, res) => {
    const { handle } = req.params
    if (!handle) return

    try {
        const result = await fetchStoreFrontApi(getArticleByHandleQuery(handle))
        const _article = result.data.blog.articleByHandle
        const { title, authorV2, image, contentHtml, excerpt } = _article
        const author = authorV2.name
        const imgUrl = image.url
        const publishedAt = new Date(_article.publishedAt).toDateString().substring(3)
        const article = {
            imgUrl,
            publishedAt,
            title,
            handle: _article.handle,
            contentHtml,
            author,
            excerpt
        }

        res.status(200).json(article)
    } catch (error) {
        console.log(error)
    }

})

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    const query = loginQuery
    const variables = {
        "input": {
            "email": email,
            "password": password
        }
    }

    const data = await fetchStoreFrontApi(query, variables)
    const { customerUserErrors, customerAccessToken } = data.data.customerAccessTokenCreate
    if (customerAccessToken && customerUserErrors.length === 0) {
        const data = await fetchAdminApi(customerQuery(email))
        const customer = data.data.customers.edges[0].node
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.cookie("sid", customer.id)
        res.status(200).json(customer)
    }
    if (!customerAccessToken && customerUserErrors.length > 0) {
        res.status(400).json({
            error: "Invalid email or password!"
        })
    }
})

app.get("/user", async (req, res) => {
    const { id } = req.query
    const { sid } = req.cookies
    const userId = id || sid
    if (!userId) return
    try {
        const result = await fetchAdminApi(getCustomerByIdQuery(userId))
        const user = result.data.customer
        res.status(200).json(user)
    } catch (error) {

    }
})

app.get("/logout", (req, res) => {
    res.clearCookie("sid", { domain: "localhost", path: "/" })
    res.send()
})

app.post("/create-account", async (req, res) => {
    const { email, password, fName, lName } = req.body
    const variables = {
        input: {
            email,
            password,
            firstName: fName,
            lastName: lName
        }
    }
    try {
        const result = await fetchStoreFrontApi(createAccountQuery, variables)
        const { data, errors } = result
        if (data.customerCreate) {
            const customer = data.customerCreate.customer
            const customerErrors = data.customerCreate.customerUserErrors

            if (customer) res.status(201).json(customer)
            if (customerErrors.length > 0) res.status(400).json({ message: customerErrors[0].message })
        }

        if (errors) res.status(400).json({ message: errors[0].message })

    } catch (error) {
        res.status(400).json({ message: "Cannot create account" })

    }
})

const fetchAllProducts = async () => {
    let hasNext = true
    let products = []
    let endCursor = ""
    console.log("fetching all products...")

    while (hasNext) {
        const data = await fetchAdminApi(getAllProductsQuery(endCursor))
        let _products = []
        if (data.data) _products = data.data.products.edges.map(edge => edge.node)
        products = [...products, ..._products]
        hasNext = data.data.products.pageInfo.hasNextPage
        endCursor = data.data.products.pageInfo.endCursor
        if (hasNext) await delay(4000)
    }

    console.log("fetch products done!");

    allProducts = products
}

const fetchAllArticles = async () => {
    let hasNext = true
    let articles = []
    let endCursor = ""
    console.log("fetching all articles...")

    while (hasNext) {
        const data = await fetchStoreFrontApi(getAllArticlesQuery(endCursor))
        let _articles = []
        if (data.data) _articles = data.data.articles.edges.map(edge => edge.node)
        articles = [...articles, ..._articles]
        hasNext = data.data.articles.pageInfo.hasNextPage
        endCursor = data.data.articles.pageInfo.endCursor
        if (hasNext) await delay(4000)
    }

    console.log("fetch articles done!");
    allArticles = articles
}

const delay = (time) => {
    return new Promise(resolve => setTimeout(() => resolve(), time))
}

const server = app.listen(4000, async () => {
    console.log("listening...");
    fetchAllProducts()
    fetchAllArticles()
})