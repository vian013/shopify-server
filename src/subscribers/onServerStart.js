const { productQueries, blogQueries } = require("../db/query")
const { fetchApi, delay } = require("../utils")

let allProducts = []
let allArticles = []

const fetchAllProducts = async () => {
    let hasNext = true
    let products = []
    let endCursor = ""
    console.log("fetching all products...")

    while (hasNext) {
        const data = await fetchApi.fetchAdminApi(productQueries.getAllProductsQuery(endCursor))
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
        const data = await fetchApi.fetchStoreFrontApi(blogQueries.getAllArticlesQuery(endCursor))
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

const getAllProducts = () => allProducts
const getAllArticles = () => allArticles

module.exports = {
    fetchAllProducts,
    fetchAllArticles,
    getAllProducts,
    getAllArticles
}