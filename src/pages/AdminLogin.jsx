import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminLoginApi } from '../utils/Api';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // We can reuse login context if it just sets token/user
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await adminLoginApi(formData);
            console.log("Admin Login Response:", res.data); // DEBUG
            const { token, user } = res.data;

            if (!token) {
                console.error("No token received!");
                setError("Login failed: No token received");
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            window.location.href = '/admin';

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zg-bg flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-zg-accent/10 rounded-full blur-3xl -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 p-8 rounded-2xl shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zg-accent/10 text-zg-accent mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-zg-secondary">Secure access for administrators</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3 text-red-400"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zg-secondary mb-2">
                            Email or Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zg-secondary" />
                            <input
                                type="text"
                                value={formData.emailOrUsername}
                                onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                                className="w-full bg-zg-bg border border-zg-secondary/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zg-secondary/50 focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition-all"
                                placeholder="Enter your credentials"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zg-secondary mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zg-secondary" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-zg-bg border border-zg-secondary/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zg-secondary/50 focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zg-accent text-black font-bold py-4 rounded-xl hover:bg-zg-accent/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                Login to Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
