const { accountService } = require("../services")

const postLogin = async (req, res) => {
    const { email, password } = req.body

    try {
        const customer = accountService.login(email, password)
        if(customer) {
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.cookie("sid", customer.id)
            res.status(200).json(customer)
        } else throw new Error({
            error: "Invalid email or password!"
        })
    } catch (error) {
        res.status(400).json(error)
    }
}

const postLogout = (req, res) => {
    res.clearCookie("sid", {domain: "localhost", path: "/"})
    res.status(200).json({})
}

const getUser = async (req, res) => {
    const { id } = req.query
    const { sid } = req.cookies
    const userId = id || sid
    if (!userId) return
    try {
        const result = await fetchAdminApi(getCustomerByIdQuery(userId))
        const user = result.data.customer
        res.status(200).json(user)
    } catch (error) {

    }
}

const postUser = async(req, res) => {
    const {email, password, firstName, lastName} = req.body

    try {
        const customer = accountService.createUser(email, password, firstName, lastName)
        if(customer) {
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.cookie("sid", customer.id)
            res.status(201).json(customer)
        }
    } catch (error) {
        res.status(400).json(error)
    }
}

module.exports = {
    postLogin,
    postLogout,
    getUser,
    postUser
}