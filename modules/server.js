const express = require('express');
const path = require('path');
const collegeData = require('./collegeData');
const bodyParser = require('body-parser'); 

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views/home.html'));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, 'views/about.html'));
});

app.get("/htmlDemo", (req, res) => {
    res.sendFile(path.join(__dirname, 'views/htmlDemo.html'));
});

app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course).then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({ message: "no results" });
        });
    } else {
        collegeData.getAllStudents().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({ message: "no results" });
        });
    }
});

app.get("/students/add", (req, res) => {
    res.sendFile(path.join(__dirname, 'views/addStudent.html'));
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body).then(() => {
        res.redirect("/students");
    }).catch((err) => {
        res.status(500).send("Unable to add student: " + err);
    });
});

app.get("/tas", (req, res) => {
    collegeData.getTAs().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({ message: "no results" });
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

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on port ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log(`Unable to start server: ${err}`);
});
