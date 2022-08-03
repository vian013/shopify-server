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
          }
        }
      }
      
    `
}

const cartQuery = (cartId) => {
  return `
    query {
      cart(
        id: "${cartId}"
      ) {
        id
        createdAt
        updatedAt
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  product {
                    id
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

module.exports = {
    productsQuery,
    productByHandleQuery,
    productVariantsByHandleQuery,
    loginQuery,
    customerQuery,
    createCartQuery,
    cartQuery
}