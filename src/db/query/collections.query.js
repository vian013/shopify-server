const { collectionByHandleData } = require("../data")

const getCollectionsQuery = (limit) => `
  {
    collections(first: ${limit}) {
        edges {
          node {
            id
            title
            image {
              id
              url
            }
            handle
          }
        }
      }
  }
`
const getCollectionProductsQuery = (handle) => {
    return `
      {
        collectionByHandle(handle: "${handle}") {
          id
          title
          ${collectionByHandleData()}
        }
      }
    `
  }

module.exports = {
    getCollectionsQuery,
    getCollectionProductsQuery
}