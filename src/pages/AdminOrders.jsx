import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { Search, Eye, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminGetAllOrdersApi } from '../utils/Api';

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchQuery, statusFilter]);

    const fetchOrders = async () => {
        try {
            const response = await adminGetAllOrdersApi();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(o => o.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(o =>
                o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
            cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
        };
        return colors[status] || colors.pending;
    };

    return (
        <DashboardLayout title="Orders Management">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zg-secondary/50" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-16 h-16 text-zg-secondary/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-heading font-bold mb-2">No orders found</h3>
                    <p className="text-zg-secondary">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zg-secondary/10">
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Order ID</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Customer</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Items</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Total</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Date</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Status</th>
                                    <th className="text-left p-5 text-sm font-bold text-zg-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, index) => (
                                    <motion.tr
                                        key={order._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="border-b border-zg-secondary/5 hover:bg-zg-secondary/5 transition-colors"
                                    >
                                        <td className="p-5">
                                            <span className="font-mono text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="p-5">
                                            <div>
                                                <div className="font-medium">{order.user?.firstName} {order.user?.lastName}</div>
                                                <div className="text-sm text-zg-secondary">{order.user?.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                {order.items?.[0]?.image && (
                                                    <div className="w-10 h-10 bg-zg-secondary/5 rounded-lg overflow-hidden">
                                                        <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium">{order.items?.[0]?.name}</div>
                                                    {order.items?.length > 1 && (
                                                        <div className="text-xs text-zg-secondary">+{order.items.length - 1} more</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-bold text-zg-accent">₹{order.totalAmount}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-sm text-zg-secondary">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <button
                                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-zg-surface border border-zg-secondary/10 rounded-lg hover:border-zg-accent transition-colors text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
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

export default AdminOrders;
