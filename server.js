/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Arpan Bansal Student ID: 133554238 Date: 26/07/2024
*
* Online (vercel) Link: https://vercel.com/arpan-bansals-projects/assignment-5
*
********************************************************************************/

const express = require('express');
const path = require('path');
const collegeData = require('./collegeData');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

const app = express();

// Define custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

const HTTP_PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to set active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Define routes
app.get("/", (req, res) => {
    res.render('home');
});

app.get("/about", (req, res) => {
    res.render('about');
});

app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

// Students Routes
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
            .then((data) => {
                res.render('students', { students: data.length > 0 ? data : null, message: data.length === 0 ? "no results" : null });
            })
            .catch(() => {
                res.render('students', { message: "no results" });
            });
    } else {
        collegeData.getAllStudents()
            .then((data) => {
                res.render('students', { students: data.length > 0 ? data : null, message: data.length === 0 ? "no results" : null });
            })
            .catch(() => {
                res.render('students', { message: "no results" });
            });
    }
});

app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            res.render('addStudent', { courses: courses });
        })
        .catch(() => {
            res.render('addStudent', { courses: [] });
        });
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            res.status(500).send("Unable to add student: " + err);
        });
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            res.status(500).send("Unable to update student: " + err);
        });
});

app.get("/student/:studentNum", (req, res) => {
    let viewData = {};
    collegeData.getStudentByNum(req.params.studentNum)
        .then((student) => {
            viewData.student = student || null;
            return collegeData.getCourses();
        })
        .then((courses) => {
            viewData.courses = courses || [];
            viewData.courses.forEach(course => {
                if (course.courseId === viewData.student?.course) {
                    course.selected = true;
                }
            });
            if (viewData.student === null) {
                res.status(404).send("Student Not Found");
            } else {
                res.render('student', { viewData });
            }
        })
        .catch(() => {
            res.status(500).send("Unable to retrieve data");
        });
});

// Course Routes
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then((data) => {
            res.render('courses', { courses: data.length > 0 ? data : null, message: data.length === 0 ? "no results" : null });
        })
        .catch(() => {
            res.render('courses', { message: "no results" });
        });
});

app.get("/courses/add", (req, res) => {
    res.render('addCourse');
});

app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((err) => {
            res.status(500).send("Unable to add course: " + err);
        });
});

app.get("/course/update/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then((data) => {
            if (data) {
                res.render('updateCourse', { course: data });
            } else {
                res.status(404).send("Course Not Found");
            }
        })
        .catch(() => {
            res.status(500).send("Unable to retrieve course data");
        });
});

app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((err) => {
            res.status(500).send("Unable to update course: " + err);
        });
});

app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then((data) => {
            if (data) {
                res.render('course', { course: data });
            } else {
                res.status(404).send("Course Not Found");
            }
        })
        .catch(() => {
            res.status(500).send("Unable to retrieve course data");
        });
});

app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => {
            res.redirect('/courses');
        })
        .catch(() => {
            res.status(500).send("Unable to remove course / Course not found");
        });
});

// Student deletion route
app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect('/students');
        })
        .catch(() => {
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize the data and start the server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("server listening on: " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.log("Unable to start server: " + err);
    });
