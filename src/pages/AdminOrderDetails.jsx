import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { ArrowLeft, Package, User, MapPin, CreditCard, Save, Download, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrderByIdApi, adminUpdateOrderStatusApi } from '../utils/Api';

const AdminOrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await getOrderByIdApi(orderId);
            const orderData = response.data;
            setOrder(orderData);
            setStatus(orderData.status);
            setPaymentStatus(orderData.paymentStatus);
            setTrackingNumber(orderData.trackingNumber || '');
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        setUpdating(true);
        try {
            await adminUpdateOrderStatusApi(orderId, {
                status,
                paymentStatus,
                trackingNumber
            });
            alert('Order updated successfully!');
            await fetchOrderDetails();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Order Details">
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!order) {
        return (
            <DashboardLayout title="Order Details">
                <div className="text-center py-20 text-zg-secondary">Order not found</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={`Order #${order._id.slice(-6).toUpperCase()}`}>
            <button
                onClick={() => navigate('/admin/orders')}
                className="flex items-center gap-2 text-zg-secondary hover:text-zg-primary transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Orders</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Package className="w-6 h-6 text-zg-accent" />
                            <h3 className="text-lg font-bold">Order Items</h3>
                        </div>

                        <div className="space-y-4">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 bg-zg-bg rounded-xl">
                                    <div className="w-20 h-20 bg-zg-secondary/5 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-zg-secondary/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold mb-1">{item.name}</h4>
                                        {item.selectedSize && (
                                            <p className="text-sm text-zg-secondary">Size: {item.selectedSize.name}</p>
                                        )}
                                        {item.selectedFormat && (
                                            <p className="text-sm text-zg-secondary">Format: {item.selectedFormat}</p>
                                        )}

                                        {/* Customization Images */}
                                        {item.customizationImages && item.customizationImages.length > 0 && (
                                            <div className="mt-3 p-3 bg-zg-surface rounded-lg border border-zg-secondary/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs text-zg-secondary flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3" />
                                                        Uploaded Images ({item.customizationImages.length})
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            item.customizationImages.forEach((img, idx) => {
                                                                const link = document.createElement('a');
                                                                link.href = img;
                                                                link.download = `order-${order._id}-item-${index}-image-${idx + 1}.jpg`;
                                                                link.target = '_blank';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            });
                                                        }}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-zg-accent text-black rounded hover:bg-zg-accent/90 transition-all"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                        Download All
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {item.customizationImages.map((img, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={img}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-16 h-16 rounded-lg overflow-hidden border border-zg-secondary/20 hover:border-zg-accent transition-all group relative"
                                                        >
                                                            <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Download className="w-4 h-4 text-white" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Album Customization Details */}
                                        {item.ealbumCustomization && (
                                            <div className="mt-4 p-4 bg-zg-surface rounded-xl border border-zg-secondary/10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-bold text-zg-accent flex items-center gap-2">
                                                        <Package className="w-4 h-4" />
                                                        Album Configuration
                                                    </h5>
                                                    <div className="flex gap-2">
                                                        {item.ealbumCustomization.previewFileUrl && (
                                                            <a
                                                                href={item.ealbumCustomization.previewFileUrl}
                                                                download={`ealbum-config-${order._id}.json`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-zg-surface border border-zg-secondary/20 rounded hover:bg-zg-surface/80 transition-all"
                                                            >
                                                                <Download className="w-3 h-3" />
                                                                Config File
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                // Collect all images
                                                                const allImages = item.ealbumCustomization.pages?.reduce((acc, page) => [...acc, ...page.images], []) || [];
                                                                if (allImages.length === 0) {
                                                                    alert('No images to download');
                                                                    return;
                                                                }

                                                                allImages.forEach((img, idx) => {
                                                                    const link = document.createElement('a');
                                                                    link.href = img;
                                                                    link.download = `ealbum-${order._id}-img-${idx + 1}.jpg`;
                                                                    link.target = '_blank';
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                });
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-zg-accent text-black rounded hover:bg-zg-accent/90 transition-all font-medium"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            Download All Images
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                    <div>
                                                        <span className="text-zg-secondary block text-xs">Title</span>
                                                        <span className="font-medium">{item.ealbumCustomization.coverDesign?.title}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zg-secondary block text-xs">Date</span>
                                                        <span className="font-medium">{item.ealbumCustomization.coverDesign?.date}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zg-secondary block text-xs">Theme Color</span>
                                                        <span className="font-medium capitalize">{item.ealbumCustomization.coverDesign?.color}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zg-secondary block text-xs">Font Style</span>
                                                        <span className="font-medium capitalize">{item.ealbumCustomization.coverDesign?.font}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold text-zg-secondary uppercase tracking-wider">Pages Content</p>
                                                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                        {item.ealbumCustomization.pages?.filter(p => p.images.length > 0).map((page, pIdx) => (
                                                            <div key={pIdx} className="bg-zg-bg p-3 rounded-lg border border-zg-secondary/10">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-xs font-medium">Page {page.pageNumber} ({page.layout})</span>
                                                                    <span className="text-xs text-zg-secondary">{page.images.length} images</span>
                                                                </div>
                                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                                    {page.images.map((img, imgIdx) => (
                                                                        <a
                                                                            key={imgIdx}
                                                                            href={img}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-zg-secondary/20 hover:border-zg-accent transition-colors"
                                                                        >
                                                                            <img src={img} className="w-full h-full object-cover" alt={`P${page.pageNumber}-${imgIdx}`} />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-sm text-zg-secondary">Qty: {item.quantity} × ₹{item.price}</span>
                                            <span className="font-bold text-zg-accent">₹{item.subtotal}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-zg-secondary/10 flex justify-between items-center">
                            <span className="text-lg font-medium">Total Amount</span>
                            <span className="text-2xl font-bold text-zg-accent">₹{order.totalAmount}</span>
                        </div>
                    </motion.div>

                    {/* Update Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-bold mb-6">Update Order Status</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-zg-secondary mb-2 block">Order Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-zg-secondary mb-2 block">Payment Status</label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-zg-secondary mb-2 block">Tracking Number</label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter tracking number"
                                    className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                />
                            </div>

                            <button
                                onClick={handleUpdateStatus}
                                disabled={updating}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zg-accent text-black font-bold rounded-lg hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/20 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {updating ? 'Updating...' : 'Update Order'}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Customer & Delivery Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-zg-accent" />
                            <h3 className="text-lg font-bold">Customer Details</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-zg-secondary">Name</p>
                                <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zg-secondary">Email</p>
                                <p className="font-medium">{order.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zg-secondary">Phone</p>
                                <p className="font-medium">{order.user?.phone}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Delivery Address */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin className="w-6 h-6 text-zg-accent" />
                            <h3 className="text-lg font-bold">Delivery Address</h3>
                        </div>
                        {order.deliveryAddress ? (
                            <div className="text-sm text-zg-secondary space-y-1">
                                <p className="font-medium text-zg-primary">{order.deliveryAddress.name}</p>
                                <p>{order.deliveryAddress.address}</p>
                                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                                <p>{order.deliveryAddress.country}</p>
                                <p className="mt-2">{order.deliveryAddress.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-zg-secondary">No delivery address provided</p>
                        )}
                    </motion.div>

                    {/* Payment Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="w-6 h-6 text-zg-accent" />
                            <h3 className="text-lg font-bold">Payment Info</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zg-secondary">Method</span>
                                <span className="font-medium uppercase">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zg-secondary">Status</span>
                                <span className={`font-bold uppercase ${order.paymentStatus === 'completed' ? 'text-green-500' :
                                    order.paymentStatus === 'pending' ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zg-secondary">Date</span>
                                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Notes */}
                    {order.notes && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-3">Order Notes</h3>
                            <p className="text-sm text-zg-secondary">{order.notes}</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminOrderDetails;
