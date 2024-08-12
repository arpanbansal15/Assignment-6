const Sequelize = require('sequelize');

// Sequelize instance
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'UqPJky1mSv2R', {
    host: 'ep-lucky-fire-a5w961qy.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    course: Sequelize.INTEGER // Added to match the foreign key
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Define the relationship
Course.hasMany(Student, { foreignKey: 'course' });
Student.belongsTo(Course, { foreignKey: 'course' });

// Initialize the database and sync models
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => resolve())
        .catch(() => reject("unable to sync the database"));
    });
}

// Get all students
function getAllStudents() {
    return new Promise((resolve, reject) => {
        Student.findAll()
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
}

// Get students by course
function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { course: course }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
}

// Get a student by number
function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { studentNum: num }
        })
        .then(data => resolve(data[0]))
        .catch(() => reject("no results returned"));
    });
}

// Get all courses
function getCourses() {
    return new Promise((resolve, reject) => {
        Course.findAll()
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
}

// Get a course by ID
function getCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.findAll({
            where: { courseId: id }
        })
        .then(data => resolve(data[0]))
        .catch(() => reject("no results returned"));
    });
}

// Add a student
function addStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false;
        for (let property in studentData) {
            if (studentData[property] === "") {
                studentData[property] = null;
            }
        }
        Student.create(studentData)
        .then(() => resolve())
        .catch(() => reject("unable to create student"));
    });
}

// Update a student
function updateStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false;
        for (let property in studentData) {
            if (studentData[property] === "") {
                studentData[property] = null;
            }
        }
        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        })
        .then(() => resolve())
        .catch(() => reject("unable to update student"));
    });
}

// Add a course
function addCourse(courseData) {
    return new Promise((resolve, reject) => {
        for (let property in courseData) {
            if (courseData[property] === "") {
                courseData[property] = null;
            }
        }
        Course.create(courseData)
        .then(() => resolve())
        .catch(() => reject("unable to create course"));
    });
}

// Update a course
function updateCourse(courseData) {
    return new Promise((resolve, reject) => {
        for (let property in courseData) {
            if (courseData[property] === "") {
                courseData[property] = null;
            }
        }
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
        .then(() => resolve())
        .catch(() => reject("unable to update course"));
    });
}

// Delete a course by ID
function deleteCourseById(id) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: { courseId: id }
        })
        .then(() => resolve())
        .catch(() => reject("unable to delete course"));
    });
}

// Delete a student by number
function deleteStudentByNum(studentNum) {
    return Student.destroy({ where: { studentNum } });
}

// Export all functions
module.exports = {
    initialize,
    getAllStudents,
    getStudentsByCourse,
    getStudentByNum,
    getCourses,
    getCourseById,
    addStudent,
    updateStudent,
    addCourse,
    updateCourse,
    deleteCourseById,
    deleteStudentByNum
};
