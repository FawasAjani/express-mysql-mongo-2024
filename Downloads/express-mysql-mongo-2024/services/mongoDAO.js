// Initialize MongoDB
const MongoClient = require("mongodb").MongoClient;
let db, coll;

// connection to MongoDB
MongoClient.connect("mongodb://127.0.0.1:27017")
  .then((client) => {
     // Access the database and the lecturers collection
    db = client.db("proj2024MongoDB");
    coll = db.collection("lecturers");
  })
  .catch((error) => {
    console.log(error.message);
  });

// Function to find all lecturers
var findAllLecturers = function () {
  return new Promise((resolve, reject) => {
    coll
      .find()
      .toArray()// Convert the cursor to an array
      .then((documents) => {
        resolve(documents);// Return the list of lecturers
      })
      .catch((error) => {
        reject(error);// Reject if an error occurs
      });
  });
};

// Function to delete 
var deleteLecturer = function (id) {
  return new Promise((resolve, reject) => {
    coll
      .deleteOne({ _id: id })// Delete a single lecturer
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);// Delete a single lecturer
      });
  });
};

// Function to add a new lecturer
var addLecturer = function (lecturer) {
  return new Promise((resolve, reject) => {
    coll
      .insertOne(lecturer)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Export the MongoDB operation
module.exports = { findAllLecturers, deleteLecturer, addLecturer };