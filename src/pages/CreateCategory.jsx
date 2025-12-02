import React, { useState, useEffect } from "react";
import {
  createCategoryApi,
  updateCategoryApi,
  getSingleCategoryApi,
  uploadImageApi,
} from "../utils/Api";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";

const CreateCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // detect edit mode

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const generateSlug = (text) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Load category if editing
  const loadCategory = async () => {
    try {
      const res = await getSingleCategoryApi(id);
      const data = res.data;

      setForm({
        name: data.name,
        slug: data.slug,
        image: data.image,
      });
    } catch (error) {
      console.error("Load category failed:", error);
      alert("Category not found");
      navigate("/admin/categories");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) loadCategory();
    else setPageLoading(false);
  }, [id]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await uploadImageApi(formData);
    return res.data.url;
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = form.image;

    // Upload new image only if user selected one
    if (imageFile) {
      imageUrl = await handleFileUpload(imageFile);
    }

    try {
      if (isEdit) {
        await updateCategoryApi(id, {
          ...form,
          image: imageUrl,
        });
      } else {
        await createCategoryApi({
          ...form,
          image: imageUrl,
        });
      }

      navigate("/admin/categories");
    } catch (error) {
      console.error("Category save error:", error);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  if (pageLoading) {
    return (
      <DashboardLayout title={isEdit ? "Edit Category" : "Create Category"}>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-zg-accent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Category" : "Create Category"}>
      <motion.form
        onSubmit={submitCategory}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 p-6 rounded-2xl"
      >
        {/* Name */}
        <label className="text-sm text-zg-secondary">Category Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
              slug: generateSlug(e.target.value),
            })
          }
          className="w-full mt-1 mb-4 py-3 px-4 bg-zg-surface border border-zg-secondary/10 rounded-lg text-zg-primary"
        />

        {/* Slug */}
        <label className="text-sm text-zg-secondary">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) =>
            setForm({ ...form, slug: generateSlug(e.target.value) })
          }
          className="w-full mt-1 mb-4 py-3 px-4 bg-zg-surface border border-zg-secondary/10 rounded-lg text-zg-primary"
        />

        {/* Image Upload */}
        <label className="text-sm text-zg-secondary">Image</label>
        <div className="mt-1 mb-6">
          <div className="w-full aspect-[4/2] bg-zg-secondary/10 border border-zg-secondary/20 rounded-xl flex items-center justify-center overflow-hidden">
            {imageFile || form.image ? (
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : form.image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-zg-secondary/40" />
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="mt-3"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-zg-accent text-black font-bold py-3 rounded-lg hover:bg-zg-accent/90 transition shadow-lg shadow-zg-accent/20"
        >
          {loading
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Category"
            : "Create Category"}
        </button>
      </motion.form>
    </DashboardLayout>
  );
};

export default CreateCategory;
