import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCartApi, updateCartItemApi, removeCartItemApi, clearCartApi } from '../utils/Api';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const response = await getCartApi();
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdating(true);
        try {
            await updateCartItemApi({ itemId, quantity: newQuantity });
            await fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async (itemId) => {
        setUpdating(true);
        try {
            await removeCartItemApi(itemId);
            await fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item');
        } finally {
            setUpdating(false);
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) return;

        setUpdating(true);
        try {
            await clearCartApi();
            await fetchCart();
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('Failed to clear cart');
        } finally {
            setUpdating(false);
        }
    };

    const calculateItemTotal = (item) => {
        const price = item.selectedSize?.price || item.product?.price || 0;
        return price * item.quantity;
    };

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zg-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
            </div>
        );
    }

    const isEmpty = !cart?.items || cart.items.length === 0;

    return (
        <div className="min-h-screen bg-zg-bg text-zg-primary py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-heading font-bold">Shopping Cart</h1>
                    {!isEmpty && (
                        <button
                            onClick={clearCart}
                            disabled={updating}
                            className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {isEmpty ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <ShoppingCart className="w-24 h-24 text-zg-secondary/30 mx-auto mb-6" />
                        <h2 className="text-2xl font-heading font-bold mb-4">Your cart is empty</h2>
                        <p className="text-zg-secondary mb-8">Add some products to get started!</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="px-8 py-3 bg-zg-accent text-black font-bold rounded-xl hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30"
                        >
                            Continue Shopping
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                                >
                                    <div className="flex gap-6">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-zg-secondary/5 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product?.coverImage ? (
                                                <img
                                                    src={item.product.coverImage}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingCart className="w-8 h-8 text-zg-secondary/30" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold mb-2">{item.product?.name}</h3>

                                            {item.selectedSize && (
                                                <p className="text-sm text-zg-secondary mb-1">
                                                    Size: {item.selectedSize.name}
                                                </p>
                                            )}

                                            {item.selectedFormat && (
                                                <p className="text-sm text-zg-secondary mb-1">
                                                    Format: {item.selectedFormat}
                                                </p>
                                            )}

                                            <p className="text-lg font-bold text-zg-accent mt-2">
                                                ₹{item.selectedSize?.price || item.product?.price || 0}
                                            </p>

                                            {/* Customization Images */}
                                            {item.customizationImages && item.customizationImages.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-zg-secondary mb-2 flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3" />
                                                        Uploaded Images ({item.customizationImages.length})
                                                    </p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {item.customizationImages.map((img, idx) => (
                                                            <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-zg-secondary/20">
                                                                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Album Customization */}
                                            {item.ealbumCustomization && (
                                                <div className="mt-3 p-3 bg-zg-surface rounded-lg border border-zg-secondary/10">
                                                    <p className="text-xs font-bold text-zg-accent mb-2 uppercase tracking-wider">Album Details</p>
                                                    <div className="space-y-1 text-sm">
                                                        <p><span className="text-zg-secondary">Title:</span> {item.ealbumCustomization.coverDesign?.title}</p>
                                                        <p><span className="text-zg-secondary">Theme:</span> {item.ealbumCustomization.coverDesign?.color}</p>
                                                        <p><span className="text-zg-secondary">Pages Filled:</span> {item.ealbumCustomization.pages?.filter(p => p.images.length > 0).length}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => removeItem(item._id)}
                                                disabled={updating}
                                                className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            {item.product?.type === 'frame' && (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                        disabled={updating || item.quantity <= 1}
                                                        className="w-8 h-8 rounded-lg bg-zg-surface border border-zg-secondary/10 hover:border-zg-accent transition-colors disabled:opacity-50"
                                                    >
                                                        <Minus className="w-4 h-4 mx-auto" />
                                                    </button>
                                                    <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                        disabled={updating}
                                                        className="w-8 h-8 rounded-lg bg-zg-surface border border-zg-secondary/10 hover:border-zg-accent transition-colors disabled:opacity-50"
                                                    >
                                                        <Plus className="w-4 h-4 mx-auto" />
                                                    </button>
                                                </div>
                                            )}

                                            <p className="text-lg font-bold">
                                                ₹{calculateItemTotal(item)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6 sticky top-6">
                                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-zg-secondary">
                                        <span>Subtotal</span>
                                        <span>₹{calculateTotal()}</span>
                                    </div>
                                    <div className="flex justify-between text-zg-secondary">
                                        <span>Shipping</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                    <div className="h-px bg-zg-secondary/10"></div>
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span className="text-zg-accent">₹{calculateTotal()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}
                                    disabled={updating}
                                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-zg-accent text-black font-bold rounded-xl hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30 disabled:opacity-50"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => navigate('/shop')}
                                    className="w-full mt-4 px-8 py-3 border border-zg-secondary/20 text-zg-secondary hover:text-zg-primary hover:border-zg-accent/50 font-medium rounded-xl transition-all"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
