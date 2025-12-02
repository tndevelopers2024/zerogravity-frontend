import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCartApi, placeOrderApi } from '../utils/Api';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    const [deliveryAddress, setDeliveryAddress] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCart();

        // Pre-fill user info
        if (user) {
            setDeliveryAddress(prev => ({
                ...prev,
                name: `${user.firstName} ${user.lastName}`,
                phone: user.phone || '',
                ...user.address
            }));
        }
    }, [isAuthenticated, user]);

    const fetchCart = async () => {
        try {
            const response = await getCartApi();
            const cartData = response.data;

            if (!cartData?.items || cartData.items.length === 0) {
                navigate('/cart');
                return;
            }

            setCart(cartData);
        } catch (error) {
            console.error('Error fetching cart:', error);
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => {
            const price = item.selectedSize?.price || item.product?.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setDeliveryAddress(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Validation
        if (!deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.address ||
            !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
            alert('Please fill in all delivery address fields');
            return;
        }

        setPlacing(true);
        try {
            const orderData = {
                deliveryAddress,
                paymentMethod,
                notes
            };

            const response = await placeOrderApi(orderData);
            alert('Order placed successfully!');
            navigate('/my-orders');
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
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
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-zg-secondary hover:text-zg-primary transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Cart</span>
                </button>

                <h1 className="text-4xl font-heading font-bold mb-8">Checkout</h1>

                <form onSubmit={handlePlaceOrder}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Delivery Address */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <MapPin className="w-6 h-6 text-zg-accent" />
                                    <h2 className="text-xl font-bold">Delivery Address</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-zg-secondary mb-2 block">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={deliveryAddress.name}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm text-zg-secondary mb-2 block">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={deliveryAddress.phone}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm text-zg-secondary mb-2 block">Address</label>
                                        <textarea
                                            name="address"
                                            required
                                            rows="3"
                                            value={deliveryAddress.address}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zg-secondary mb-2 block">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={deliveryAddress.city}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zg-secondary mb-2 block">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            value={deliveryAddress.state}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zg-secondary mb-2 block">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            required
                                            value={deliveryAddress.pincode}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-zg-secondary mb-2 block">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            required
                                            value={deliveryAddress.country}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Payment Method */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <CreditCard className="w-6 h-6 text-zg-accent" />
                                    <h2 className="text-xl font-bold">Payment Method</h2>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { value: 'cod', label: 'Cash on Delivery' },
                                        { value: 'card', label: 'Credit/Debit Card' },
                                        { value: 'upi', label: 'UPI' },
                                        { value: 'netbanking', label: 'Net Banking' }
                                    ].map((method) => (
                                        <label
                                            key={method.value}
                                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === method.value
                                                    ? 'border-zg-accent bg-zg-accent/10'
                                                    : 'border-zg-secondary/10 hover:border-zg-accent/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.value}
                                                checked={paymentMethod === method.value}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="text-zg-accent"
                                            />
                                            <span className="font-medium">{method.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Order Notes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                            >
                                <label className="text-sm text-zg-secondary mb-2 block">Order Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="3"
                                    placeholder="Any special instructions for your order..."
                                    className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                                />
                            </motion.div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6 sticky top-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <Package className="w-6 h-6 text-zg-accent" />
                                    <h2 className="text-xl font-bold">Order Summary</h2>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {cart?.items.map((item) => (
                                        <div key={item._id} className="flex justify-between text-sm">
                                            <span className="text-zg-secondary">
                                                {item.product?.name} × {item.quantity}
                                            </span>
                                            <span className="font-medium">
                                                ₹{(item.selectedSize?.price || item.product?.price || 0) * item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="h-px bg-zg-secondary/10 mb-4"></div>

                                <div className="flex justify-between text-xl font-bold mb-6">
                                    <span>Total</span>
                                    <span className="text-zg-accent">₹{calculateTotal()}</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={placing}
                                    className="w-full px-8 py-4 bg-zg-accent text-black font-bold rounded-xl hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30 disabled:opacity-50"
                                >
                                    {placing ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
