const { blogData } = require("../data")

const getBlogArticlesByHandleQuery = (startCursor, endCursor) => {
    const cursorInput = () => {
        if (!startCursor && endCursor) return `first: 9, after: "${endCursor}"`
        if (startCursor && !endCursor) return `last: 9, before: "${startCursor}"`
        return "first: 9"
      }

      return `
      {
        articles(${cursorInput()}) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              ${blogData}
            }
          }
        }
      }
    `
}

const getBlogArticlesByTagQuery = (startCursor, endCursor, tag) => {
    const cursorInput = () => {
        if (!startCursor && endCursor) return `first: 9, after: "${endCursor}"`
        if (startCursor && !endCursor) return `last: 9, before: "${startCursor}"`
        return "first: 9"
      }

      return `
      {
        articles(${cursorInput()}, query:"tag:${tag}") {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              ${blogData}
            }
          }
        }
      }
    `
}

module.exports = {
    getBlogArticlesByHandleQuery,
    getBlogArticlesByTagQuery
}