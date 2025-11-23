import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function TeacherLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (username === "teacher" && password === "1234") {
            navigate('/teacher-dashboard');
        } else {
            alert("Incorrect username or password!");
        }
    };

    return (
        <div className="login-panel">
            <h3>Teacher Login</h3>
            <p>Please enter your credentials to access the dashboard.</p>
            <div className="input-group" style={{ flexDirection: 'column' }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin} style={{ marginTop: '10px', width: '100%' }}>Login</button>
            </div>
        </div>
    );
}
