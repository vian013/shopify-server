const { blogQueries } = require("../db/query")
const { fetchApi } = require("../utils")

const getArticleByHandle = async (req, res) => {
    try {
        const result = await fetchApi.fetchStoreFrontApi(getArticleByHandleQuery(handle))
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
        return article
    } catch (error) {
        console.log(error);   
    }
}

const getArticlesByTag = async(_startCursor, _endCursor, tag) => {
    try {
        const query = blogQueries.getBlogArticlesByTagQuery(_startCursor, _endCursor, tag)
        const result = await fetchApi.fetchStoreFrontApi(query)
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
        return { articles, hasNextPage, hasPreviousPage, startCursor, endCursor}
    } catch (error) {
        console.log(error);        
    }
}

module.exports = {
    getArticlesByTag,
    getArticleByHandle
}