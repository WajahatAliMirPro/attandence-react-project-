const Course = require('../models/Course');
const Attendance = require('../models/Attendance');

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.json(course);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateCourse = async (req, res) => {
    try {
        const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        // Clean up related attendance
        await Attendance.deleteMany({ courseId: req.params.id });
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
