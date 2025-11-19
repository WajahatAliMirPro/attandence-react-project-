import React, { useEffect, useState } from "react";


export default function App() {
  const LS_KEY = "attendance_v2";
  
<img src="\Users\PC\Desktop\download.jpg" alt="SKD Campus" className="w-full h-56 object-cover rounded-md mb-4" />

  const [data, setData] = useState({
    students: [], // {id, name, roll}
    
    teachers: [], // {id, name}
    courses: [], // {id, name, teacherId}
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

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setData(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [data]);

  const uid = () => Math.random().toString(36).slice(2, 9);

  // ---------- Student CRUD ----------
  const addStudent = () => {
    if (!studentForm.name.trim() || !studentForm.roll.trim()) {
      alert("Please enter student name and roll.");
      return;
    }
    // unique roll check
    if (data.students.some((s) => s.roll === studentForm.roll.trim())) {
      alert("Roll number already exists.");
      return;
    }
    const newStudent = {
      id: uid(),
      name: studentForm.name.trim(),
      roll: studentForm.roll.trim(),
    };
    setData({ ...data, students: [...data.students, newStudent] });
    setStudentForm({ name: "", roll: "" });
  };

  const editStudent = (id) => {
    const s = data.students.find((x) => x.id === id);
    if (!s) return;
    const newName = prompt("Student name", s.name);
    const newRoll = prompt("Student roll", s.roll);
    if (!newName || !newRoll) return;
    // check roll unique (except self)
    if (
      data.students.some((x) => x.roll === newRoll.trim() && x.id !== id)
    ) {
      alert("Another student already uses this roll.");
      return;
    }
    setData({
      ...data,
      students: data.students.map((x) =>
        x.id === id ? { ...x, name: newName.trim(), roll: newRoll.trim() } : x
      ),
    });
  };

  const deleteStudent = (id) => {
    if (!confirm("Delete this student?")) return;
    setData({
      ...data,
      students: data.students.filter((s) => s.id !== id),
      // optionally remove attendance records referencing the student
      attendance: data.attendance.map((a) => ({
        ...a,
        records: a.records.filter((r) => r.studentId !== id),
      })),
    });
  };

  // ---------- Teacher CRUD ----------
  const addTeacher = () => {
    if (!teacherForm.name.trim()) {
      alert("Please enter teacher name.");
      return;
    }
    setData({
      ...data,
      teachers: [...data.teachers, { id: uid(), name: teacherForm.name.trim() }],
    });
    setTeacherForm({ name: "" });
  };

  const editTeacher = (id) => {
    const t = data.teachers.find((x) => x.id === id);
    if (!t) return;
    const nn = prompt("Teacher name", t.name);
    if (!nn) return;
    setData({
      ...data,
      teachers: data.teachers.map((x) => (x.id === id ? { ...x, name: nn.trim() } : x)),
    });
  };

  const deleteTeacher = (id) => {
    if (!confirm("Delete this teacher?")) return;
    // remove teacher assignment from courses that used them
    setData({
      ...data,
      teachers: data.teachers.filter((t) => t.id !== id),
      courses: data.courses.map((c) => (c.teacherId === id ? { ...c, teacherId: "" } : c)),
    });
  };

  // ---------- Course CRUD ----------
  const addCourse = () => {
    if (!courseForm.name.trim()) {
      alert("Please enter course name.");
      return;
    }
    const newCourse = {
      id: uid(),
      name: courseForm.name.trim(),
      teacherId: courseForm.teacherId || "",
    };
    setData({ ...data, courses: [...data.courses, newCourse] });
    setCourseForm({ name: "", teacherId: "" });
  };

  const editCourse = (id) => {
    const c = data.courses.find((x) => x.id === id);
    if (!c) return;
    const nn = prompt("Course name", c.name);
    if (!nn) return;
    setData({
      ...data,
      courses: data.courses.map((x) => (x.id === id ? { ...x, name: nn.trim() } : x)),
    });
  };

  const deleteCourse = (id) => {
    if (!confirm("Delete this course? This will remove its attendance records.")) return;
    setData({
      ...data,
      courses: data.courses.filter((c) => c.id !== id),
      attendance: data.attendance.filter((a) => a.courseId !== id),
    });
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
      // default Absent for all students
      const map = {};
      data.students.forEach((s) => (map[s.id] = "A"));
      setAttendanceDraft(map);
    }
  };

  useEffect(() => {
    // reload draft when course/date changes or students list changes
    loadAttendanceDraft(selectedCourseId, selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, selectedDate, data.students.length]);

  const setStatus = (studentId, status) => {
    setAttendanceDraft({ ...attendanceDraft, [studentId]: status });
  };

  const saveAttendance = () => {
    if (!selectedCourseId) {
      alert("Choose a course first.");
      return;
    }
    const records = Object.keys(attendanceDraft).map((sid) => ({
      studentId: sid,
      status: attendanceDraft[sid] || "A",
    }));
    const idx = data.attendance.findIndex((a) => a.courseId === selectedCourseId && a.date === selectedDate);
    let updated = [...data.attendance];
    if (idx >= 0) updated[idx] = { courseId: selectedCourseId, date: selectedDate, records };
    else updated.push({ courseId: selectedCourseId, date: selectedDate, records });
    setData({ ...data, attendance: updated });
    alert("Attendance saved.");
  };

  const deleteAttendanceFor = (courseId, date) => {
    if (!confirm("Delete attendance record for this course & date?")) return;
    setData({ ...data, attendance: data.attendance.filter((a) => !(a.courseId === courseId && a.date === date)) });
    loadAttendanceDraft("", selectedDate);
    setSelectedCourseId("");
  };

  // ---------- Student side ----------
  const studentLoginByRoll = (roll) => {
    const s = data.students.find((x) => x.roll === roll.trim());
    if (!s) {
      alert("Student not found. Check roll number.");
      return;
    }
    setStudentIdLogged(s.id);
    setMode("student");
  };

  const getStudentAttendance = (sid) => {
    const res = [];
    data.attendance.forEach((a) => {
      a.records.forEach((r) => {
        if (r.studentId === sid) {
          const course = data.courses.find((c) => c.id === a.courseId);
          res.push({
            courseName: course ? course.name : "(deleted)",
            date: a.date,
            status: r.status,
          });
        }
      });
    });
    return res.sort((x, y) => y.date.localeCompare(x.date));
  };

  // ---------- Small UI components ----------
  const Badge = ({ status }) => {
    const s = status === "P" ? "Present" : status === "A" ? "Absent" : "Leave";
    const bg = status === "P" ? "#10ca2fff" : status === "A" ? "#9b2a2aff" : "#fff3c4";
    return (
      <span style={{ background: bg, padding: "4px 8px", borderRadius: 6 }}>{s}</span>
    );
  };

  // ---------- Render ----------
  return (
    <div style={{ fontFamily: "Inter, Roboto, sans-serif", background: "#bfc4beff", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", background: "rgba(216, 228, 217, 1)", borderRadius: 8, boxShadow: "0 8px 30px rgba(20,20,50,0.06)", padding: 18 }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0 }}>Attendance System — BSCS 4th Semester</h1>
            <div style={{ fontSize: 13, color: "#21961dff" }}>User-input only — add students, teachers, courses</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setMode("home"); setStudentIdLogged(null); }}>Home</button>
            <button onClick={() => { setMode("management"); setStudentIdLogged(null); }}>Management</button>
            <button onClick={() => { setMode("student"); setStudentIdLogged(null); }}>Teacher</button>
          </div>
        </header>

        {/* Body */}
        {mode === "home" && (
          <div style={{ padding: 12 }}>
            <h2>Welcome</h2>
            <p>Select Management to add data and mark attendance. Select Student to login and view your attendance.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid rgba(38, 156, 48, 1)", background: "#fbfeff" }}>
                <h3>Management</h3>
                <p>Add students, teachers, courses, and mark attendance per course & date.</p>
                <button onClick={() => setMode("management")}>Open Management</button>
              </div>
              <div style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid rgba(54, 109, 54, 1)", background: "#fffbf2" }}>
                <h3>Teacher</h3>
                <p>Login by roll number to view your attendance.</p>
                <button onClick={() => setMode("student")}>Open Student</button>
              </div>
            </div>
          </div>
        )}

        {mode === "management" && (
          <div>
            <div style={{ display: "flex", gap: 18 }}>
              {/* Left column: Register and lists */}
              <div style={{ width: "45%", minWidth: 320 }}>
                <section style={{ marginBottom: 18 }}>
                  <h3>Register Student</h3>
                  <input placeholder="Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} style={{ width: "48%", marginRight: "4%" }} />
                  <input placeholder="Roll" value={studentForm.roll} onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })} style={{ width: "48%" }} />
                  <div style={{ marginTop: 8 }}>
                    <button onClick={addStudent}>Add Student</button>
                  </div>
                </section>

                <section style={{ marginBottom: 18 }}>
                  <h4>Students ({data.students.length})</h4>
                  <input placeholder="Search by name or roll" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} style={{ width: "100%", marginBottom: 8 }} />
                  <div style={{ maxHeight: 280, overflow: "auto", border: "1px solid rgba(78, 160, 78, 1)", padding: 8, borderRadius: 6 }}>
                    {data.students.filter(s => s.name.toLowerCase().includes(searchQ.toLowerCase()) || s.roll.includes(searchQ)).map((s) => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 4px", borderBottom: "1px solid #7a2626ff" }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: "#337e3dff" }}>{s.roll}</div>
                        </div>
                        <div>
                          <button onClick={() => editStudent(s.id)}>Edit</button>
                          <button onClick={() => deleteStudent(s.id)} style={{ marginLeft: 6 }}>Delete</button>
                        </div>
                      </div>
                    ))}
                    {data.students.length === 0 && <div style={{ color: "#777" }}>No students yet.</div>}
                  </div>
                </section>

                <section style={{ marginBottom: 18 }}>
                  <h3>Register Teacher</h3>
                  <input placeholder="Teacher name" value={teacherForm.name} onChange={(e) => setTeacherForm({ name: e.target.value })} style={{ width: "70%", marginRight: 8 }} />
                  <button onClick={addTeacher}>Add Teacher</button>

                  <h4 style={{ marginTop: 10 }}>Teachers ({data.teachers.length})</h4>
                  <div style={{ maxHeight: 140, overflow: "auto", border: "1px solid rgba(46, 46, 109, 1)", padding: 8, borderRadius: 6 }}>
                    {data.teachers.map(t => (
                      <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: 6, borderBottom: "1px solid #f6f6f6" }}>
                        <div>{t.name}</div>
                        <div>
                          <button onClick={() => editTeacher(t.id)}>Edit</button>
                          <button onClick={() => deleteTeacher(t.id)} style={{ marginLeft: 6 }}>Delete</button>
                        </div>
                      </div>
                    ))}
                    {data.teachers.length === 0 && <div style={{ color: "#327019ff" }}>No teachers yet.</div>}
                  </div>
                </section>
              </div>

              {/* Right column: Courses & Attendance */}
              <div style={{ flex: 1 }}>
                <section style={{ marginBottom: 18 }}>
                  <h3>Register Course</h3>
                  <select value={courseForm.teacherId} onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })} style={{ width: "48%", marginRight: "4%" }}>
                    <option value="">Select teacher (optional)</option>
                    {data.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input placeholder="Course name" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} style={{ width: "48%" }} />
                  <div style={{ marginTop: 8 }}>
                    <button onClick={addCourse}>Add Course</button>
                  </div>

                  <h4 style={{ marginTop: 12 }}>Courses ({data.courses.length})</h4>
                  <div style={{ maxHeight: 140, overflow: "auto", border: "1px solid rgba(66, 66, 156, 1)", padding: 8, borderRadius: 6 }}>
                    {data.courses.map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: 6, borderBottom: "1px solid #f6f6f6" }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: "#309616ff" }}>{data.teachers.find(t => t.id === c.teacherId)?.name || "(no teacher)"}</div>
                        </div>
                        <div>
                          <button onClick={() => editCourse(c.id)}>Edit</button>
                          <button onClick={() => deleteCourse(c.id)} style={{ marginLeft: 6 }}>Delete</button>
                        </div>
                      </div>
                    ))}
                    {data.courses.length === 0 && <div style={{ color: "#236e19ff" }}>No courses yet.</div>}
                  </div>
                </section>

                <section>
                  <h3>Mark Attendance (Per Course)</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} style={{ minWidth: 220 }}>
                      <option value="">Select course</option>
                      {data.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    <button onClick={() => loadAttendanceDraft()}>Load</button>
                    <button onClick={() => saveAttendance()}>Save</button>
                    <button onClick={() => deleteAttendanceFor(selectedCourseId, selectedDate)} style={{ marginLeft: 6 }}>Delete</button>
                  </div>

                  <div style={{ maxHeight: 360, overflow: "auto", border: "1px solid #eef", padding: 8, borderRadius: 6 }}>
                    {data.students.length === 0 && <div style={{ color: "#777" }}>Add students to mark attendance.</div>}
                    {data.students.length > 0 && (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ textAlign: "left", borderBottom: "2px solid #1b6948ff" }}>
                            <th style={{ padding: 8 }}>Name</th>
                            <th>Roll</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.students.map(s => {
                            const st = attendanceDraft[s.id] || "A";
                            const bg = st === "P" ? "#0aa01eff" : st === "A" ? "#832626ff" : "#fff9db";
                            return (
                              <tr key={s.id} style={{ background: bg }}>
                                <td style={{ padding: 8 }}>{s.name}</td>
                                <td>{s.roll}</td>
                                <td>
                                  <select value={st} onChange={(e) => setStatus(s.id, e.target.value)}>
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
            {/* Student login / panel */}
            {!studentIdLogged ? (
              <div style={{ maxWidth: 520 }}>
                <h3>Student Login</h3>
                <p>Enter your roll number to view attendance:</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input id="rollInput" placeholder="Roll number" style={{ flex: 1 }} />
                  <button onClick={() => {
                    const el = document.getElementById("rollInput");
                    if (!el) return;
                    studentLoginByRoll(el.value);
                  }}>Login</button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <h4>Quick list of students</h4>
                  <div style={{ maxHeight: 160, overflow: "auto", border: "1px solid rgba(55, 55, 201, 1)", padding: 8 }}>
                    {data.students.length === 0 && <div style={{ color: "#57a135ff" }}>No students registered yet.</div>}
                    {data.students.map(s => <div key={s.id} style={{ padding: 6 }}>{s.name} — {s.roll}</div>)}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3>Student Dashboard</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{data.students.find(s => s.id === studentIdLogged)?.name}</strong>
                    <div style={{ fontSize: 13, color: "#666" }}>{data.students.find(s => s.id === studentIdLogged)?.roll}</div>
                  </div>
                  <div>
                    <button onClick={() => { setStudentIdLogged(null); setMode("student"); }}>Logout</button>
                    <button onClick={() => setMode("home")} style={{ marginLeft: 8 }}>Home</button>
                  </div>
                </div>

                <section style={{ marginTop: 12 }}>
                  <h4>Your Attendance</h4>
                  <div style={{ maxHeight: 420, overflow: "auto", border: "1px solid rgba(30, 30, 179, 1)", padding: 8 }}>
                    {getStudentAttendance(studentIdLogged).length === 0 && <div style={{ color: "#777" }}>No attendance recorded yet.</div>}
                    {getStudentAttendance(studentIdLogged).map((r, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: 8, marginBottom: 6, background: r.status === "P" ? "#e8f9e8" : r.status === "A" ? "#ffecec" : "#fff9db", borderRadius: 6 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.courseName}</div>
                          <div style={{ fontSize: 13, color: "#66a12fff" }}>{r.date}</div>
                        </div>
                        <div style={{ alignSelf: "center" }}>
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
        <footer style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          
         
          <div style={{ fontSize: 13, color: "#666" }}>Saved to localStorage key: <code>{LS_KEY}</code></div>
         
        { /* <div>

            <button onClick={() => {
              if (!confirm("Export all data to JSON file?")) return;
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "attendance-data.json";
              a.click();
              URL.revokeObjectURL(url);
            }}>Export JSON</button>
*/}
<div>
            <button onClick={() => {
              if (!confirm("Clear all saved data (localStorage)? This cannot be undone.")) return;
              localStorage.removeItem(LS_KEY);
              setData({ students: [], teachers: [], courses: [], attendance: [] });
              setAttendanceDraft({});
              setSelectedCourseId("");
              setSelectedDate(new Date().toISOString().slice(0, 10));
            }} style={{ marginLeft: 8 }}>Clear All</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
