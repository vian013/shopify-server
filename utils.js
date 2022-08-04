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

const fetchAdminApi = async (query, variables={}) => {
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
            "X-Shopify-Storefront-Access-Token": "e3b382f282ff55c62fe5ef666274306a"
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