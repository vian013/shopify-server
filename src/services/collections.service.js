const { fetchApi } = require("../utils")

const getCollections = async () => {
    try {
        const result = await fetchApi.fetchAdminApi(getCollectionsQuery)
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
        return collections
    } catch (error) {
        console.log(error);        
    }
}

const getCollectionProducts = async (handle) => {
    try {
        const result = await fetchAdminApi(getCollectionProductsQuery(handle))
        const products = result.data.collectionByHandle.products.edges.map(edge => edge.node)
        return products
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getCollections,
    getCollectionProducts
}