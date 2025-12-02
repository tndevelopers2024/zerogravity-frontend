import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { ArrowLeft, User, Mail, Phone, Calendar, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserByIdApi } from '../utils/Api';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            const response = await getUserByIdApi(id);
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="User Details">
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout title="User Details">
                <div className="text-center py-20 text-zg-secondary">User not found</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="User Details">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-zg-secondary hover:text-zg-primary transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Users</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Profile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                >
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-zg-accent/10 flex items-center justify-center mb-4">
                            <span className="text-zg-accent font-bold text-3xl">
                                {user.firstName?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{user.firstName} {user.lastName}</h2>
                        <p className="text-zg-secondary">@{user.username}</p>
                        <span className={`mt-4 px-4 py-2 rounded-full text-sm font-bold uppercase ${user.role === 'admin'
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}>
                            {user.role}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-5 h-5 text-zg-accent" />
                            <div>
                                <p className="text-zg-secondary">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        {user.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-5 h-5 text-zg-accent" />
                                <div>
                                    <p className="text-zg-secondary">Phone</p>
                                    <p className="font-medium">{user.phone}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-5 h-5 text-zg-accent" />
                            <div>
                                <p className="text-zg-secondary">Joined</p>
                                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Additional Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Address */}
                    {user.address && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4">Address</h3>
                            <div className="text-sm text-zg-secondary space-y-1">
                                {user.address.address && <p>{user.address.address}</p>}
                                {user.address.city && user.address.state && (
                                    <p>{user.address.city}, {user.address.state} - {user.address.pincode}</p>
                                )}
                                {user.address.country && <p>{user.address.country}</p>}
                            </div>
                        </motion.div>
                    )}

                    {/* Account Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-bold mb-4">Account Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-zg-bg rounded-xl">
                                <p className="text-sm text-zg-secondary mb-1">Account Status</p>
                                <p className="text-lg font-bold text-green-500">Active</p>
                            </div>
                            <div className="p-4 bg-zg-bg rounded-xl">
                                <p className="text-sm text-zg-secondary mb-1">Member Since</p>
                                <p className="text-lg font-bold">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Activity Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-6 h-6 text-zg-accent" />
                            <h3 className="text-lg font-bold">Recent Activity</h3>
                        </div>
                        <div className="text-center py-8 text-zg-secondary">
                            <Package className="w-12 h-12 text-zg-secondary/30 mx-auto mb-3" />
                            <p className="text-sm">No recent activity to display</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDetails;
