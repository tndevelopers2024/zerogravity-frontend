import React, { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        gstNo: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('https://zerogravity-backend.vercel.app/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Registration successful! Please wait for admin approval.');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    businessName: '',
                    gstNo: '',
                    username: '',
                    password: '',
                    confirmPassword: ''
                });
            } else {
                setMessage(data.message || 'Registration failed');
            }
        } catch (error) {
            setMessage('Server error. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center px-4 pt-30 pb-20">
            <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-xl shadow-zinc-900/50 relative overflow-hidden">

                {/* Background Accent Glow */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-zg-accent/20 blur-[150px]"></div>

                <h2 className="text-center text-4xl text-white font-heading tracking-tight mb-3">
                    Join Zero Gravity
                </h2>
                <p className="text-center text-zg-secondary mb-10">
                    Create your account to start your journey.
                </p>

                {/* Status Message */}
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

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Full Name */}
                    <div>
                        <label className="text-zg-secondary text-sm mb-2 block">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-zg-secondary text-sm mb-2 block">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-zg-secondary text-sm mb-2 block">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Business Name */}
                    <div>
                        <label className="text-zg-secondary text-sm mb-2 block">Business Name</label>
                        <input
                            type="text"
                            name="businessName"
                            required
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Studio Name"
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* GST */}
                    <div className="md:col-span-2">
                        <label className="text-zg-secondary text-sm mb-2 block">GST Number</label>
                        <input
                            type="text"
                            name="gstNo"
                            required
                            value={formData.gstNo}
                            onChange={handleChange}
                            placeholder="22AAAAA0000A1Z5"
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="text-zg-secondary text-sm mb-2 block">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="username"
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-zg-secondary text-sm mb-2 block">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="md:col-span-2">
                        <label className="text-zg-secondary text-sm mb-2 block">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 mt-4">
                        <button
                            type="submit"
                            className="w-full py-3 bg-zg-accent text-black font-semibold rounded-lg hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30"
                        >
                            Register Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
