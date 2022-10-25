const { cartData } = require("../data")

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
                ${cartData}
            }
            }
        }
      
    `
}

const getCartQuery = (cartId) => {
    return `
      query {
        cart(
          id: "${cartId}"
        ) {
        ${cartData}
        }
      }
    `
}

const addToCartQuery = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${cartData}
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
            ${cartData}
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
        ${cartData}
      }
      userErrors {
        field
        message
      }
    }
  }
`

module.exports = {
    createCartQuery,
    getCartQuery,
    addToCartQuery,
    updateCartQuery,
    deleteCartItemQuery
}