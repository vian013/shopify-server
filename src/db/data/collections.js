const collectionByHandleData = (productsLimit=20, imagesLimit=5, variantsLimit=15) => `
    products(first: ${productsLimit}) {
        edges {
            node{
                id
                title
                description
                images(first: ${imagesLimit}) {
                    edges {
                        node {
                            id
                            url
                        }
                    }
                }
                featuredImage {
                    id
                    url
                }
                handle
                vendor
                totalInventory
                variants(first: ${variantsLimit}) {
                    edges {
                        node {
                            id
                            title
                            price
                            selectedOptions {
                                name,
                                value
                            }
                            inventoryQuantity
                        }
                    }
                }
            }
        }
    }
`
module.exports = {
    collectionByHandleData
}