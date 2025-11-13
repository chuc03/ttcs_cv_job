import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { getAllJobs } from "@services/client/JobsService";
import { Select, Input, Button, Pagination, notification, Space } from "antd";
import {
  LuMapPin,
  LuSearch,
  LuBriefcase,
  LuDollarSign,
  LuHeart,
  LuExternalLink,
  LuClock,
} from "react-icons/lu";
import { parseHTMLList } from "@helpers/parseHTMLList";
import { getRelativeTime } from "@helpers/getRelavtiveTime";
import { useDispatch, useSelector } from "react-redux";
import {
  applyJob,
  getApplicationsByUser,
} from "@services/client/ApplicationService";
import { addAppliedJob, setAppliedJobs } from "@store/AppliedReducer";

const optionCity = [
  {
    value: "all",
    label: <span style={{ fontSize: 16 }}>Tất cả thành phố</span>,
  },
  { value: "hanoi", label: <span style={{ fontSize: 16 }}>Hà Nội</span> },
  {
    value: "hochiminh",
    label: <span style={{ fontSize: 16 }}>Hồ Chí Minh</span>,
  },
  { value: "danang", label: <span style={{ fontSize: 16 }}>Đà Nẵng</span> },
  { value: "haiphong", label: <span style={{ fontSize: 16 }}>Hải Phòng</span> },
  { value: "cantho", label: <span style={{ fontSize: 16 }}>Cần Thơ</span> },
];

export default function JobList() {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const appliedJobIds = useSelector((state) => state.appliedJobs.appliedJobs);
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("location") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [pageSize] = useState(5);
  const [totalJobs, setTotalJobs] = useState(0);

  const [notificationApi, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();

  const openNotification = () => {
    const btn = (
      <Space>
        <NavLink
          to={"/login"}
          className="!px-4 !py-1.5 !text-white rounded-full !bg-teal-500 hover:bg-white/20 hover:text-amber-50 transition-colors"
        >
          Đăng nhập
        </NavLink>
        <NavLink
          to={"/register"}
          className="!bg-white !text-green-700 px-4 py-1.5 rounded-full shadow-sm hover:bg-blue-100 transition-colors"
        >
          Đăng kí
        </NavLink>
      </Space>
    );
    notificationApi.warning({
      message: "Vui lòng đăng nhập để ứng tuyển",
      description: "Bạn cần đăng nhập để có thể ứng tuyển vào công việc này.",
      btn,
    });
  };

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
      };

      if (searchKeyword.trim()) {
        params.search = searchKeyword.trim();
      }

      if (selectedCity && selectedCity !== "all") {
        params.location = selectedCity;
      }

      updateURLParams(params);

      const response = await getAllJobs(params);

      if (response.success) {
        const jobsData = response.data || [];
        setJobs(jobsData);
        setTotalJobs(response.pagination?.total || jobsData.length);

        if (jobsData.length > 0) {
          setSelectedJob(jobsData[0]);
        } else {
          setSelectedJob(null);
        }
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateURLParams = (params) => {
    const newParams = {};

    if (params.page > 1) {
      newParams.page = params.page;
    }

    if (params.search) {
      newParams.search = params.search;
    }

    if (params.location && params.location !== "all") {
      newParams.location = params.location;
    }

    setSearchParams(newParams);
  };

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const fetchAppliedJobs = async () => {
    if (!user) return;
    try {
      const response = await getApplicationsByUser();
      if (response.success && response.data) {
        const jobIds = response.data.map((app) => app.job?._id || app.job);
        dispatch(setAppliedJobs(jobIds));
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };
  useEffect(() => {
    fetchAppliedJobs();
  }, [user]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobs(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplication = async (jobId) => {
    if (!user) {
      openNotification();
      return;
    }

    try {
      const response = await applyJob({ jobId });
      if (!response.success || !response.data) {
        notificationApi.error({
          message: "Ứng tuyển thất bại",
          description: "Đã có lỗi xảy ra khi ứng tuyển.",
        });
        return;
      }

      dispatch(addAppliedJob(jobId));
      notificationApi.success({
        message: "Ứng tuyển thành công",
        description: "Bạn đã ứng tuyển vào công việc thành công.",
      });
    } catch (error) {
      console.error("Error applying for job:", error);
    }
  };

  return (
    <div className="min-h-screen w-full ">
      {contextHolder}
      <div className="w-full bg-gradient-to-r from-green-600 to-teal-500 shadow-lg py-8 mb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 flex gap-4 items-center">
            <Select
              suffixIcon={<LuMapPin size={18} className="text-gray-400" />}
              defaultValue="all"
              value={selectedCity}
              onChange={(value) => setSelectedCity(value)}
              options={optionCity}
              className="w-56"
              size="large"
              style={{ height: "48px" }}
            />

            <Input
              prefix={<LuSearch size={20} className="text-gray-400" />}
              placeholder="Tìm kiếm theo kỹ năng, chức vụ, công ty..."
              size="large"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className="flex-1 rounded-lg"
              style={{
                height: "48px",
                fontSize: "16px",
              }}
            />

            <Button
              type="primary"
              size="large"
              icon={<LuSearch size={20} />}
              onClick={handleSearch}
              className="flex items-center gap-2 px-8 font-semibold"
              style={{
                background: "#d43f3f",
                borderColor: "#d43f3f",
                height: 48,
                borderRadius: "8px",
              }}
            >
              Tìm Kiếm
            </Button>
          </div>
        </div>
      </div>

      {/* DANH SÁCH JOB */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Đang tải việc làm...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              Không tìm thấy việc làm phù hợp
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Tìm thấy
                <span className="font-semibold text-gray-800">{totalJobs}</span>{" "}
                việc làm
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
              {/* Left: Job List - Can scroll freely */}
              <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                {jobs.map((job) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    onClick={() => setSelectedJob(job)}
                    className={`bg-white rounded-lg p-4 shadow-md cursor-pointer transition-all border-2 hover:shadow-lg ${
                      selectedJob?._id === job._id
                        ? "border-red-400 border-l-5"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400 text-sm">
                        {getRelativeTime(job.createdAt)}
                      </span>
                      {job.isFeatured && (
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs font-bold">
                          HOT
                        </span>
                      )}
                    </div>

                    <a
                      href={`/jobs/${job._id}`}
                      className="text-lg font-bold text-gray-800 mb-3 block hover:text-red-400 transition"
                    >
                      {job.title}
                    </a>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-xl">
                        <img
                          src={job.company?.logo.url}
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </div>
                      <a
                        className="text-gray-700 font-medium hover:underline underline-offset-2"
                        href={`/companies/${job.company?.slug}`}
                      >
                        {job.company?.user.fullName || "Company"}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-green-600 font-semibold ">
                      <LuDollarSign size={18} />
                      <span>{job.salary}</span>
                    </div>

                    <hr className="border-b border-dashed border-[#dedede] my-3" />

                    {job.experienceRequirement && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <span>✓ {job.experienceRequirement}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <LuBriefcase size={16} />
                      <span>{job.category}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <LuMapPin size={16} />
                      <span>
                        {job.jobType} • {job.location}
                      </span>
                    </div>

                    {job.keywords && job.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.keywords.slice(0, 4).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:outline outline-gray-700 cursor-pointer"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Right: Job Detail*/}
              {selectedJob && (
                <motion.div
                  key={selectedJob._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  duration={{ duration: 0.6 }}
                  className="bg-white rounded-lg shadow-lg sticky top-20 h-[calc(100vh-90px)] flex flex-col"
                >
                  <div className="p-6 pb-2 bg-white rounded-t-lg flex-shrink-0">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 rounded bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={selectedJob.company?.logo.url}
                            alt={selectedJob.company?.fullName}
                            style={{
                              objectFit: "contain",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </div>
                        <div>
                          <a
                            href={`/jobs/${selectedJob._id}`}
                            className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2 hover:text-red-400 transition"
                          >
                            {selectedJob.title}
                            <LuExternalLink
                              size={20}
                              className="text-gray-400 cursor-pointer hover:text-gray-600"
                            />
                          </a>
                          <a
                            href={`/companies/${selectedJob.company?.slug}`}
                            className="text-gray-700 font-medium mb-2 hover:underline underline-offset-2"
                          >
                            {selectedJob.company?.user.fullName}
                          </a>

                          <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                            <LuDollarSign size={20} />
                            <span>{selectedJob.salary}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition">
                        <LuHeart
                          size={28}
                          className="text-red-400 hover:text-red-500"
                        />
                      </button>
                    </div>

                    {appliedJobIds.includes(selectedJob._id) ? (
                      <Button
                        type="primary"
                        size="large"
                        disabled
                        className="w-full my-4"
                        style={{
                          background: "#ffffff",
                          height: 48,
                        }}
                      >
                        Đã ứng tuyển
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        className="w-full my-4"
                        style={{
                          background: "#d43f3f",
                          height: 48,
                        }}
                        onClick={() => handleApplication(selectedJob._id)}
                      >
                        Ứng tuyển
                      </Button>
                    )}
                  </div>

                  <hr className="border-b border-[#dedede] mx-6" />

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <LuBriefcase size={18} />
                        <span>{selectedJob.jobType || "Full-time"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <LuClock size={18} />
                        <span>{getRelativeTime(selectedJob.createdAt)}</span>
                      </div>
                    </div>

                    <hr className="border-b border-dashed border-[#dedede] my-4" />

                    {selectedJob.keywords &&
                      selectedJob.keywords.length > 0 && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-700">
                            Kỹ năng:
                          </h3>
                          {selectedJob.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-transparent hover:border-gray-700 cursor-pointer transition-colors"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}

                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-700">
                        Chuyên môn:
                      </h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-transparent hover:border-gray-700 cursor-pointer transition-colors">
                        {selectedJob.category}
                      </span>
                    </div>

                    <hr className="border-b border-dashed border-[#dedede] my-4" />

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Địa điểm:
                      </h3>
                      <div className="flex items-start gap-2 text-gray-700">
                        <LuMapPin size={18} className="mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{selectedJob.location}</p>
                          {selectedJob.specificAddress && (
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedJob.specificAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr className="border-b border-dashed border-[#dedede] my-4" />

                    {selectedJob.benefits && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          Phúc lợi
                        </h3>
                        <ul className="space-y-2">
                          {parseHTMLList(selectedJob.benefits).map(
                            (benefit, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <span className="text-red-500 mt-1">•</span>
                                <span>{benefit}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    <hr className="border-b border-dashed border-[#dedede] my-4" />

                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Mô tả công việc
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedJob.description}
                      </p>
                    </div>

                    <hr className="border-b border-dashed border-[#dedede] my-4" />

                    {selectedJob.requirements && (
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          Yêu cầu công việc
                        </h3>
                        <li className="flex items-center gap-2 mb-1 text-gray-700">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{selectedJob.level}</span>
                        </li>
                        <ul className="space-y-2">
                          {parseHTMLList(selectedJob.requirements).map(
                            (req, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{req}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Additional Requirements */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Học vấn</p>
                        <p className="font-semibold text-gray-800">
                          {selectedJob.degreeRequirement}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Giới tính</p>
                        <p className="font-semibold text-gray-800">
                          {selectedJob.genderRequirement}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Pagination */}
            {totalJobs > pageSize && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={totalJobs}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} việc làm`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
