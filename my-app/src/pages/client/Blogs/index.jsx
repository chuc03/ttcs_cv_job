import { useEffect, useState, useMemo } from "react";
import { getBlogs } from "@services/client/BlogService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuClock, LuHeart, LuMessageSquareText } from "react-icons/lu";

import { formatDate } from "@helpers/formatDate";

const categories = [
  "Tất cả",
  "Hướng nghiệp",
  "Kỹ năng phỏng vấn",
  "Tối ưu CV",
  "Tin tuyển dụng",
  "Công nghệ & AI",
  "Chia sẻ trải nghiệm",
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
const BlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 7;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogs();
        setBlogs(response.data.data || []);
      } catch (error) {
        console.error("Error loading blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    if (activeCategory === "Tất cả") return blogs;
    return blogs.filter((b) => b.category === activeCategory);
  }, [blogs, activeCategory]);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const currentBlogs = useMemo(() => {
    const start = (currentPage - 1) * blogsPerPage;
    return filteredBlogs.slice(start, start + blogsPerPage);
  }, [currentPage, filteredBlogs]);

  const featured = currentBlogs[0] || null;
  const otherBlogs = currentBlogs.slice(1);

  const handleBlogClick = (id) => {
    if (!id) return;
    navigate(`/blog/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Đang tải bài viết...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white relative ">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #10b981 100%)`,
          backgroundSize: "100% 100%",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-teal-50 via-white to-teal-100 opacity-80" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900 mb-3 tracking-tight">
            Bài viết
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Cập nhật kiến thức, mẹo nghề nghiệp, và xu hướng tuyển dụng giúp bạn
            xây dựng hồ sơ chuyên nghiệp và nổi bật.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              className={`relative px-6 py-2 rounded-full text-sm font-medium border overflow-hidden transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-green-400 to-teal-500 text-white border-transparent shadow-lg shadow-green-400/50"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-500 hover:text-white hover:shadow-lg hover:shadow-green-400/30"
              }`}
            >
              <span className="relative z-10">{cat}</span>
            </motion.button>
          ))}
        </div>

        {/* Featured Blog */}
        {featured && (
          <motion.div
            className="grid md:grid-cols-2 gap-10 items-center bg-gradient-to-r from-[#0a3d2e] to-[#1d7a57] rounded-3xl p-10 mb-10 shadow-2xl relative cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            }}
            transition={{ duration: 0.3 }}
            onClick={() => handleBlogClick(featured._id)}
          >
            <div className="text-white space-y-6 z-10">
              <h2 className="text-xl md:text-2xl font-bold text-green-100 leading-snug">
                {featured.title}
              </h2>
              <p className="text-gray-100 text-lg leading-relaxed">
                {featured.description}
              </p>
              <div className="flex items-center gap-4 text-sm mt-2 group">
                <div className="flex items-center gap-1">
                  <LuClock />
                  <span className="group-hover:text-white transition-colors">
                    {formatDate(featured.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <LuHeart />
                  <span className="group-hover:text-white transition-colors">
                    {featured.likesCount || featured.likes?.length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <LuMessageSquareText />
                  <span className="group-hover:text-white transition-colors">
                    {featured.commentsCount || featured.comments?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center relative z-10">
              <img
                src={
                  featured.image
                    ? typeof featured.image === "string"
                      ? featured.image
                      : featured.image.url
                    : "/cv-featured.svg"
                }
                alt={featured.title || "Blog Featured"}
                className="rounded-3xl shadow-2xl max-h-96 object-cover border border-white/30 transition-transform duration-500 hover:scale-105 hover:rotate-2"
              />
              <div className="absolute inset-0 bg-black/20 rounded-3xl opacity-0 hover:opacity-20 transition-opacity duration-500" />
            </div>
          </motion.div>
        )}

        {/* Grid Blogs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + activeCategory}
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 mb-8"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1 },
              },
              exit: {
                opacity: 0,
                y: -20,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {otherBlogs.map((blog) => (
              <motion.div
                key={blog._id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:border-green-300 cursor-pointer"
                variants={cardVariants}
              >
                <motion.img
                  src={
                    blog.image
                      ? typeof blog.image === "string"
                        ? blog.image
                        : blog.image.url
                      : "/default-thumbnail.jpg"
                  }
                  alt={blog.title || "Blog Image"}
                  className="h-56 w-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  onClick={() => handleBlogClick(blog._id)}
                />
                <div className="p-6 flex flex-col justify-between h-60">
                  <div>
                    <p className="text-xs uppercase font-semibold text-green-600 mb-2 tracking-wide">
                      {blog.category || "Kỹ năng nghề nghiệp"}
                    </p>
                    <h3
                      className="text-lg font-semibold text-[#0a3d2e] mb-3 line-clamp-2 hover:text-green-700 transition-colors"
                      onClick={() => handleBlogClick(blog._id)}
                    >
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {blog.description}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <LuClock />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <LuHeart />
                        <span>
                          {blog.likesCount || blog.likes?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <LuMessageSquareText />
                        <span>
                          {blog.commentsCount || blog.comments?.length || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBlogClick(blog._id)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        Đọc thêm →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-green-500 hover:text-white disabled:opacity-50 transition"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-1 rounded-md border font-medium transition ${
                  currentPage === i + 1
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-green-500 hover:text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-green-500 hover:text-white disabled:opacity-50 transition"
            >
              Next →
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-2">
          Tổng số bài: {filteredBlogs.length} | Trang {currentPage} /{" "}
          {totalPages}
        </p>
      </div>
    </div>
  );
};
export default BlogPage;
