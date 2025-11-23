const Attendance = require('../models/Attendance');

exports.getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find();
        res.json(attendance);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.saveAttendance = async (req, res) => {
    const { courseId, date, records } = req.body;
    try {
        let existing = await Attendance.findOne({ courseId, date });
        if (existing) {
            existing.records = records;
            await existing.save();
            res.json(existing);
        } else {
            const newAtt = new Attendance({ courseId, date, records });
            await newAtt.save();
            res.json(newAtt);
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteAttendance = async (req, res) => {
    const { courseId, date } = req.query;
    if (!courseId || !date) return res.status(400).json({ error: "Missing courseId or date" });

    try {
        await Attendance.deleteOne({ courseId, date });
        res.json({ message: "Attendance record deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
