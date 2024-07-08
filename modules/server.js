const fs = require('fs');
const path = require('path');

// Path to the data file
const dataFile = path.join(__dirname, 'data', 'students.json');

// Class to hold the data structure
class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

// Initialize function to load data from files
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/courses.json', 'utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses"); return;
            }

            fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students"); return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

// Function to get all students
module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.students);
    });
}

// Function to get teaching assistants (TAs)
module.exports.getTAs = function () {
    return new Promise((resolve, reject) => {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].TA === true) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
}

// Function to get all courses
module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.courses);
    });
};

// Function to get a student by their number
module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        var foundStudent = null;

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == num) {
                foundStudent = dataCollection.students[i];
            }
        }

        if (!foundStudent) {
            reject("query returned 0 results"); return;
        }

        resolve(foundStudent);
    });
};

// Function to get students by course
module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].course == course) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

// Function to add a new student
module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Set TA to false if undefined
        studentData.TA = studentData.TA === undefined ? false : studentData.TA;

        // Set studentNum to the length of students array + 261
        studentData.studentNum = dataCollection.students.length + 261;

        // Push the updated studentData object onto the dataCollection.students array
        dataCollection.students.push(studentData);

        // Write the updated students array back to the file
        fs.writeFile(path.join(__dirname, 'data', 'students.json'), JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}
