import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getBlogById,
  addComment,
  toggleLike,
  deleteComment,
  getBlogs,
} from "@services/client/BlogService";
import { motion } from "framer-motion";
import {
  LuChevronRight,
  LuClock,
  LuHeart,
  LuTag,
  LuTrash,
  LuUser,
} from "react-icons/lu";
import { createMarkup } from "@helpers/createMarkup";
import { formatDate, formatDateTime } from "@helpers/formatDate";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [similarBlogs, setSimilarBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("user");
  const commentEndRef = useRef(null);

  const isAdmin = user && user.role === "admin";
  const canDelete = (commentUserId) => {
    if (!user?._id) return false;
    return (
      isAdmin || blog?.author?._id === user._id || commentUserId === user._id
    );
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        setLoadingSimilar(true);
        setError(null);
        setBlog(null);
        setSimilarBlogs([]);
        const res = await getBlogById(id, { signal: controller.signal });
        if (!res.data?.data) throw new Error("Blog not found");
        const currentBlog = res.data.data;
        setBlog(currentBlog);
        let isLiked = false;
        if (user?._id && Array.isArray(currentBlog.likes)) {
          isLiked = currentBlog.likes.includes(user._id);
        }
        setLiked(isLiked);

        try {
          const likedBlogs = JSON.parse(
            localStorage.getItem("likedBlogs") || "{}"
          );
          likedBlogs[id] = isLiked;
          localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
        } catch (e) {
          localStorage.removeItem("likedBlogs");
        }

        if (currentBlog.category) {
          try {
            const similarRes = await getBlogs({
              category: currentBlog.category,
              limit: 4,
              signal: controller.signal,
            });
            setSimilarBlogs(
              (similarRes.data.data || [])
                .filter((b) => b._id !== id)
                .slice(0, 3)
            );
          } catch (simErr) {
            if (simErr.name !== "AbortError") {
              setSimilarBlogs([]);
            }
          } finally {
            setLoadingSimilar(false);
          }
        } else {
          setLoadingSimilar(false);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching blog:", err);
        setError(
          err.message === "Blog not found"
            ? "Không tìm thấy bài viết này."
            : "Không thể tải blog. Vui lòng thử lại sau."
        );
        setLoadingSimilar(false);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchBlogData();
    window.scrollTo(0, 0);
    return () => controller.abort();
  }, [id, user?._id]);

  const scrollToBottom = () => {
    commentEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !token) return;

    setLoadingComment(true);
    try {
      const res = await addComment(id, comment, token);
      const newComments = Array.isArray(res.data?.data)
        ? res.data.data
        : blog?.comments || [];
      setBlog((prevBlog) => ({ ...prevBlog, comments: newComments }));
      setComment("");
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setLoadingComment(false);
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!token || !window.confirm("Bạn có chắc muốn xóa bình luận này?"))
      return;

    try {
      await deleteComment(id, commentId, token);
      setBlog((prevBlog) => ({
        ...prevBlog,
        comments: prevBlog.comments.filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      alert("Xóa bình luận thất bại.");
    }
  };

  const handleLike = async () => {
    if (!token) {
      alert("Bạn cần đăng nhập để thích bài viết");
      return;
    }

    const originalLiked = liked;
    const originalLikesCount = blog?.likesCount ?? blog?.likes?.length ?? 0;
    const newLikedState = !liked;
    const newLikesCount = newLikedState
      ? originalLikesCount + 1
      : Math.max(0, originalLikesCount - 1);

    setLiked(newLikedState);
    setBlog((prev) => ({ ...prev, likesCount: newLikesCount }));

    try {
      const likedBlogs = JSON.parse(localStorage.getItem("likedBlogs") || "{}");
      likedBlogs[id] = newLikedState;
      localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
    } catch (e) {
      // Silent fail for localStorage
    }

    try {
      const res = await toggleLike(id, token);
      if (res.data?.data) {
        setLiked(res.data.data.liked);
        setBlog((prev) => ({ ...prev, likesCount: res.data.data.likesCount }));
        try {
          const likedBlogs = JSON.parse(
            localStorage.getItem("likedBlogs") || "{}"
          );
          likedBlogs[id] = res.data.data.liked;
          localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
        } catch (e) {
          // Silent fail for localStorage
        }
      }
    } catch (err) {
      setLiked(originalLiked);
      setBlog((prev) => ({ ...prev, likesCount: originalLikesCount }));
      try {
        const likedBlogs = JSON.parse(
          localStorage.getItem("likedBlogs") || "{}"
        );
        likedBlogs[id] = originalLiked;
        localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
      } catch (e) {
        // Silent fail for localStorage
      }
      alert("Có lỗi xảy ra, không thể thay đổi trạng thái thích.");
    }
  };

  
  if (loading && !blog) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-red-600 text-xl font-semibold">{error}</p>
        <Link
          to="/blog"
          className="mt-6 inline-block text-green-600 hover:underline font-medium"
        >
          ← Quay lại danh sách Blog
        </Link>
      </div>
    );
  }
  if (!blog) return null;

  return (
    <div className="bg-gradient-to-br from-teal-50 via-white to-green-50 py-10 px-4 ">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 md:p-10 border border-gray-200 overflow-hidden"
        >
          <div className="mb-6 text-sm text-gray-500 flex items-center gap-1.5">
            <Link to="/" className="hover:text-green-700 font-medium">
              Trang chủ
            </Link>
            <LuChevronRight />
            <Link to="/blog" className="hover:text-green-700 font-medium">
              Blog
            </Link>
            <LuChevronRight />
            <span className="text-gray-700 font-medium line-clamp-1">
              {blog.title}
            </span>
          </div>

          {blog.image?.url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 rounded-lg overflow-hidden aspect-video shadow-md"
            >
              <img
                src={blog.image.url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5 leading-tight">
            {blog.title}{" "}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 mb-8 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-1.5" title="Ngày đăng">
              <LuClock size={15} />
              <span>{formatDate(blog.createdAt)}</span>{" "}
            </div>
            {blog.author?.name && (
              <div className="flex items-center gap-1.5" title="Tác giả">
                <LuUser size={15} />
                <span className="font-semibold text-gray-800">
                  {blog.author.name}
                </span>
              </div>
            )}
            {blog.category && (
              <div className="flex items-center gap-1.5" title="Chuyên mục">
                <LuTag
                  size={15}
                  style={{
                    color: "#33803F",
                  }}
                />
                <span className="font-semibold text-green-700 capitalize">
                  {blog.category}
                </span>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="prose prose-base max-w-none text-gray-800 leading-relaxed prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-green-600 hover:prose-a:text-green-700 prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-5 prose-li:my-2 prose-img:rounded-lg prose-img:shadow-md"
          >
            <div dangerouslySetInnerHTML={createMarkup(blog.content)} />
          </motion.div>

          <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col items-center gap-3">
            <button
              onClick={() => handleLike()}
              className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-300 flex items-center gap-2.5 text-base transform hover:-translate-y-1 ${
                liked
                  ? "bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-green-300"
                  : "bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500 hover:text-green-700"
              } ${!token ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <LuHeart size={15} />
              <span>{liked ? "Đã thích" : "Thích bài viết"}</span>
            </button>
            <span className="text-sm text-gray-600">
              {blog.likesCount ?? (blog.likes?.length || 0)} lượt thích
            </span>
          </div>

          {/* Comments Section */}
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Bình luận ({blog.comments?.length || 0})
            </h2>

            {/* Comment Input */}
            <div className="mb-10 p-6 bg-slate-100 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {token
                  ? `Bình luận với tư cách ${user?.name || "User"}`
                  : "Để lại bình luận"}
              </h3>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition duration-200 text-sm"
                rows="3"
                placeholder={
                  token
                    ? "Chia sẻ ý kiến của bạn..."
                    : "Vui lòng đăng nhập để bình luận."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={loadingComment || !token}
              />
              <div className="text-right mt-4">
                <button
                  onClick={handleAddComment}
                  disabled={loadingComment || !token || !comment.trim()}
                  className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loadingComment ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-5">
              {Array.isArray(blog?.comments) && blog.comments.length > 0 ? (
                [...blog.comments]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((c) => (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                        {c.user?.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {c.user?.name || "Người dùng ẩn"}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                      {canDelete(c.user?._id) && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="ml-1 text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Xóa bình luận"
                        >
                          <LuTrash />
                        </button>
                      )}
                    </motion.div>
                  ))
              ) : (
                <div className="text-center py-10 px-6 bg-slate-50 rounded-lg border border-dashed">
                  <p className="text-gray-600 italic text-base">
                    Chưa có bình luận nào cho bài viết này.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Hãy là người đầu tiên chia sẻ ý kiến của bạn!
                  </p>
                </div>
              )}
              <div ref={commentEndRef}></div>
            </div>
          </div>
        </motion.div>

        {/* --- Sidebar --- */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1 space-y-6 sticky top-6"
        >
          {/* Author Info */}
          {blog.author && (
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Thông tin tác giả
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-2xl flex-shrink-0 border-2 border-white shadow-sm">
                  {blog.author.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-base">
                    {blog.author.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {blog.author.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Similar Blogs */}
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
              Bài viết liên quan
            </h3>
            {loadingSimilar ? (
              <div className="space-y-5 animate-pulse">
                <div className="aspect-video bg-slate-200 rounded-md"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
                <hr className="my-3 border-slate-100" />
                <div className="aspect-video bg-slate-200 rounded-md"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
              </div>
            ) : similarBlogs.length > 0 ? (
              <div className="space-y-5">
                {similarBlogs.map((simBlog) => (
                  <Link
                    to={`/blog/${simBlog._id}`}
                    key={simBlog._id}
                    className="block group transition-transform duration-300 hover:-translate-y-1"
                  >
                    {simBlog.image?.url && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-3 shadow-sm border border-gray-200">
                        <img
                          src={simBlog.image.url}
                          alt={simBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <p className="font-semibold text-base text-gray-800 group-hover:text-green-700 line-clamp-2 leading-snug mb-1">
                      {simBlog.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(simBlog.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-4">
                Không có bài viết liên quan.
              </p>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
export default BlogDetail;
