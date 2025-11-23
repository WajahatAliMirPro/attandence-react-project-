import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentLogin() {
    const [roll, setRoll] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.get(`${API_URL}/students`);
            const students = res.data;
            const s = students.find((x) => x.roll === roll.trim());
            if (!s) {
                alert("Student not found. Check roll number.");
                return;
            }
            navigate(`/student-dashboard/${s._id}`);
        } catch (err) {
            console.error(err);
            alert("Error connecting to server.");
        }
    };

    return (
        <div className="login-panel">
            <h3>Student Login</h3>
            <p>Enter your roll number to view attendance:</p>
            <div className="input-group">
                <input
                    placeholder="Roll number"
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                />
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}
