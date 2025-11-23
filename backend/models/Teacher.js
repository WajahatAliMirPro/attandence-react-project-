const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true }, // sparse allows null/undefined to not conflict
    password: { type: String }
});

module.exports = mongoose.model('Teacher', teacherSchema);
