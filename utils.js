const fetch = require("node-fetch")

const compareObjects = function(o1, o2){
    for(const p in o1){
        if(o1.hasOwnProperty(p) ){
            if(!o2.hasOwnProperty(p)) return false
            if(o1[p] !== o2[p]){
                return false;
            }
        }
    }
   
    for(const p in o2){
        if(o2.hasOwnProperty(p) ){
            if(!o1.hasOwnProperty(p)) return false
            if(o1[p] !== o2[p]){
                return false;
            }
        }
    }
    
    return true;
};

const fetchAdminApi = async (query, variables) => {
    const res = await fetch("https://kevin013.myshopify.com/admin/api/2022-07/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": "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"
        },
        body: JSON.stringify({query, variables})
    })
    const data = await res.json()
    return data
}

const fetchStoreFrontApi = async (query, variables={}) => {
    const res = await fetch("https://kevin013.myshopify.com/api/2022-07/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": "a2dd507dc76d0a2fad44319092092001"
        },
        body: JSON.stringify({query, variables}),
    })
    const data = await res.json()
    return data
}

module.exports = {
    compareObjects,
    fetchAdminApi,
    fetchStoreFrontApi
}