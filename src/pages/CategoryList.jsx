import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { Plus, Search, Edit, Trash2, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  getCategoriesApi,
  deleteCategoryApi,
} from "../utils/Api";

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesApi();
      const data = response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    try {
      await deleteCategoryApi(id);
      fetchCategories();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error deleting category");
    }
  };

  return (
    <DashboardLayout title="Categories">
      {/* Top Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zg-secondary/50" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:ring-1 focus:ring-zg-accent transition"
          />
        </div>

        <button
          onClick={() => navigate("/admin/categories/new")}
          className="flex items-center gap-2 px-6 py-3 bg-zg-accent text-black font-bold rounded-lg hover:bg-zg-accent/90 transition shadow-lg shadow-zg-accent/20"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Empty / Loading */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-zg-accent rounded-full" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-zg-secondary/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold">No categories found</h3>
        </div>
      ) : (
        /* Category Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, index) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl overflow-hidden hover:border-zg-accent/50 transition group"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-zg-secondary/10 flex items-center justify-center overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-zg-secondary/30" />
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                <p className="text-sm text-zg-secondary mb-4">/{cat.slug}</p>

                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center gap-2 px-4 py-2 bg-zg-surface border border-zg-secondary/10 rounded-lg hover:border-zg-accent transition"
                    onClick={() => navigate(`/admin/categories/edit/${cat._id}`)}
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>

                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition"
                    onClick={() => handleDelete(cat._id, cat.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CategoryList;
