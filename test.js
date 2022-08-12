const fetch = require("node-fetch")

const query = `
    {
        products(first:20) {
        edges {
            node {
            id
            }
        }
        }
    }
`
const variables = {}

const fetchAdminApi = async (query, variables={}) => {
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

const fetchStoreFrontApi = async (query, variables={}) => {
    const res = await fetch("https://kevin013.myshopify.com/api/2022-07/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": "e3b382f282ff55c62fe5ef666274306a"
        },
        body: JSON.stringify({query, variables}),
    })
    const data = await res.json()
    return data
}

const getAllProductsQuery = (endCursor) => {
    return `
    {
        products(first: 20 ${endCursor&&`, after: "${endCursor}"`}) {
            pageInfo{
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              description
              featuredImage {
                id
                url
              }
              handle
              vendor
              totalInventory
              variants(first: 20) {
                edges {
                  node {
                    id,
                    selectedOptions {
                      name,
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
  }

const fetchAll = async () => {
    let hasNext = true
    let products = []
    let endCursor = ""
    console.log("fetch");

    while (hasNext) {
        const data = await fetchAdminApi(getAllProductsQuery(endCursor))
        console.log(data);
        const _products = data.data.products.edges.map(edge => edge.node)
        // console.log(_products);
        products =[...products, ..._products]
        hasNext = data.data.products.pageInfo.hasNextPage
        endCursor = data.data.products.pageInfo.endCursor
        console.log("hasNext", hasNext);
        console.log("endCursor", endCursor);
        await delay(4000)
    }

    return products
}

const delay = (time) => {
    return new Promise(resolve => setTimeout(() => resolve(), time))
}

const handle = async () => {
    const res = await fetchAll()
    console.log(res);
}

handle()