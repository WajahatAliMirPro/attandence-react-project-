const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    courseId: String,
    date: String,
    records: [{ studentId: String, status: String }]
});

module.exports = mongoose.model('Attendance', attendanceSchema);
