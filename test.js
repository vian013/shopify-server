const a = {
    x: 1,
    y: 2
}

const c = {
    x: 1,
    y: 2,
}

const fn = function() {
}

fn.prototype.x = 1
fn.prototype.y = 2

const b = new fn()

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

console.log(compareObjects(a, c));