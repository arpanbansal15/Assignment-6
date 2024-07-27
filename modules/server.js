/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Arpan Bansal Student ID: 133554238 Date: 26/07/2024
*
* Online (vercel) Link: ________________________________________________________
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
        equal: function (lvalue, rvalue, options) {
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

app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course).then((data) => {
            res.render('students', { students: data });
        }).catch((err) => {
            res.render('students', { message: "no results" });
        });
    } else {
        collegeData.getAllStudents().then((data) => {
            res.render('students', { students: data });
        }).catch((err) => {
            res.render('students', { message: "no results" });
        });
    }
});

app.get("/students/add", (req, res) => {
    res.render('addStudent');
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body).then(() => {
        res.redirect("/students");
    }).catch((err) => {
        res.status(500).send("Unable to add student: " + err);
    });
});

app.get("/courses", (req, res) => {
    collegeData.getCourses().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({ message: "no results" });
    });
});

app.get("/student/:num", (req, res) => {
    collegeData.getStudentByNum(req.params.num).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({ message: "no results" });
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize data and start server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on port ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log(`Unable to start server: ${err}`);
});
