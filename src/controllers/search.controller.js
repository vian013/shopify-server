const { handleSearch } = require("../services/search.service");

const getSearch = async (req, res) => {
    try {
        const { term } = req.query
        const result = handleSearch(term)

        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getSearch
}