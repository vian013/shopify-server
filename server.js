const express = require("express")
const fetch = require("node-fetch")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { productsQuery, productByHandleQuery, loginQuery, customerQuery, productVariantsByHandleQuery, createCartQuery, cartQuery } = require("./query")
const { compareObjects, fetchStoreFrontApi } = require("./utils")

const app = express()

app.use(express.json())
app.use(cors({
    origin: true,
    credentials: true
}))
app.use(cookieParser())

const fetchData = async (query, variables = {}) => {
    const res = await fetch("https://kevin013.myshopify.com/admin/api/2022-07/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": "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"
        },
        body: JSON.stringify({query, variables}) 
    })
    const data = await res.json()
    return data
}

app.get("/products", async (req, res) => {
    const data = await fetchData(productsQuery)
    const products = data.data.products.edges.map(item => {
        const product = item.node
        const featuredImage = product.featuredImage.url
        const variants = product.variants.edges.map(variant => variant.node)
        return {
            ...product,
            featuredImage,
            variants
        }
    })
    res.status(200).json(products.reverse())
})

app.get("/products/:handle", async (req, res) => {
    const handle = req.params.handle
    const query = productByHandleQuery(handle)
    const data = await fetchData(query)
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
})

app.post("/products/:handle", async (req, res) => {
    try {
        const productOption = req.body
        const handle = req.params.handle
        const query = productVariantsByHandleQuery(handle)
        const data = await fetchData(query)
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

app.post("/add-to-cart", async (req, res) => {
    const {variantId, quantity, cartId} = req.body
    if (!cartId) {
        const cart = await createCart(variantId, quantity)
        const {id} = cart
        console.log(id);
        res.status(200).json({id, items: []})
    } else {
        console.log("already");
        getCart(cartId)
        res.status(200).json({id: cartId, items: []})
    }
})

const createCart = async (variantId, quantity) => {
    const query = createCartQuery(variantId, quantity)
    const data = await fetchStoreFrontApi(query)
    return data.data.cartCreate.cart
}

const getCart = async (cartId) => {
    const query = cartQuery(cartId)
    const data = await fetchStoreFrontApi(query)
    const lines = data.data.cart.lines.edges.map(edge => edge.node)
    const lineItems = lines.map(line => {
        return {
            ...line.merchandise.product,
            quantity: line.quantity
        }
    })
    return lineItems
}

const getCustomerByEmail = async(query, variables={}) => {
    const res = await fetch("https://kevin013.myshopify.com/admin/api/2022-07/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": "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"
        },
        body: JSON.stringify({query, variables})
    })
    const data = await res.json()
    return data
}

app.post("/get-cart-items", async( req, res) => {
    const {cartId} = req.body
    try {
        const cartItems = await getCart(cartId)
        res.status(200).json(cartItems)
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

    const result = await fetch("https://kevin013.myshopify.com/api/2022-07/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": "a2dd507dc76d0a2fad44319092092001"
        },
        body: JSON.stringify({query, variables}),
    })
    const data = await result.json()
    const {customerUserErrors, customerAccessToken} = data.data.customerAccessTokenCreate
    if (customerAccessToken && customerUserErrors.length === 0) {
        console.log(customerAccessToken) 
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.cookie("sid", "123")
        const data = await getCustomerByEmail(customerQuery(email))
        const customer = data.data.customers.edges[0].node
        res.status(200).json(customer)
    }
    if (!customerAccessToken && customerUserErrors.length > 0) {
        res.status(400).json({
            error: "Invalid email or password!"
        })
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