const handleSearch = (term) => {
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

    return result
}

module.exports = {
    handleSearch
}