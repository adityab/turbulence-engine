require('./utils.js');

// create a post + content pair from the received object
function createPost(object, callback) {
    post = new TSchemas.Post();
    ContentModel = TSchemas.model(object.data.postType);
    contentObj = new ContentModel();
    
    // create a content object from data.content
    contentObj.create(object.data.content, function(err) {  if(err) callback(err);  else {
        // change the value of data.content to the ID of the content object, because that is what the schema wants
        object.data.content = contentObj._id;
        // create a post from the original object
        post.create(object, function(err) { if(err) callback(err);  else {
            callback(null, post, contentObj);
        }});
    }});
};

function savePost(post, content, callback) {
    // save content first
    content.save( function(err) {   if(err) callback(err);  else {
        // save post next
        post.save( function(err) {
            // if could not save post, get content out of system
            if(err) content.remove( function() { callback(err); });
            else {
                // return successfully created post's ID for great good
                callback(null, post._id);
            }
        });
    }});
};

publish = function publishPost(object, callback) {
    createPost(object, function(err, post, content) {   if(err) callback(err);  else {
        savePost(post, content, function(err, postId) { if(err) callback(err);  else {
            callback(null, postId);
        }});
    }});
};

function makeJSON(post, content, callback) {
    var result = post.toJSON();
    result.data.content = content.toJSON();
    // We don't want to users to see the _id key in anything except the post's top level
    removeKeyRecursively(result.data, '_id');
    callback(result);
}

getPost = function (postId, callback) {
    // Find Post by ID
    TSchemas.Post.findById(postId, function(err, post) {    if(err) callback(err); else {
        // Find post's content in the post.data.postType collection
        TSchemas.model(post.data.postType).findById(post.data.content, function(err, content) {
            if(err) callback(err);  else {
                makeJSON(post, content, function(result) {
                    callback(null, result);
                });
            }
        });
    }});
};


// Arbitrary mongo query API - needs a lot of testing and query detox
queryPostContentOne = function(postType, query, options, callback) {
    TSchemas.model(postType).findOne(query, options, function(err, content) {   if(err) callback(err);  else {
        TSchemas.Post.findOne({ 'data.content': content._id }, function(err, post) {
            if(err) callback(err);  else {
                makeJSON(post, content, function(result) {
                    callback(null, result);
                });
            }
        });
    }});
};

queryPost = function(query, options, callback) {
    var result = [];
    TSchemas.Post.find(query, {}, options, function(err, posts) {  if(err) callback(err);  else {
        if(!posts) {
            callback(null, result);
        }
        else {
        posts.forEach(function(post, index, array) {
            TSchemas.model(post.data.postType).findById(post.data.content, function(err, content) {
                if(err) callback(err);  
                else {
                    if(content) {
                        makeJSON(post, content, function(generated) {
                            console.log(generated._id);
                            result.push(generated);
                        });
                        if(index == array.length-1)
                            callback(null, result);
                    }
                }
            });
        });
        } // end else
    }});
}


// TODO: This has a heisenbug, it may or may not return all posts before moving on, copy the solution from the above function
queryPostContent = function(postType, query, options, callback) {
    var result = [];
    TSchemas.model(postType).find(query, {}, options).each( function(err, content) {  if(err) callback(err);  else {
        TSchemas.Post.findOne.findOne({'data.content': content_id}, function(err, post) {
            if(err) callback(err);  
            else {
                if(post) {
                    makeJSON(post, content, function(generated) {
                        result.push(generated);
                    });
                }
                else {
                    callback(null, result);
                }
            }
        });
    }});
}
