const productData = (variantsLimit) => `
    id
    title
    description
    featuredImage {
        id
        url
    }
    handle
    variants(first:${variantsLimit}) {
    edges {
        node {
            id
            title
            price
        }
    }
    }
    vendor
    totalInventory
`

const productByHandleData = (imagesLimit, variantsLimit) => `
    id
    title
    description
    featuredImage {
        id
        url
    }
    images(first: ${imagesLimit}) {
        edges {
            node {
                id
                url
            }
        }
    }
    handle
    variants(first: ${variantsLimit}) {
    edges {
        node {
            id
            title
            price
            selectedOptions{
                name
                value
            }   
        }
    }
    }
    vendor
    options {
        id
        name
        values
    }
`

module.exports = {
    productData,
    productByHandleData
}