import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { Search, Eye, Trash2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUsersApi, deleteUserApi } from '../utils/Api';

const UsersList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, roleFilter]);

    const fetchUsers = async () => {
        try {
            const response = await getUsersApi();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.username?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;

        try {
            await adminDeleteUserApi(id);
            await fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    return (
        <DashboardLayout title="Users Management">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zg-secondary/50" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                >
                    <option value="all">All Roles</option>
                    <option value="user">Users</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20">
                    <Users className="w-16 h-16 text-zg-secondary/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-heading font-bold mb-2">No users found</h3>
                    <p className="text-zg-secondary">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zg-secondary/10">
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">User</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Email</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Phone</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Role</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Joined</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="border-b border-zg-secondary/5 hover:bg-zg-secondary/5 transition-colors"
                                    >
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zg-accent/10 flex items-center justify-center">
                                                    <span className="text-zg-accent font-bold">
                                                        {user.firstName?.[0]?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                                                    <div className="text-sm text-zg-secondary">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-sm">{user.email}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-sm">{user.phone || 'N/A'}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-500'
                                                    : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-sm text-zg-secondary">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/users/${user._id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-zg-surface border border-zg-secondary/10 rounded-lg hover:border-zg-accent transition-colors text-sm font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default UsersList;
