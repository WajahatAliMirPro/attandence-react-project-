import React, { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
    const [data, setData] = useState({
        students: [], // {_id, name, roll}
        teachers: [], // {_id, name}
        courses: [], // {_id, name, teacherId}
        attendance: [], // {courseId, date, records: [{studentId, status}]}
    });

    const [mode, setMode] = useState("home"); // home | management | student
    const [studentIdLogged, setStudentIdLogged] = useState(null);

    // Forms
    const [studentForm, setStudentForm] = useState({ name: "", roll: "" });
    const [teacherForm, setTeacherForm] = useState({ name: "" });
    const [courseForm, setCourseForm] = useState({ name: "", teacherId: "" });

    // Attendance UI
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [attendanceDraft, setAttendanceDraft] = useState({}); // {studentId: 'P'|'A'|'L'}

    // Search / UI helpers
    const [searchQ, setSearchQ] = useState("");

    // Load data from Backend
    const fetchData = async () => {
        try {
            const [sRes, tRes, cRes, aRes] = await Promise.all([
                axios.get(`${API_URL}/students`),
                axios.get(`${API_URL}/teachers`),
                axios.get(`${API_URL}/courses`),
                axios.get(`${API_URL}/attendance`),
            ]);
            setData({
                students: sRes.data,
                teachers: tRes.data,
                courses: cRes.data,
                attendance: aRes.data,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ---------- Student CRUD ----------
    const addStudent = async () => {
        if (!studentForm.name.trim() || !studentForm.roll.trim()) {
            alert("Please enter student name and roll.");
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/students`, studentForm);
            setData(prev => ({ ...prev, students: [...prev.students, res.data] }));
            setStudentForm({ name: "", roll: "" });
        } catch (err) {
            alert("Error adding student (Roll might duplicate): " + (err.response?.data?.error || err.message));
        }
    };

    const editStudent = async (id) => {
        const s = data.students.find((x) => x._id === id);
        if (!s) return;
        const newName = prompt("Student name", s.name);
        const newRoll = prompt("Student roll", s.roll);
        if (!newName || !newRoll) return;

        try {
            const res = await axios.put(`${API_URL}/students/${id}`, { name: newName.trim(), roll: newRoll.trim() });
            setData(prev => ({
                ...prev,
                students: prev.students.map(x => x._id === id ? res.data : x)
            }));
        } catch (err) {
            alert("Error updating student: " + (err.response?.data?.error || err.message));
        }
    };

    const deleteStudent = async (id) => {
        if (!confirm("Delete this student?")) return;
        try {
            await axios.delete(`${API_URL}/students/${id}`);
            setData(prev => ({
                ...prev,
                students: prev.students.filter((s) => s._id !== id)
            }));
        } catch (err) {
            console.error(err);
        }
    };

    // ---------- Teacher CRUD ----------
    const addTeacher = async () => {
        if (!teacherForm.name.trim()) {
            alert("Please enter teacher name.");
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/teachers`, teacherForm);
            setData(prev => ({ ...prev, teachers: [...prev.teachers, res.data] }));
            setTeacherForm({ name: "" });
        } catch (err) { console.error(err); }
    };

    const editTeacher = async (id) => {
        const t = data.teachers.find((x) => x._id === id);
        if (!t) return;
        const nn = prompt("Teacher name", t.name);
        if (!nn) return;
        try {
            const res = await axios.put(`${API_URL}/teachers/${id}`, { name: nn.trim() });
            setData(prev => ({
                ...prev,
                teachers: prev.teachers.map(x => x._id === id ? res.data : x)
            }));
        } catch (err) { console.error(err); }
    };

    const deleteTeacher = async (id) => {
        if (!confirm("Delete this teacher?")) return;
        try {
            await axios.delete(`${API_URL}/teachers/${id}`);
            setData(prev => ({
                ...prev,
                teachers: prev.teachers.filter((t) => t._id !== id),
                courses: prev.courses.map((c) => (c.teacherId === id ? { ...c, teacherId: "" } : c)),
            }));
        } catch (err) { console.error(err); }
    };

    // ---------- Course CRUD ----------
    const addCourse = async () => {
        if (!courseForm.name.trim()) {
            alert("Please enter course name.");
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/courses`, courseForm);
            setData(prev => ({ ...prev, courses: [...prev.courses, res.data] }));
            setCourseForm({ name: "", teacherId: "" });
        } catch (err) { console.error(err); }
    };

    const editCourse = async (id) => {
        const c = data.courses.find((x) => x._id === id);
        if (!c) return;
        const nn = prompt("Course name", c.name);
        if (!nn) return;
        try {
            const res = await axios.put(`${API_URL}/courses/${id}`, { name: nn.trim() });
            setData(prev => ({
                ...prev,
                courses: prev.courses.map(x => x._id === id ? res.data : x)
            }));
        } catch (err) { console.error(err); }
    };

    const deleteCourse = async (id) => {
        if (!confirm("Delete this course? This will remove its attendance records.")) return;
        try {
            await axios.delete(`${API_URL}/courses/${id}`);
            setData(prev => ({
                ...prev,
                courses: prev.courses.filter((c) => c._id !== id),
                attendance: prev.attendance.filter((a) => a.courseId !== id),
            }));
        } catch (err) { console.error(err); }
    };

    // ---------- Attendance ----------
    const loadAttendanceDraft = (courseId = selectedCourseId, date = selectedDate) => {
        if (!courseId) {
            setAttendanceDraft({});
            return;
        }
        const rec = data.attendance.find((a) => a.courseId === courseId && a.date === date);
        if (rec) {
            const map = {};
            rec.records.forEach((r) => (map[r.studentId] = r.status));
            setAttendanceDraft(map);
        } else {
            const map = {};
            data.students.forEach((s) => (map[s._id] = "A"));
            setAttendanceDraft(map);
        }
    };

    useEffect(() => {
        loadAttendanceDraft(selectedCourseId, selectedDate);
    }, [selectedCourseId, selectedDate, data.students.length, data.attendance]);

    const setStatus = (studentId, status) => {
        setAttendanceDraft({ ...attendanceDraft, [studentId]: status });
    };

    const saveAttendance = async () => {
        if (!selectedCourseId) {
            alert("Choose a course first.");
            return;
        }
        const records = Object.keys(attendanceDraft).map((sid) => ({
            studentId: sid,
            status: attendanceDraft[sid] || "A",
        }));

        try {
            const res = await axios.post(`${API_URL}/attendance`, {
                courseId: selectedCourseId,
                date: selectedDate,
                records
            });

            const idx = data.attendance.findIndex((a) => a.courseId === selectedCourseId && a.date === selectedDate);
            let updated = [...data.attendance];
            if (idx >= 0) updated[idx] = res.data;
            else updated.push(res.data);

            setData(prev => ({ ...prev, attendance: updated }));
            alert("Attendance saved.");
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        }
    };

    const deleteAttendanceFor = async (courseId, date) => {
        if (!confirm("Delete attendance record for this course & date?")) return;
        try {
            await axios.delete(`${API_URL}/attendance?courseId=${courseId}&date=${date}`);
            setData(prev => ({
                ...prev,
                attendance: prev.attendance.filter((a) => !(a.courseId === courseId && a.date === date))
            }));
            loadAttendanceDraft("", selectedDate);
            setSelectedCourseId("");
        } catch (err) { console.error(err); }
    };

    // ---------- Student side ----------
    const studentLoginByRoll = (roll) => {
        const s = data.students.find((x) => x.roll === roll.trim());
        if (!s) {
            alert("Student not found. Check roll number.");
            return;
        }
        setStudentIdLogged(s._id);
        setMode("student");
    };

    const getStudentAttendance = (sid) => {
        const res = [];
        data.attendance.forEach((a) => {
            const record = a.records.find((r) => r.studentId === sid);
            if (record) {
                const course = data.courses.find((c) => c._id === a.courseId);
                res.push({
                    courseName: course ? course.name : "(deleted/unknown)",
                    date: a.date,
                    status: record.status,
                });
            }
        });
        return res.sort((x, y) => y.date.localeCompare(x.date));
    };

    const Badge = ({ status }) => {
        const s = status === "P" ? "Present" : status === "A" ? "Absent" : "Leave";
        const bg = status === "P" ? "#10ca2fff" : status === "A" ? "#9b2a2aff" : "#fff3c4";
        return (
            <span className="badge" style={{ backgroundColor: bg }}>{s}</span>
        );
    };

    // ---------- Render ----------
    return (
        <div className="app-container">
            <div className="main-card">
                {/* Header */}
                <header className="header">
                    <div>
                        <h1 className="title">Attendance System — BSCS 4th Semester</h1>
                        <div className="subtitle">Connected to MongoDB Backend</div>
                    </div>
                    <div className="nav-buttons">
                        <button onClick={() => { setMode("home"); setStudentIdLogged(null); }}>Home</button>
                        <button onClick={() => { setMode("management"); setStudentIdLogged(null); }}>Management</button>
                        <button onClick={() => { setMode("student"); setStudentIdLogged(null); }}>Teacher</button>
                    </div>
                </header>

                {/* Image Placeholder (Moved inside JSX) */}
                {/* Note: Local paths like C:\... do not work in browsers. Use public folder or external URL */}
                <div className="banner-image">
                    {/* <img src="/download.jpg" alt="Campus Banner" /> */}
                    {/* Uncomment above if you put download.jpg in the 'public' folder */}
                    <div className="banner-placeholder">Campus Banner Area</div>
                </div>

                {/* Body */}
                {mode === "home" && (
                    <div className="home-view">
                        <h2>Welcome</h2>
                        <p>Select Management to add data and mark attendance. Select Student to login and view your attendance.</p>
                        <div className="home-cards">
                            <div className="card management-card">
                                <h3>Management</h3>
                                <p>Add students, teachers, courses, and mark attendance per course & date.</p>
                                <button onClick={() => setMode("management")}>Open Management</button>
                            </div>
                            <div className="card student-card">
                                <h3>Teacher</h3>
                                <p>Login by roll number to view your attendance.</p>
                                <button onClick={() => setMode("student")}>Open Student</button>
                            </div>
                        </div>
                    </div>
                )}

                {mode === "management" && (
                    <div>
                        <div className="management-layout">
                            {/* Left column: Register and lists */}
                            <div className="left-column">
                                <section className="section">
                                    <h3>Register Student</h3>
                                    <div className="input-group">
                                        <input placeholder="Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
                                        <input placeholder="Roll" value={studentForm.roll} onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })} />
                                    </div>
                                    <button className="add-btn" onClick={addStudent}>Add Student</button>
                                </section>

                                <section className="section">
                                    <h4>Students ({data.students.length})</h4>
                                    <input placeholder="Search by name or roll" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="search-input" />
                                    <div className="list-container">
                                        {data.students.filter(s => s.name.toLowerCase().includes(searchQ.toLowerCase()) || s.roll.includes(searchQ)).map((s) => (
                                            <div key={s._id} className="list-item">
                                                <div>
                                                    <div className="item-name">{s.name}</div>
                                                    <div className="item-sub">{s.roll}</div>
                                                </div>
                                                <div>
                                                    <button onClick={() => editStudent(s._id)}>Edit</button>
                                                    <button onClick={() => deleteStudent(s._id)} className="delete-btn">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                        {data.students.length === 0 && <div className="empty-msg">No students yet.</div>}
                                    </div>
                                </section>

                                <section className="section">
                                    <h3>Register Teacher</h3>
                                    <div className="input-group">
                                        <input placeholder="Teacher name" value={teacherForm.name} onChange={(e) => setTeacherForm({ name: e.target.value })} className="full-width" />
                                        <button onClick={addTeacher}>Add Teacher</button>
                                    </div>

                                    <h4 className="mt-4">Teachers ({data.teachers.length})</h4>
                                    <div className="list-container short-list">
                                        {data.teachers.map(t => (
                                            <div key={t._id} className="list-item">
                                                <div>{t.name}</div>
                                                <div>
                                                    <button onClick={() => editTeacher(t._id)}>Edit</button>
                                                    <button onClick={() => deleteTeacher(t._id)} className="delete-btn">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                        {data.teachers.length === 0 && <div className="empty-msg">No teachers yet.</div>}
                                    </div>
                                </section>
                            </div>

                            {/* Right column: Courses & Attendance */}
                            <div className="right-column">
                                <section className="section">
                                    <h3>Register Course</h3>
                                    <div className="input-group">
                                        <select value={courseForm.teacherId} onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })}>
                                            <option value="">Select teacher (optional)</option>
                                            {data.teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        </select>
                                        <input placeholder="Course name" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} />
                                    </div>
                                    <button className="add-btn" onClick={addCourse}>Add Course</button>

                                    <h4 className="mt-4">Courses ({data.courses.length})</h4>
                                    <div className="list-container short-list">
                                        {data.courses.map(c => (
                                            <div key={c._id} className="list-item">
                                                <div>
                                                    <div className="item-name">{c.name}</div>
                                                    <div className="item-sub">{data.teachers.find(t => t._id === c.teacherId)?.name || "(no teacher)"}</div>
                                                </div>
                                                <div>
                                                    <button onClick={() => editCourse(c._id)}>Edit</button>
                                                    <button onClick={() => deleteCourse(c._id)} className="delete-btn">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                        {data.courses.length === 0 && <div className="empty-msg">No courses yet.</div>}
                                    </div>
                                </section>

                                <section className="section">
                                    <h3>Mark Attendance (Per Course)</h3>
                                    <div className="attendance-controls">
                                        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                                            <option value="">Select course</option>
                                            {data.courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>

                                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                                        <button onClick={() => loadAttendanceDraft()}>Load</button>
                                        <button onClick={() => saveAttendance()}>Save</button>
                                        <button onClick={() => deleteAttendanceFor(selectedCourseId, selectedDate)} className="delete-btn">Delete</button>
                                    </div>

                                    <div className="attendance-table-container">
                                        {data.students.length === 0 && <div className="empty-msg">Add students to mark attendance.</div>}
                                        {data.students.length > 0 && (
                                            <table className="attendance-table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Roll</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.students.map(s => {
                                                        const st = attendanceDraft[s._id] || "A";
                                                        const rowClass = st === "P" ? "bg-green" : st === "A" ? "bg-red" : "bg-yellow";
                                                        return (
                                                            <tr key={s._id} className={rowClass}>
                                                                <td>{s.name}</td>
                                                                <td>{s.roll}</td>
                                                                <td>
                                                                    <select value={st} onChange={(e) => setStatus(s._id, e.target.value)}>
                                                                        <option value="P">Present</option>
                                                                        <option value="A">Absent</option>
                                                                        <option value="L">Leave</option>
                                                                    </select>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}

                {mode === "student" && (
                    <div>
                        {!studentIdLogged ? (
                            <div className="login-panel">
                                <h3>Student Login</h3>
                                <p>Enter your roll number to view attendance:</p>
                                <div className="input-group">
                                    <input id="rollInput" placeholder="Roll number" />
                                    <button onClick={() => {
                                        const el = document.getElementById("rollInput");
                                        if (!el) return;
                                        studentLoginByRoll(el.value);
                                    }}>Login</button>
                                </div>

                                <div className="mt-4">
                                    <h4>Quick list of students</h4>
                                    <div className="list-container short-list">
                                        {data.students.length === 0 && <div className="empty-msg">No students registered yet.</div>}
                                        {data.students.map(s => <div key={s._id} className="simple-item">{s.name} — {s.roll}</div>)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3>Student Dashboard</h3>
                                <div className="dashboard-header">
                                    <div>
                                        <strong>{data.students.find(s => s._id === studentIdLogged)?.name}</strong>
                                        <div className="item-sub">{data.students.find(s => s._id === studentIdLogged)?.roll}</div>
                                    </div>
                                    <div>
                                        <button onClick={() => { setStudentIdLogged(null); setMode("student"); }}>Logout</button>
                                        <button onClick={() => setMode("home")} className="ml-2">Home</button>
                                    </div>
                                </div>

                                <section className="section mt-4">
                                    <h4>Your Attendance</h4>
                                    <div className="list-container">
                                        {getStudentAttendance(studentIdLogged).length === 0 && <div className="empty-msg">No attendance recorded yet.</div>}
                                        {getStudentAttendance(studentIdLogged).map((r, idx) => (
                                            <div key={idx} className={`list-item ${r.status === "P" ? "bg-green-light" : r.status === "A" ? "bg-red-light" : "bg-yellow-light"}`}>
                                                <div>
                                                    <div className="item-name">{r.courseName}</div>
                                                    <div className="item-sub">{r.date}</div>
                                                </div>
                                                <div>
                                                    <Badge status={r.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer actions */}
                <footer className="footer">
                    <div className="footer-text">DB: MongoDB Atlas (Cloud)</div>
                    <div>
                        <button onClick={() => {
                            fetchData();
                            alert("Refreshed data from server.");
                        }} className="refresh-btn">Refresh Data</button>
                    </div>
                </footer>
            </div>
        </div>
    );
}