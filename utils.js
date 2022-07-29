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

module.exports = {
    compareObjects
}