import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowUserMenu(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-zg-bg/80 backdrop-blur-md border-b border-zg-secondary/10 py-4' : 'bg-transparent py-6'}`}>
            <div className="custom-container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-heading font-bold tracking-tighter flex items-center gap-2">
                    <img src="/logo.png" className="w-10" alt="Logo" />
                    <span className="text-zg-accent">ZERO</span>GRAVITY
                </Link>

                {/* Icons & User Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/cart" className="relative group text-zg-primary hover:text-zg-accent transition-colors">
                        <ShoppingBag className="w-5 h-5" />
                    </Link>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 text-sm font-medium hover:text-zg-accent transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-zg-surface flex items-center justify-center border border-zg-secondary/10">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="max-w-[100px] truncate">{user.firstName}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-4 w-48 bg-zg-surface border border-zg-secondary/10 rounded-xl shadow-xl overflow-hidden py-2"
                                    >
                                        <Link
                                            to="/my-orders"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-zg-bg transition-colors text-sm"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Package className="w-4 h-4" />
                                            My Orders
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-zg-bg transition-colors text-sm"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zg-bg transition-colors text-sm text-red-500"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-6 py-2 bg-zg-primary text-zg-bg font-bold rounded-lg hover:bg-zg-accent hover:text-black transition-all text-sm uppercase tracking-wide"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-zg-primary"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-zg-bg border-b border-zg-secondary/10 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-lg font-heading font-medium tracking-widest uppercase"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-zg-secondary/10 my-2" />
                            <Link
                                to="/cart"
                                className="flex items-center gap-3 text-lg font-heading font-medium tracking-widest uppercase"
                                onClick={() => setIsOpen(false)}
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Cart
                            </Link>
                            {user ? (
                                <>
                                    <Link
                                        to="/my-orders"
                                        className="flex items-center gap-3 text-lg font-heading font-medium tracking-widest uppercase"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Package className="w-5 h-5" />
                                        My Orders
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-3 text-lg font-heading font-medium tracking-widest uppercase text-red-500 text-left"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-lg font-heading font-medium tracking-widest uppercase text-zg-accent"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login / Register
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
