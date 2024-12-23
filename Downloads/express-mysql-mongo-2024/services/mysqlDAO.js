// Import the mysql 
const mysql = require("mysql");

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 2,
  host: "localhost",// Database host
  user: "root",// Database username
  password: "root",// Database password
  database: "proj2024mysql",// Database name
});


function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
         // Log and reject the error if query fails
      if (err) {
        console.log("CATCH=>" + JSON.stringify(err));
        return reject(err);
      }
    // Log and resolve the results if the query is successful
      console.log("THEN=>" + JSON.stringify(results));
      resolve(results);
    });
  });
}

//Function to retrieve all students sorted alphabetically by their student ID
var findAll = function () {
  const sql = "SELECT * FROM student ORDER BY sid ASC";// SQL query to fetch students
  return query(sql);// Execute and return the query result
};

// Fetch a student by their unique student ID (sid)
var findById = function (sid) {
  const sql = "SELECT * FROM student WHERE sid = ?";
  return query(sql, [sid]);//THis returns the result
};

// Update a student by ID
var updateStudent = function (sid, name, age) {
  const sql = "UPDATE student SET name = ?, age = ? WHERE sid = ?";
  return query(sql, [name, age, sid]);// Execute the query with parameters
};

// Add a new student
var addStudent = function (sid, name, age) {
  const sql = "INSERT INTO student (sid, name, age) VALUES (?, ?, ?)";// SQL query to add a student

  return query(sql, [sid, name, age]);// Execute the query with student details
};

// studenta,modules,grades
var findAllGrades = function () {
  const sql = `
    SELECT 
      student.name AS studentName,  
      module.name AS moduleName,
      grade.grade AS studentGrade
    FROM student
    LEFT JOIN grade ON student.sid = grade.sid
    LEFT JOIN module ON grade.mid = module.mid
    ORDER BY student.name ASC, grade.grade ASC;
  `;
  return query(sql); // Execute and return the query result
};

//  lecturer ID
var lecturerTeachesModules = function (lid) {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM module WHERE lecturer = ?",
      [lid],// Lecturer ID parameter
      (error, results) => {
        if (error) {
          return reject(error);// Reject if there's an error
        }
        resolve(results.length > 0);
      }
    );
  });
};

// Module Exports
module.exports = {
  findAll,
  findById,
  updateStudent,
  addStudent,
  findAllGrades,
  lecturerTeachesModules,
};