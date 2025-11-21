import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Package,
    FileBarChart,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <aside className="w-72 bg-zg-surface/80 backdrop-blur-md border-r border-white/5 flex flex-col h-screen sticky top-0 z-30">
            <div className="p-8">
                <Link to="/" className="block">
                    <h1 className="text-3xl font-heading font-bold text-white tracking-tighter">
                        ZERO<span className="text-zg-accent">GRAVITY</span>
                    </h1>
                    <p className="text-xs text-zg-secondary uppercase tracking-[0.2em] mt-1 ml-1">Admin Portal</p>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
                <div className="px-4 mb-2">
                    <p className="text-xs font-bold text-zg-secondary/50 uppercase tracking-widest">Menu</p>
                </div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="block relative group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-zg-accent/10 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive ? 'text-zg-accent' : 'text-zg-secondary group-hover:text-white group-hover:bg-white/5'
                                }`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                                <span className="font-heading font-medium text-sm tracking-wide">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="ml-auto"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </motion.div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 m-4 mt-auto rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-zg-accent flex items-center justify-center text-black font-bold text-sm shadow-lg shadow-zg-accent/20">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">Admin User</p>
                        <p className="text-xs text-zg-secondary truncate">admin@zerogravity.com</p>
                    </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-wider transition-colors border border-white/5 hover:border-white/10">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
