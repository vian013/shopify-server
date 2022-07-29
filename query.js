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

module.exports = {
    productsQuery,
    productByHandleQuery,
    productVariantsByHandleQuery,
    loginQuery,
    customerQuery
}