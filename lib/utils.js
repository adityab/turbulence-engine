removeKeyRecursively = function removeKeyRecursively(data, key) {
    for(var property in data) {
        if(data.hasOwnProperty(property)) {
            if(property == key) {
                delete data[key];
            }
            else {
                if(typeof data[property] === "object") {
                    removeKeyRecursively(data[property], key);
                }
            }
        }
    }
}

