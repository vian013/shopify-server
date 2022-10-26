const { customerData } = require("../data")

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
const getCustomerByEmailQuery = (email) => `
{
    customers(first: 1, query: "email:${email}") {
        edges {
            node {
              ${customerData}
              numberOfOrders
            }
        }
    } 
}
`

const getCustomerByIdQuery = (id) => {
    return `
    {
      customer(id: "${id}") {
        ${customerData}
        numberOfOrders
      }
    }
`
} 

const createAccountQuery = `
  mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customerUserErrors {
          code
          field
          message
        }
        customer {
          ${customerData}
        }
      }
  }
`


module.exports = {
    loginQuery,
    customerQuery,
    getCustomerByEmailQuery,
    getCustomerByIdQuery,
    createAccountQuery
}