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

publishPost = function publishPost(object, callback) {
    createPost(object, function(err, post, content) {   if(err) callback(err);  else {
        savePost(post, content, function(err, postId) { if(err) callback(err);  else {
            callback(null, postId);
        }});
    }});
};

