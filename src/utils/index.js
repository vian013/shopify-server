const fetchApi = require("./fetchApi")
const process = require("./process")

const delay = (time) => {
    return new Promise(resolve => setTimeout(() => resolve(), time))
}

module.exports = {
    fetchApi,
    process,
    delay
}