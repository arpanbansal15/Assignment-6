const fs = require("fs");
const path = require('path');

const dataFile = path.join(__dirname, 'data', 'students.json');
const coursesFile = path.join(__dirname, 'data', 'courses.json');

class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile(coursesFile, 'utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses"); return;
            }

            fs.readFile(dataFile, 'utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students"); return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.students);
    });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.courses);
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        const foundStudent = dataCollection.students.find(student => student.studentNum == num);

        if (!foundStudent) {
            reject("query returned 0 results"); return;
        }

        resolve(foundStudent);
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        const filteredStudents = dataCollection.students.filter(student => student.course == course);

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        fs.readFile(dataFile, 'utf8', (err, data) => {
            if (err) return reject(err);
            let students = JSON.parse(data);
            studentData.studentNum = students.length + 1;
            students.push(studentData);
            fs.writeFile(dataFile, JSON.stringify(students, null, 2), (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        const foundCourse = dataCollection.courses.find(course => course.courseId == id);

        if (!foundCourse) {
            reject("query returned 0 results"); return;
        }

        resolve(foundCourse);
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        fs.readFile(dataFile, 'utf8', (err, data) => {
            if (err) return reject(err);
            let students = JSON.parse(data);

            let studentIndex = students.findIndex(student => student.studentNum == studentData.studentNum);
            if (studentIndex === -1) {
                reject("Student not found");
                return;
            }

            // Update the student data
            students[studentIndex].firstName = studentData.firstName;
            students[studentIndex].lastName = studentData.lastName;
            students[studentIndex].email = studentData.email;
            students[studentIndex].addressStreet = studentData.addressStreet;
            students[studentIndex].addressCity = studentData.addressCity;
            students[studentIndex].addressProvince = studentData.addressProvince;
            students[studentIndex].TA = !!studentData.TA; // Convert to boolean
            students[studentIndex].status = studentData.status;
            students[studentIndex].course = studentData.course;

            fs.writeFile(dataFile, JSON.stringify(students, null, 2), (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};
