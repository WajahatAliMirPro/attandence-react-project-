require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- MongoDB Atlas Connection -----------------
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("FATAL ERROR: MONGO_URI is not defined in .env file.");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB Atlas connection error:", err));

// ----------------- Schemas & Models -----------------
const studentSchema = new mongoose.Schema({
  name: String,
  roll: { type: String, unique: true } // Ensure unique rolls
});

const teacherSchema = new mongoose.Schema({
  name: String
});

const courseSchema = new mongoose.Schema({
  name: String,
  teacherId: String
});

const attendanceSchema = new mongoose.Schema({
  courseId: String,
  date: String,
  records: [{ studentId: String, status: String }]
});

const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Course = mongoose.model('Course', courseSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// ----------------- Routes -----------------

// ---- Students ----
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json(student);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/students/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- Teachers ----
app.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/teachers', async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.json(teacher);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/teachers/:id', async (req, res) => {
  try {
    const updated = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/teachers/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- Courses ----
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/courses', async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.json(course);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/courses/:id', async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    // Clean up related attendance
    await Attendance.deleteMany({ courseId: req.params.id });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- Attendance ----
app.get('/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.find();
    res.json(attendance);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/attendance', async (req, res) => {
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
});

app.delete('/attendance', async (req, res) => {
  const { courseId, date } = req.query;
  if (!courseId || !date) return res.status(400).json({ error: "Missing courseId or date" });
  
  try {
    await Attendance.deleteOne({ courseId, date });
    res.json({ message: "Attendance record deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));