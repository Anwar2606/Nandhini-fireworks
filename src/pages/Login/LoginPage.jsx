import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust the path according to your project structure
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LoginPage.css'; // Import your CSS file for styles
import Logo from '../assets/nandhini-logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [isFullscreen, setIsFullscreen] = useState(false);

    const enterFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err) => {
                console.error("Failed to enter fullscreen mode:", err);
            });
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
        setIsFullscreen(true);
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/home'); // Redirect to home page on successful login
        } catch (error) {
            toast.error('Incorrect email or password');
        }
    };

    return (
        <div className="login-container">
            <ToastContainer />
            <div className="login-form">
                <div className="login-form-inner">
                    <div className="logo">
                        <img src={Logo} height="160px" width="190px" alt="Logo" />
                    </div>
                    <h4 className="login-title">NANDHINI FIREWORKS BILLING SOFTWARE</h4>
                    {/* <p className="body-text">Billing Software</p> */}

                    <div className="sign-in-seperator">
                        <span>LOGIN</span>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="login-form-group input-group">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input"
                            />
                            <label htmlFor="email" className="user-label">Email <span className="required-star">*</span></label>
                        </div>
                        <div className="login-form-group input-group">
                            <input
                                autoComplete="off"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input"
                            />
                            <label htmlFor="password" className="user-label">Password <span className="required-star">*</span></label>
                        </div>

                        <button type="submit" className="rounded-button login-cta">Login</button>

                    </form>
                    
                </div>
            </div>
        </div>
    );
};

export default Login;
