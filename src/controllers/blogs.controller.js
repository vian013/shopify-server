const { blogService } = require("../services")

const getArticleByHandle = async (req, res) => {
    const { handle } = req.params
    if (!handle) return

    try {
        const article = await blogService.getArticleByHandle(handle)
        res.status(200).json(article)
    } catch (error) {
        console.log(error)
    }

}

const getArticlesByTag = async (req, res) => {
    const { handle } = req.params
    const { startCursor, endCursor, tag } = req.query

    if (!handle) return
    try {
        const result = blogService.getArticlesByTag(startCursor, endCursor, tag)
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getArticlesByTag,
    getArticleByHandle
}