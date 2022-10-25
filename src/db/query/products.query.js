const { productData, productByHandleData } = require("../data");

const getProductsQuery = (limit) => `
{
	products(first:${limit}) {
	  edges {
	    node {
          ${productData(5)}
	    }
	  }
	} 
}
`

const getProductByHandleQuery = (handle) => `
  {
    productByHandle(handle: "${handle}") {
      ${productByHandleData(5, 5)}
	}
}
`

module.exports = {
    getProductsQuery,
    getProductByHandleQuery
}