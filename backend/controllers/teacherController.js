const Teacher = require('../models/Teacher');

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createTeacher = async (req, res) => {
    try {
        const teacher = new Teacher(req.body);
        await teacher.save();
        res.json(teacher);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateTeacher = async (req, res) => {
    try {
        const updated = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteTeacher = async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
