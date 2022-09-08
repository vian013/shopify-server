const productsQuery = `
{
	products(first:50) {
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
          variants(first:5) {
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
	    }
	  }
	} 
}
`

const productByHandleQuery = (handle) => `
  {
    productByHandle(handle: "${handle}") {
      id
      title
      description
      featuredImage {
        id
        url
      }
      images(first: 5) {
        edges {
          node {
            id
            url
          }
        }
      }
      handle
      variants(first:5) {
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
	}
}
`

const productVariantsByHandleQuery = (handle) => `
    {
        productByHandle(handle: "${handle}") {
            id
            variants(first:5) {
                edges {
                    node {
                        id
                        selectedOptions{
                            name
                            value
                        }   
                    }
                }
            }
        }
    }
`

const loginQuery = `
        mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
            customerAccessTokenCreate(input: $input) {
            customerUserErrors {
                code
                field
                message
            }
            customerAccessToken {
                accessToken
                expiresAt
            }
            }
        }
    `
const customerQuery = (email) => {
    return `
    {
        customers(first: 1, query: "email:${email}") {
            edges {
                node {
                    id
                    email
                    lastName
                    firstName
                }
            }
        } 
    }
`
} 

const createCartQuery = (variantId, quantity) => {
    return `
    mutation {
        cartCreate(
          input: {
            lines: [
              {
                quantity: ${quantity}
                merchandiseId: "${variantId}"
              }
            ]
            attributes: { key: "cart_attribute", value: "This is a cart attribute" }
          }
        ) {
          cart {
            id
            createdAt
            updatedAt
            lines(first: 10) {
              edges {
                node {
                  id
                  merchandise {
                    ... on ProductVariant {
                      id
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

const addToCartQuery = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          totalQuantity
          lines(first: 20) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `
const updateCartQuery = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          totalQuantity
          lines(first: 20) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `
const deleteCartItemQuery = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        lines(first: 20) {
          edges {
            node {
              id
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const cartQuery = (cartId) => {
  return `
    query {
      cart(
        id: "${cartId}"
      ) {
        id
        createdAt
        updatedAt
        totalQuantity
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  product {
                    productId: id 
                    title
                  }
                }
              }
              attributes {
                key
                value
              }
            }
          }
        }
        attributes {
          key
          value
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
        }
        buyerIdentity {
          email
          phone
          customer {
            id
          }
          countryCode
        }
      }
    }
  
  `
}

const getAllProductsQuery = (endCursor) => {
  return `
  {
      products(first: 18, reverse: true, ${endCursor&&`, after: "${endCursor}"`}) {
          pageInfo{
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            description
            images(first: 5) {
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
            variants(first: 15) {
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
    }
  `
}

const getCollectionsQuery = `
{
  collections(first: 5) {
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
        products(first: 20) {
          edges {
            node{
              id
              title
              description
              images(first: 5) {
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
              variants(first: 15) {
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
      }
    }
  `
}

const blogArticlesByHandleQuery = (handle) => {
  return `
    {
      blog(handle: "${handle}") {
        id
        articles(first: 5) {
          edges {
            node {
              id
              contentHtml
              image {
                id
                url
              }
              title
              authorV2 {
                name
              }
              publishedAt,
              handle
            }
          }
        }
      }
  }
  `
}

module.exports = {
    productsQuery,
    productByHandleQuery,
    productVariantsByHandleQuery,
    loginQuery,
    customerQuery,
    createCartQuery,
    cartQuery,
    addToCartQuery,
    updateCartQuery,
    deleteCartItemQuery,
    getAllProductsQuery,
    getCollectionProductsQuery,
    blogArticlesByHandleQuery,
    getCollectionsQuery
}