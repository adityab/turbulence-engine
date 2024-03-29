require('./utils.js');

// create an agent + content pair from the received object
function createAgent(object, callback) {
    agent = new TSchemas.Agent();
    ContentModel = TSchemas.model(object.data.agentType);
    contentObj = new ContentModel();

    // create a content object from data.content
    contentObj.create(object.data.content, function(err) {  if(err) callback(err);  else {
        // change the value of data.content to the ID of the content object, because that is what the schema wants
        object.data.content = contentObj._id;
        agent.create(object, function(err) {    if(err) callback(err);  else {
            callback(null, agent, contentObj);
        }});
    }});
};

// save an agent + content pair and return the saved agent's ID in a callback
function saveAgent(agent, content, callback) {
    // save content first
    content.save( function(err) {   if(err) callback(err);  else {
        // save agent next
        agent.save( function(err) { 
            // if could not save agent, get content out of system
            if(err) content.remove( function() { callback(err); }); 
            else {
                // return successfully saved agent's ID for great good
                callback(null, agent._id);
            }
        });
    }});
};

register = function registerAgent(object, callback) {
    createAgent(object, function(err, agent, content) { if(err) callback(err);  else {
        saveAgent(agent, content, function(err, agentId) {  if(err) callback(err);  else {
            callback(null, agentId);
        }});
    }});
};

function makeJSON(agent, content, callback) {
    var result = agent.toJSON();
    result.data.content = content.toJSON();
    // We don't want the users to see the _id key in anything except the agent's top level
    removeKeyRecursively(result.data, '_id');
    callback(result);
}

getAgent = function (agentId, callback) {
    // Find Agent by ID
    TSchemas.Agent.findById(agentId, function(err, agent) { if(err) callback(err);  else {
        // Find agent's content in the agent.data.agentType collection
        TSchemas.model(agent.data.agentType).findById(agent.data.content, function(err, content) {
            if(err) callback(err);  else {
                makeJSON(agent, content, function(result) { 
                    callback(null, result);
                });
            }
        });
    }});
};

// Arbitrary mongo query API - needs a lot of testing and query detox
queryAgent = function(agentType, query, callback) {
    TSchemas.model(agentType).findOne(query, function(err, content) {   if(err) callback(err);  else {
        if(!content)
            callback(null, null);
        else {
            TSchemas.Agent.findOne({ 'data.content': content._id }, function(err, agent) {
                if(err) callback(err);  else {
                    makeJSON(agent, content, function(result) {
                        callback(null, result);
                    });
                }
            });
        }
    }});
};
