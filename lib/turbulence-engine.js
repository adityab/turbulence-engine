TSchemas = require('turbulence-schemas');

require('./agents.js');
require('./posts.js');

module.exports.connect = function(server, db, callback) {
    mongoose.connect('mongodb://' + server + '/' + db, callback);
}

module.exports.disconnect = function() {
    mongoose.disconnect();
}

module.exports.registerAgent = registerAgent;
module.exports.publishPost = publishPost;
