// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- MongoDB Connection -----------------
mongoose.connect('mongodb://127.0.0.1:27017/attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Database connected"))
.catch((err) => console.log("DB connection error:", err));

// ----------------- Schemas -----------------
const studentSchema = new mongoose.Schema({
  name: String,
  roll: String
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

// ----------------- Models -----------------
const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Course = mongoose.model('Course', courseSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// ----------------- Routes -----------------

// ---- Students ----
app.get('/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/students', async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json(student);
});

// ---- Teachers ----
app.get('/teachers', async (req, res) => {
  const teachers = await Teacher.find();
  res.json(teachers);
});

app.post('/teachers', async (req, res) => {
  const teacher = new Teacher(req.body);
  await teacher.save();
  res.json(teacher);
});

// ---- Courses ----
app.get('/courses', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

app.post('/courses', async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json(course);
});

// ---- Attendance ----
app.get('/attendance', async (req, res) => {
  const attendance = await Attendance.find();
  res.json(attendance);
});

app.post('/attendance', async (req, res) => {
  const { courseId, date, records } = req.body;
  const existing = await Attendance.findOne({ courseId, date });
  if (existing) {
    existing.records = records;
    await existing.save();
    res.json(existing);
  } else {
    const newAtt = new Attendance({ courseId, date, records });
    await newAtt.save();
    res.json(newAtt);
  }
});

// ----------------- Start Server -----------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
