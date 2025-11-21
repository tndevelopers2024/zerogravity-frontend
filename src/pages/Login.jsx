import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://zerogravity-backend.vercel.app/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });


            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    setMessage('Login successful! Welcome back.');
                }
            } else {
                setMessage(data.message || 'Login failed');
            }
        } catch (error) {
            setMessage('Server error. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center px-4 pt-30">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl shadow-zinc-900/50 relative overflow-hidden">

                {/* BACKGROUND ACCENT GLOW */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-zg-accent/20 blur-[120px]"></div>

                {/* HEADING */}
                <h2 className="text-center text-4xl font-heading text-white tracking-tight mb-3">
                    Welcome Back
                </h2>
                <p className="text-center text-zg-secondary mb-10">
                    Login to access your dashboard.
                </p>

                {/* ALERT MESSAGE */}
                {message && (
                    <div
                        className={`p-4 mb-8 rounded-lg text-sm font-medium text-center transition-all duration-300 ${message.includes('successful')
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username */}
                    <div>
                        <label className="text-zg-secondary text-sm mb-2 block">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            required
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-zg-secondary text-sm mb-2 block">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-zg-accent text-black font-semibold rounded-lg hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30"
                    >
                        Login
                    </button>
                </form>

                {/* EXTRA */}
                <p className="text-center text-zg-secondary text-sm mt-6">
                    Forgot your password?{' '}
                    <span className="text-zg-accent cursor-pointer hover:underline">
                        Reset here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
