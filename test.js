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

// fetch("https://kevin013.myshopify.com/admin/api/2022-07/graphql.json", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "X-Shopify-Access-Token": "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"
//         },
//         body: JSON.stringify({query, variables})
// }).then(res => res.json())
// .then(data => console.log(data))

// fetch("https://kevin013.myshopify.com/api/2022-07/graphql.json", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "X-Shopify-Storefront-Access-Token": "e3b382f282ff55c62fe5ef666274306a"
//         },
//         body: JSON.stringify({query, variables}),
// }).then(res => res.json())
// .then(data => console.log(data))


console.log(typeof 0);
