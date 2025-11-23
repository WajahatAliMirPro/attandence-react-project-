import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Home() {
    const navigate = useNavigate();
    return (
        <div className="home-view">
            <h2>Welcome to Attendance Portal</h2>
            <p>Please select your role to proceed.</p>
            <div className="home-cards">
                <div className="card management-card">
                    <h3>Teacher Login</h3>
                    <p>Access the management dashboard to add students, courses, and mark attendance.</p>
                    <button onClick={() => navigate('/teacher-login')}>Login as Teacher</button>
                </div>
                <div className="card student-card">
                    <h3>Student Login</h3>
                    <p>View your attendance records by entering your roll number.</p>
                    <button onClick={() => navigate('/student-login')}>Login as Student</button>
                </div>
            </div>
        </div>
    );
}
