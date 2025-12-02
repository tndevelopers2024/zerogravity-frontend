import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Search,
  Filter,
  ChevronDown,
  SortAsc,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsersApi } from "../utils/Api";

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorStyles = {
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      border: "border-blue-500/20",
      hoverBg: "group-hover:bg-blue-500/20",
      glow: "bg-blue-500/10",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-500",
      border: "border-green-500/20",
      hoverBg: "group-hover:bg-green-500/20",
      glow: "bg-green-500/10",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      border: "border-yellow-500/20",
      hoverBg: "group-hover:bg-yellow-500/20",
      glow: "bg-yellow-500/10",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      hoverBg: "group-hover:bg-red-500/20",
      glow: "bg-red-500/10",
    },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 p-6 rounded-2xl relative overflow-hidden group"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${styles.glow} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${styles.hoverBg} transition-colors duration-500`}
      ></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${styles.bg} ${styles.text}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}
          >
            +2.5%
          </span>
        </div>
        <h3 className="text-zg-secondary text-sm font-medium uppercase tracking-wider mb-1">
          {title}
        </h3>
        <p className="text-3xl font-heading font-bold text-zg-primary">{value}</p>
      </div>
    </motion.div>
  );
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await getUsersApi();
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchUsers();
  }, [navigate]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilterDropdown &&
        !event.target.closest(".filter-dropdown-container")
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterDropdown]);

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.role === "user").length,
    pending: 0,
    rejected: 0,
  };

  // Filtering + Sorting
  const filteredUsers = users
    .filter((user) => {
      const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchLower) ||
        (user?.email || "").toLowerCase().includes(searchLower) ||
        (user?.username || "").toLowerCase().includes(searchLower);

      return matchesSearch;
    })
    .sort((a, b) => {
      const nameA = `${a?.firstName || ""} ${a?.lastName || ""}`.trim();
      const nameB = `${b?.firstName || ""} ${b?.lastName || ""}`.trim();

      switch (sortBy) {
        case "name":
          return nameA.localeCompare(nameB);
        case "email":
          return (a?.email || "").localeCompare(b?.email || "");
        case "status":
          return (a?.role || "").localeCompare(b?.role || "");
        case "date":
        default:
          return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      }
    });

  return (
    <DashboardLayout title="User Management">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.total} icon={Users} color="blue" />
        <StatCard title="Active Users" value={stats.active} icon={CheckCircle} color="green" />
        <StatCard title="Pending Requests" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="red" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zg-secondary" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zg-surface/50 border border-zg-secondary/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-zg-primary placeholder-zg-secondary/50 focus:outline-none focus:border-zg-accent/50 focus:ring-1 focus:ring-zg-accent/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zg-secondary hover:text-zg-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Just placeholder Add User button */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zg-accent text-black rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-zg-accent-hover transition-all shadow-lg shadow-zg-accent/20">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-3 border-b border-zg-secondary/10 bg-zg-secondary/10">
          <p className="text-sm text-zg-secondary">
            Showing <span className="text-zg-primary font-bold">{filteredUsers.length}</span>{" "}
            of <span className="text-zg-primary font-bold">{users.length}</span> users
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zg-secondary/10 bg-zg-secondary/10">
                <th className="p-5 font-heading font-bold text-zg-secondary text-xs uppercase tracking-wider">
                  User Details
                </th>
                <th className="p-5 font-heading font-bold text-zg-secondary text-xs uppercase tracking-wider">
                  Role
                </th>
                <th className="p-5 font-heading font-bold text-zg-secondary text-xs uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="p-5 font-heading font-bold text-zg-secondary text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zg-secondary/10">
              {filteredUsers.map((user, index) => {
                const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-zg-secondary/10 transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zg-accent/20 to-purple-500/20 flex items-center justify-center text-zg-primary font-bold text-sm border border-zg-secondary/10">
                          {user?.firstName?.charAt(0) || "U"}
                        </div>

                        <div>
                          <div className="font-bold text-zg-primary text-sm">{fullName}</div>
                          <div className="text-xs text-zg-secondary">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-5 text-sm text-zg-secondary capitalize">{user.role}</td>

                    <td className="p-5 text-sm text-zg-secondary">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-5 text-right">
                      <button className="p-2 text-zg-secondary hover:text-zg-primary hover:bg-zg-secondary/10 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-zg-secondary">
            <div className="w-16 h-16 bg-zg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-medium text-zg-primary">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search input.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Admin;
