import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, CreditCard, Eye, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMyOrdersApi } from '../utils/Api';
import { useAuth } from '../context/AuthContext';

const MyOrders = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const response = await getMyOrdersApi();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500/10 text-yellow-500',
            processing: 'bg-blue-500/10 text-blue-500',
            shipped: 'bg-purple-500/10 text-purple-500',
            delivered: 'bg-green-500/10 text-green-500',
            cancelled: 'bg-red-500/10 text-red-500'
        };
        return colors[status] || colors.pending;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zg-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zg-bg text-zg-primary py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-heading font-bold mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <Package className="w-24 h-24 text-zg-secondary/30 mx-auto mb-6" />
                        <h2 className="text-2xl font-heading font-bold mb-4">No orders yet</h2>
                        <p className="text-zg-secondary mb-8">Start shopping to see your orders here!</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="px-8 py-3 bg-zg-accent text-black font-bold rounded-xl hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30"
                        >
                            Start Shopping
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6 hover:border-zg-accent/50 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zg-secondary">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4" />
                                                {order.paymentMethod.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-zg-secondary">Total Amount</p>
                                            <p className="text-2xl font-bold text-zg-accent">₹{order.totalAmount}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/my-orders/${order._id}`)}
                                            className="px-6 py-3 bg-zg-accent text-black font-bold rounded-lg hover:bg-zg-accent/90 transition-all flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {order.items?.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 bg-zg-bg rounded-lg">
                                            <div className="w-16 h-16 bg-zg-secondary/5 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-zg-secondary/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-zg-secondary">Qty: {item.quantity}</p>
                                                <p className="text-sm font-bold text-zg-accent">₹{item.subtotal}</p>

                                                {/* Customization Images */}
                                                {item.customizationImages && item.customizationImages.length > 0 && (
                                                    <div className="mt-2 flex gap-1">
                                                        {item.customizationImages.slice(0, 3).map((img, imgIdx) => (
                                                            <div key={imgIdx} className="w-6 h-6 rounded border border-zg-secondary/20 overflow-hidden">
                                                                <img src={img} alt={`Upload ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                        {item.customizationImages.length > 3 && (
                                                            <div className="w-6 h-6 rounded border border-zg-secondary/20 bg-zg-bg flex items-center justify-center text-[8px] text-zg-secondary">
                                                                +{item.customizationImages.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <div className="flex items-center justify-center p-3 bg-zg-bg rounded-lg text-zg-secondary">
                                            +{order.items.length - 3} more items
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
