turbulence-engine
=================

This module uses the core schemas, `Agent` and `Post`, defined in the `turbulence-schemas` module, and provides a rich API over them.

The module is derivative-model agnostic, because annotation models are accessed by their string-names, such as `agent_person`, `post_status`, and whatever other model you choose to define.

## Install

    npm install -g

## Usage

First off, connect to the Engine:

```js
Engine = require('turbulence-engine');
```

Next, Let's define two objects; one for an `Agent`:

```js
var agentObj = 
{
    data: {
        agentType: 'agent_person',
        content: {
            username: 'adityab',
            firstName: 'Aditya',
            lastName: 'Bhatt',
            identities: [ 
                            { key: 'email', val: 'aditya@adityabhatt.org' },
                            { key: 'twitter', val: 'aditya_bhatt' }
                        ]
        }
    }
};
```

and one for a `Post`:

```js
var postObj = 
{
    visibility: 'public',
    data: {
        postType: 'post_status',
        content: {
            text: 'This is my first test status to test the Turbulence extensible database.'
        }
    }
};
```

Normally, such objects would be sent from the client-side.
Let's define a function for some convenience:

```js
function logAndDisconnect(err) {
    console.log(err.message);
    Engine.disconnect();
}
```

Now we'll connect to `Engine`, register our `agentObj`, and publish the `postObj`.

```js
Engine.connect('localhost', 'turbulence_db', function(err) {    if(err) logAndDisconnect(err);   else {
    // register our agent on the database, and on success, print the agent's ID
    Engine.registerAgent(agentObj, function(err, agentID) {    if(err) logAndDisconnect(err);  else {
        console.log('agentID: ', agentID);
        // set our newly registered agent as the author of the post we will publish
        postObj.authorAgent = agentID;
        // publish our newly authored post to the database, and on success, print the post's ID
        Engine.publishPost(postObj, function(err, postID) {   if(err) logAndDisconnect(err);  else {
            console.log('postID: ', postID);
            // everything done. Now disconnect.
            Engine.disconnect();
        }});
    }});
}});
```

That's it.
