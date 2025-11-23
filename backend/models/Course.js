const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: String,
    teacherId: String
});

module.exports = mongoose.model('Course', courseSchema);
