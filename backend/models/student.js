const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: String,
    roll: { type: String, unique: true } // Ensure unique rolls
});

module.exports = mongoose.model('Student', studentSchema);
