import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck, Timer, User, Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    checkUserApi,
    sendLoginOtpApi,
    sendRegisterOtpApi,
    verifyLoginOtpApi,
    verifyEmailOtpApi,
} from "../utils/Api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { register } = useAuth();

    // STEPS: 1=Email, 2=LoginOTP, 3=RegisterOTP, 4=RegisterDetails
    const [step, setStep] = useState(1);

    // DATA
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [registrationToken, setRegistrationToken] = useState(null);
    const [userDetails, setUserDetails] = useState({
        firstName: "",
        lastName: "",
        username: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    // UI STATE
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(0);
    const [showPass, setShowPass] = useState(false);

    // -------------------------------------------
    // HELPERS
    // -------------------------------------------
    const startTimer = () => {
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleBack = () => {
        setError("");
        setOtp("");
        if (step === 4) setStep(3); // Back to OTP? Or maybe back to Email is better
        else setStep(1);
    };

    // -------------------------------------------
    // STEP 1: CHECK EMAIL
    // -------------------------------------------
    const handleCheckEmail = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError("");

        try {
            const res = await checkUserApi({ email });
            if (res.data.exists) {
                // USER EXISTS -> LOGIN FLOW
                await sendLoginOtpApi({ email });
                setStep(2); // Login OTP
                startTimer();
            } else {
                // NEW USER -> REGISTER FLOW
                await sendRegisterOtpApi({ email });
                setStep(3); // Register OTP
                startTimer();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    // -------------------------------------------
    // STEP 2: VERIFY LOGIN OTP
    // -------------------------------------------
    const handleVerifyLoginOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await verifyLoginOtpApi({ email, otp });
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                // Force reload or use context to update user
                window.location.href = res.data.user.role === "admin" ? "/admin" : "/shop";
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
        }
        setLoading(false);
    };

    // -------------------------------------------
    // STEP 3: VERIFY REGISTER OTP
    // -------------------------------------------
    const handleVerifyRegisterOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // We need the tempToken from the sendRegisterOtp response, 
            // BUT wait, in my backend implementation I returned tempToken in sendRegisterOtp.
            // I didn't save it in state here.
            // Let's fix handleCheckEmail to save tempToken if new user.
            // Actually, for better UX, I should probably refactor handleCheckEmail to handle the response better.
            // But wait, the backend `verifyEmailOtp` requires `tempToken`.
            // So I need to capture it in handleCheckEmail.

            // RE-IMPLEMENTING handleCheckEmail logic inside this function for clarity? No.
            // I will fix handleCheckEmail below.

            // Assuming I have tempToken in state (I will add it).
            const res = await verifyEmailOtpApi({ email, otp, tempToken: userDetails.tempToken });

            if (res.data.success) {
                setRegistrationToken(res.data.registrationToken);
                setStep(4); // Register Details
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP or Session Expired");
        }
        setLoading(false);
    };

    // -------------------------------------------
    // STEP 4: COMPLETE REGISTRATION
    // -------------------------------------------
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (userDetails.password !== userDetails.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const result = await register({
                ...userDetails,
                email,
                registrationToken
            });

            if (result.success) {
                navigate("/shop");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Registration failed");
        }
        setLoading(false);
    };

    // -------------------------------------------
    // RE-IMPLEMENTED CHECK EMAIL TO SAVE TEMP TOKEN
    // -------------------------------------------
    const handleCheckEmailWithToken = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError("");

        try {
            const checkRes = await checkUserApi({ email });
            if (checkRes.data.exists) {
                // USER EXISTS -> LOGIN FLOW
                await sendLoginOtpApi({ email });
                setStep(2); // Login OTP
                startTimer();
            } else {
                // NEW USER -> REGISTER FLOW
                const otpRes = await sendRegisterOtpApi({ email });
                // Save tempToken for verification
                setUserDetails(prev => ({ ...prev, tempToken: otpRes.data.tempToken }));
                setStep(3); // Register OTP
                startTimer();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to process request");
        }
        setLoading(false);
    };

    // Resend OTP Handler
    const handleResend = async () => {
        setLoading(true);
        try {
            if (step === 2) {
                await sendLoginOtpApi({ email });
            } else {
                const res = await sendRegisterOtpApi({ email });
                setUserDetails(prev => ({ ...prev, tempToken: res.data.tempToken }));
            }
            startTimer();
            setError("");
        } catch (err) {
            setError("Failed to resend OTP");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_30px_rgba(235,46,148,0.2)]"
            >
                {/* HEADER */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-zg-accent flex items-center justify-center shadow-lg">
                        <span className="text-black font-bold text-2xl">Z</span>
                    </div>
                    <h2 className="mt-4 text-3xl font-bold text-white tracking-wide">
                        {step === 4 ? "Complete Profile" : "Welcome Back"}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {step === 1 && "Enter your email to continue"}
                        {(step === 2 || step === 3) && `OTP sent to ${email}`}
                        {step === 4 && "Just a few more details"}
                    </p>
                </div>

                {/* ERROR */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg overflow-hidden"
                        >
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FORMS */}
                <div className="relative">

                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <form onSubmit={handleCheckEmailWithToken} className="space-y-5">
                            <div className="relative">
                                <Mail className="w-5 h-5 absolute left-4 top-3 text-zg-accent" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-zg-accent transition-colors"
                                />
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                disabled={loading}
                                type="submit"
                                className="w-full bg-zg-accent text-black py-3 rounded-xl font-bold shadow-lg shadow-zg-accent/30 flex items-center justify-center gap-2"
                            >
                                {loading ? "Checking..." : "Continue"} <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </form>
                    )}

                    {/* STEP 2 & 3: OTP */}
                    {(step === 2 || step === 3) && (
                        <form onSubmit={step === 2 ? handleVerifyLoginOtp : handleVerifyRegisterOtp} className="space-y-5">
                            <div className="relative">
                                <ShieldCheck className="w-5 h-5 absolute left-4 top-3 text-zg-accent" />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-xl py-3 pl-12 pr-4 tracking-widest text-lg"
                                />
                            </div>

                            <div className="flex justify-between items-center text-gray-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <Timer className="w-4 h-4" />
                                    <span>{timer > 0 ? `Resend in ${timer}s` : "Didn't receive code?"}</span>
                                </div>
                                {timer === 0 && (
                                    <button type="button" onClick={handleResend} className="text-zg-accent hover:underline">
                                        Resend
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition"
                                >
                                    Back
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    disabled={loading}
                                    type="submit"
                                    className="flex-[2] bg-zg-accent text-black py-3 rounded-xl font-bold shadow-lg shadow-zg-accent/30"
                                >
                                    {loading ? "Verifying..." : "Verify"}
                                </motion.button>
                            </div>
                        </form>
                    )}

                    {/* STEP 4: DETAILS */}
                    {step === 4 && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3 top-3.5 text-zg-accent" />
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        required
                                        value={userDetails.firstName}
                                        onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                                        className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3 top-3.5 text-zg-accent" />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        required
                                        value={userDetails.lastName}
                                        onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                                        className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3 top-3.5 text-zg-accent" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    required
                                    value={userDetails.username}
                                    onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm"
                                />
                            </div>

                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-zg-accent" />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    required
                                    value={userDetails.phone}
                                    onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-zg-accent" />
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Password"
                                    required
                                    value={userDetails.password}
                                    onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })}
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-zg-accent" />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    required
                                    value={userDetails.confirmPassword}
                                    onChange={(e) => setUserDetails({ ...userDetails, confirmPassword: e.target.value })}
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm"
                                />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                disabled={loading}
                                type="submit"
                                className="w-full bg-zg-accent text-black py-3 rounded-xl font-bold shadow-lg shadow-zg-accent/30 mt-2"
                            >
                                {loading ? "Creating Account..." : "Complete Registration"}
                            </motion.button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
