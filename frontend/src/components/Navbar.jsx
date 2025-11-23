import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import logo from '../assets/download.jpg';
export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/')}>
                <h2><img src={logo} alt="Logo" />AttendanceSystem </h2>
            </div>
            <div className="navbar-links">
                <button className="nav-btn" onClick={() => navigate('/')}>Home</button>
                <button className="nav-btn" onClick={() => navigate('/teacher-login')}>Teacher</button>
                <button className="nav-btn" onClick={() => navigate('/student-login')}>Student</button>
            </div>
        </nav>
    );
}
