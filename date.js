
//short for module.exports
exports.getDate = function() {
    let today = new Date(); //number between 0 and 6
    
    let options = {
        weekday: 'long',
        day: "numeric",
        month: "long"
    };
    return today.toLocaleDateString("en-US", options);
}

module.exports.getDay = function() {
    let today = new Date(); //number between 0 and 6
    
    let options = {
        weekday: 'long'
    };
    return today.toLocaleDateString("en-US", options);
}