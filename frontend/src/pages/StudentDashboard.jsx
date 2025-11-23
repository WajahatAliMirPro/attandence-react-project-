import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const [sRes, cRes, aRes] = await Promise.all([
                    axios.get(`${API_URL}/students`),
                    axios.get(`${API_URL}/courses`),
                    axios.get(`${API_URL}/attendance`),
                ]);

                const s = sRes.data.find(x => x._id === id);
                if (!s) {
                    alert("Student not found!");
                    navigate('/student-login');
                    return;
                }
                setStudent(s);
                setCourses(cRes.data);

                // Process attendance
                const res = [];
                aRes.data.forEach((a) => {
                    const record = a.records.find((r) => r.studentId === id);
                    if (record) {
                        const course = cRes.data.find((c) => c._id === a.courseId);
                        res.push({
                            courseName: course ? course.name : "(deleted/unknown)",
                            date: a.date,
                            status: record.status,
                        });
                    }
                });
                setAttendance(res.sort((x, y) => y.date.localeCompare(x.date)));

            } catch (err) {
                console.error(err);
            }
        };
        fetchStudentData();
    }, [id, navigate]);

    const Badge = ({ status }) => {
        const s = status === "P" ? "Present" : status === "A" ? "Absent" : "Leave";
        const bg = status === "P" ? "#10ca2fff" : status === "A" ? "#9b2a2aff" : "#fff3c4";
        return (
            <span className="badge" style={{ backgroundColor: bg }}>{s}</span>
        );
    };

    if (!student) return <div>Loading...</div>;

    return (
        <div>
            <h3>Student Dashboard</h3>
            <div className="dashboard-header">
                <div>
                    <strong>{student.name}</strong>
                    <div className="item-sub">{student.roll}</div>
                </div>
                <div>
                    <button onClick={() => navigate('/student-login')}>Logout</button>
                    <button onClick={() => navigate('/')} className="ml-2">Home</button>
                </div>
            </div>

            <section className="section mt-4">
                <h4>Your Attendance</h4>
                <div className="list-container">
                    {attendance.length === 0 && <div className="empty-msg">No attendance recorded yet.</div>}
                    {attendance.map((r, idx) => (
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
    );
}
