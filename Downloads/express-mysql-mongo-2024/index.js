//index.js
//G00413222
// Importing required modules
var express = require("express");
var app = express();

// Importing express-validator for input validation
const { body, validationResult } = require("express-validator");

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Setting up the view engine
let ejs = require("ejs");
app.set("view engine", "ejs");

// I stored this in my services folder
const mysqlDAO = require("./services/mysqlDAO.js");
const mongoDAO = require("./services/mongoDAO.js");

// Route to render the home page
app.get("/", (req, res) => {
  res.render("home");
});

// isplay all students
app.get("/students", (req, res) => {
  mysqlDAO
    .findAll()
    .then((students) => res.render("students", { students }))
    .catch((error) => {
      console.error("Error fetching students:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// Fetch and display a student's details for editing
app.get("/students/edit/:sid", (req, res) => {
  const sid = req.params.sid;
  mysqlDAO
    .findById(sid)
    .then((student) => {
      if (student.length === 0) return res.status(404).send("Student not found");
      res.render("editStudent", { student: student[0], errors: [] });
    })
    .catch((error) => {
      console.error("Error fetching student:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// Update a student's details
app.post(
  "/students/edit/:sid",//students,edit,soid
  [
    body("name").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),//name
    body("age").isInt({ min: 18 }).withMessage("Age must be 18 or older"),//Age
  ],
  (req, res) => {
    const sid = req.params.sid;
    const { name, age } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("editStudent", {
        student: { sid, name, age },
        errors: errors.array(),
      });
    }

    mysqlDAO
      .updateStudent(sid, name, age)
      .then(() => res.redirect("/students"))
      .catch((error) => {
        console.error("Error updating student:", error.message);
        res.status(500).send("Internal Server Error");
      });
  }
);

// Render the Add Student page
app.get("/students/add", (req, res) => {
  res.render("addStudent", { student: {}, errors: [] });
});

// Add a new student
app.post(
  "/students/add",
  [
    body("sid").isLength({ min: 4, max: 4 }).withMessage("ID must be 4 characters"),
    body("name").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("age").isInt({ min: 18 }).withMessage("Age must be 18 or older"),
  ],
  (req, res) => {
    const { sid, name, age } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("addStudent", {
        student: { sid, name, age },
        errors: errors.array(),
      });
    }
//mysqlDAO
    mysqlDAO
      .findById(sid)
      .then((existingStudent) => {
        if (existingStudent.length > 0) {
          return res.render("addStudent", {
            student: { sid, name, age },
            errors: [{ msg: "Student with this ID already exists" }],
          });
        }
        return mysqlDAO
          .addStudent(sid, name, age)
          .then(() => res.redirect("/students"))
          .catch((error) => {
            console.error("Error adding student:", error.message);
            res.status(500).send("Internal Server Error");
          });
      })
      .catch((error) => {
        console.error("Error checking student ID:", error.message);
        res.status(500).send("Internal Server Error");
      });
  }
);

// Fetch and display grouped and sorted grades
app.get("/grades", (req, res) => {
  mysqlDAO
    .findAllGrades()
    .then((grades) => {
      const groupedGrades = grades.reduce((acc, item) => {
        if (!acc[item.studentName]) acc[item.studentName] = [];
        if (item.moduleName) {
          acc[item.studentName].push({ moduleName: item.moduleName, grade: item.studentGrade });
        }
        return acc;
      }, {});

      const sortedGroupedGrades = Object.keys(groupedGrades)
        .sort()
        .reduce((acc, name) => {
          acc[name] = groupedGrades[name].sort((a, b) => a.grade - b.grade);
          return acc;
        }, {});

      res.render("grades", { groupedGrades: sortedGroupedGrades });
    })
    .catch((error) => {
      console.error("Error fetching grades:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// Fetch and display lecturers
app.get("/lecturers", (req, res) => {
  mongoDAO
    .findAllLecturers()
    .then((lecturers) => {
      lecturers.sort((a, b) => (a._id > b._id ? 1 : a._id < b._id ? -1 : 0));
      res.render("lecturers", { lecturers });
    })
    .catch((error) => {
      console.error("Error fetching lecturers:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// Delete a lecturer if eligible
app.get("/lecturers/delete/:lid", (req, res) => {
  const lid = req.params.lid;
  mysqlDAO
    .lecturerTeachesModules(lid)
    .then((teachesModules) => {
      if (teachesModules) {
        return mongoDAO.findAllLecturers().then((lecturers) => {
          res.render("lecturers", { lecturers, error: lid });
        });
      }
      return mongoDAO.deleteLecturer(lid).then(() => res.redirect("/lecturers"));
    })
    .catch((error) => {
      console.error("Error deleting lecturer:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// Render the Add Lecturer page
app.get("/lecturers/add", (req, res) => {
  res.render("addLecturer", { lecturer: {}, errors: [] });
});

// Add a new lecturer
app.post(
  "/lecturers/add",
  [
    body("_id").isLength({ min: 4, max: 4 }).withMessage("ID must be 4 characters"),//4 charactera
    body("name").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),// 2 characters
    body("did").isLength({ min: 3, max: 3 }).withMessage("Department ID must be 3 characters"),//3 characters
  ],
  (req, res) => {
    const { _id, name, did } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("addLecturer", { lecturer: { _id, name, did }, errors: errors.array() });
    }

    mongoDAO
      .addLecturer({ _id, name, did })
      .then(() => res.redirect("/lecturers"))
      .catch((error) => {
        console.error("Error adding lecturer:", error.message);
        res.render("addLecturer", {
          lecturer: { _id, name, did },
          errors: [{ msg: "Error adding lecturer to the database" }],
        });
      });
  }
);

// Start the server using port 3004
const PORT = 3004;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
