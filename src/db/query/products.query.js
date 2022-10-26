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


module.exports = {
    getProductsQuery,
    getProductByHandleQuery,
	getAllProductsQuery
}