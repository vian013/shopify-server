const { accountQueries } = require("../db/query")
const { fetchApi } = require("../utils")

const login = async(email, password) => {
    const query = loginQuery
    const variables = {
        "input": {
            "email": email,
            "password": password
        }
    }

    const data = await fetchApi.fetchStoreFrontApi(query, variables)
    const { customerUserErrors, customerAccessToken } = data.data.customerAccessTokenCreate
    if (customerAccessToken && customerUserErrors.length === 0) {
        const data = await fetchApi.fetchAdminApi(customerQuery(email))
        const customer = data.data.customers.edges[0].node
       return customer
    }
    if (!customerAccessToken && customerUserErrors.length > 0) {
        return null
    }
}

const getUser = async(userId) => {
    try {
        const result = await fetchApi.fetchAdminApi(getCustomerByIdQuery(userId))
        const user = result.data.customer
        return user
    } catch (error) {
        console.log(error);        
    }
}

const createUser = async(email, password, firstName, lastName) => {
    const variables = { 
        input: {
            email,
            password,
            firstName: firstName,
            lastName: lastName
        }
    }
    try {
        const result = await fetchApi.fetchStoreFrontApi(accountQueries.createAccountQuery, variables)
        const {data, errors} = result
        if(data.customerCreate) {
            const customer = data.customerCreate.customer
            const customerErrors = data.customerCreate.customerUserErrors

            if(customer) return customer
            if (customerErrors.length > 0) throw new Error({message: customerErrors[0].message})
        }

        if (errors) throw new Error({ message: "Cannot create account" })
    } catch (error) {
        throw error
    }
}

module.exports = {
    login,
    createUser,
    getUser
}