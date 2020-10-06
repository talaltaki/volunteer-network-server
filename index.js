const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9sjrg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello from Database");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const eventsCollection = client.db("volunteerNetwork").collection("events");
  const registeredEventsCollection = client
    .db("volunteerNetwork")
    .collection("registeredEvents");

  app.post("/addEvents", (req, res) => {
    const events = req.body;
    eventsCollection.insertMany(events).then((result) => {
      res.send(result.insertedCount);
    });
  });

  app.get("/events", (req, res) => {
    eventsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/register", (req, res) => {
    const newRegistration = req.body;
    registeredEventsCollection.insertOne(newRegistration).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/registered-events", (req, res) => {
    registeredEventsCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/all-registered", (req, res) => {
    registeredEventsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/delete/:id", (req, res) => {
    registeredEventsCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  app.post("/add-event", (req, res) => {
    const event = req.body;
    eventsCollection.insertOne(event).then((result) => {
      res.send(result.insertedCount);
    });
  });
});

app.listen(process.env.PORT || port);
