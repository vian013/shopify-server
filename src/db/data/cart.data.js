const cartData = `
  id
  createdAt
  updatedAt
  totalQuantity
  cost {
    subtotalAmount {
      amount
    }
    totalAmount {
      amount
    }
    totalTaxAmount {
      amount
    }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        cost {
          totalAmount {
            amount
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            priceV2 {
              amount
            }
            product {
              productId: id 
              title
              featuredImage {
                id
                url
              }
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
`

module.exports = {
    cartData
}