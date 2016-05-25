var express 		= require('express');
var path 		= require("path");
var bodyParser 		= require("body-parser");
var mongodb 		= require("mongodb");
var app 		= express();
var MongoClient 	= require('mongodb').MongoClient;
var mongo_url     	= 'mongodb://ec2-52-32-94-239.us-west-2.compute.amazonaws.com:27017,ec2-52-36-194-149.us-west-2.compute.amazonaws.com:27017/users?replicaSet=replicaset';
var ObjectID 		= mongodb.ObjectID;



var COLLECTION = "users";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

var db;

mongodb.MongoClient.connect(mongo_url, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

app.get("/users", function(req, res) {
  db.collection(COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });

});

app.get("/:servername/users",function(req,res) {
    db.collection(COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
			
});

app.post("/users", function(req, res) {
  console.log("in post for users");
  var newUser= req.body;
  
  if (!(req.body.username)) {
    res.send("error");
    //(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(COLLECTION).insertOne(newUser, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
  
});


app.get("/users/:username", function(req, res) {
  var uname = req.params.username ;
  db.collection(COLLECTION).findOne({ username: uname }, function(err, doc) {
    if (err) {
      res.send("User does not exist");
      //handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);
    }
  });
});


app.put("/users/:username", function(req, res) {
  var updateDoc = req.body ; 
  var uname     = req.params.username ;
  //delete updateDoc.username;

  db.collection(COLLECTION).updateOne({username: uname }, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/users/:username", function(req, res) {
  console.log("In delete function");
  var uname     = req.params.username ;
  db.collection(COLLECTION).deleteOne({ username : uname }, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});

/*
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
*/
