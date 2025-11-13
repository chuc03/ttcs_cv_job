import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@services/common/AuthService";

import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setUser } from "@store/UserReducer";
import { LuLock, LuUser } from "react-icons/lu";
import { message } from "antd";
import { getRedirectPath } from "@helpers/roleHelper";
import { logout } from "@services/common/AuthService";
import { isAdminRole } from "@helpers/roleHelper";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(""); 

    try {
      const response = await login({ username, password });

      if (!response.success) {
        setError(
          response.errors?.[0] || "Tài khoản hoặc mật khẩu không chính xác."
        );
        return;
      }

      if (isAdminRole(response.data.role)) {
        await logout();
        message.warning("Vui lòng đăng nhập qua trang quản trị!");
        setTimeout(() => {
          navigate("/admin/auth/login");
        }, 1000);
        return;
      }

      dispatch(setUser(response.data));
      message.success("🎉 Đăng nhập thành công!");

      const redirectPath = getRedirectPath(response.data.role);
      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-5 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 md:p-6 rounded-xl shadow-xl border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
          🔐 Đăng nhập
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-6 text-center bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className=" mb-1.5 text-sm font-semibold text-gray-700 flex items-center gap-1"
            >
              <LuUser size={15} />
              <span>
                Tên tài khoản <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                className="w-full border border-gray-300 p-3  rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200" // Cải thiện input style
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="VD: traan123"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="flex items-center gap-1 mb-1.5 text-sm font-semibold text-gray-700"
            >
              <LuLock size={15} />
              <span>
                Mật khẩu <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200" // Cải thiện input style
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed text-base" // Đổi màu, thêm hiệu ứng
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản?
          <Link
            to="/register"
            className="font-semibold text-green-600 hover:text-green-700 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
