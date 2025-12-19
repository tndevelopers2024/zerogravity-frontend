import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://mitoslearning.co.in/api",
    withCredentials: true,
});

// Automatically attach JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/* =======================================================
   AUTH APIs
   ======================================================= */
export const registerApi = (data) => API.post("/auth/register", data);
export const loginApi = (data) => API.post("/auth/login", data);
export const getMeApi = () => API.get("/auth/me");

/* =======================================================
   AUTH OTP APIs
   ======================================================= */
// -------------------------------------------
// AUTH
// -------------------------------------------
export const checkUserApi = (data) => API.post("/auth/check-user", data);
export const sendRegisterOtpApi = (data) =>
    API.post("/auth/send-register-otp", data);

export const verifyEmailOtpApi = (data) => API.post('/auth/verify-email-otp', data);
export const completeRegistrationApi = (data) => API.post('/auth/complete-registration', data);
export const adminLoginApi = (data) => API.post('/auth/admin-login', data);

export const verifyRegisterOtpApi = (data) =>
    API.post("/auth/verify-register-otp", data);

export const sendLoginOtpApi = (data) =>
    API.post("/auth/send-login-otp", data);

export const verifyLoginOtpApi = (data) =>
    API.post("/auth/verify-login-otp", data);

/* =======================================================
   USER APIs
   ======================================================= */
export const updateProfileApi = (data) =>
    API.put("/users/profile", data);

// Admin
export const getUsersApi = () => API.get("/users");
export const getUserByIdApi = (id) => API.get(`/users/${id}`);
export const deleteUserApi = (id) => API.delete(`/users/${id}`);

/* =======================================================
   PRODUCT APIs
   ======================================================= */
export const getProductsApi = (params) =>
    API.get("/products", { params });

export const getProductByIdApi = (id) =>
    API.get(`/products/${id}`);

// Admin
export const createProductApi = (data) =>
    API.post("/products", data);

export const updateProductApi = (id, data) =>
    API.put(`/products/${id}`, data);

export const deleteProductApi = (id) =>
    API.delete(`/products/${id}`);

/* =======================================================
   CART APIs
   ======================================================= */
export const getCartApi = () => API.get("/cart");

export const addToCartApi = (data) =>
    API.post("/cart/add", data);

export const updateCartItemApi = (data) =>
    API.put("/cart/update", data);

export const removeCartItemApi = (itemId) =>
    API.delete(`/cart/item/${itemId}`);

export const clearCartApi = () => API.delete("/cart/clear");

/* =======================================================
   ORDER APIs
   ======================================================= */
export const placeOrderApi = (data) =>
    API.post("/orders", data);

export const getMyOrdersApi = () =>
    API.get("/orders/my");

export const getOrderByIdApi = (id) =>
    API.get(`/orders/${id}`);

// Admin
export const adminGetAllOrdersApi = () =>
    API.get("/orders");

export const adminUpdateOrderStatusApi = (id, data) =>
    API.put(`/orders/${id}/status`, data);

/* =======================================================
   REVIEW APIs
   ======================================================= */
export const addReviewApi = (data) =>
    API.post("/reviews", data);

export const getProductReviewsApi = (productId) =>
    API.get(`/reviews/product/${productId}`);

export const deleteReviewApi = (id) =>
    API.delete(`/reviews/${id}`);

/* =======================================================
   DIGITAL DOWNLOAD APIs
   ======================================================= */
export const getDownloadLinkApi = (orderId, productId) =>
    API.get(`/downloads/order/${orderId}/product/${productId}`);

/* =======================================================
   CATEGORY APIs
   ======================================================= */
export const getCategoriesApi = () =>
    API.get("/categories");

export const getSingleCategoryApi = (id) =>
    API.get(`/categories/${id}`);

export const createCategoryApi = (data) =>
    API.post("/categories", data);

export const updateCategoryApi = (id, data) =>
    API.put(`/categories/${id}`, data);

export const deleteCategoryApi = (id) =>
    API.delete(`/categories/${id}`);

/* =======================================================
   UPLOAD USER APIs
   ======================================================= */
export const uploadImageApi = (formData) =>
    API.post("/upload/image", formData);

export default API;
