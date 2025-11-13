import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getJobById } from "@services/client/JobsService";
import { motion } from "framer-motion";
import {
  LuClock,
  LuDollarSign,
  LuHeart,
  LuMapPin,
  LuSquareTerminal,
} from "react-icons/lu";
import { Button, notification, Space } from "antd";
import { getRelativeTime } from "@helpers/getRelavtiveTime";
import { parseHTMLList } from "@helpers/parseHTMLList";

import { applyJob } from "@services/client/ApplicationService";
import { addAppliedJob } from "@store/AppliedReducer";
import { useDispatch, useSelector } from "react-redux";

const DetailJob = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const appliedJobIds = useSelector((state) => state.appliedJobs?.appliedJobs);
  const [notificationApi, contextHolder] = notification.useNotification();

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

  useEffect(() => {
    if (!id) return;
    const fetchJobDetail = async () => {
      try {
        const response = await getJobById(id);
        if (response.data.success) {
          setJob(response.data.data);
          setCompany(response.data.data.company);
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };
    fetchJobDetail();
  }, [id]);

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
    <>
      <div className="overflow-x-hidden">
        <div className="min-h-screen relative bg-[#f7f7f7] pb-12">
          <div
            className="h-130 z-1
           w-[calc(100vw+130px)] bg-gradient-to-r from-green-700 to-teal-500 absolute top-[-10%]  left-[-4%] right-[-12%]"
            style={{
              borderRadius: "0 0 70% 50%",
            }}
          ></div>
          <div className="px-8 ">
            <div className="flex gap-6 text-white mx-15 mt-8 items-start">
              {job && (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className=" text-black z-10 w-[70%] rounded-t-lg "
                >
                  <div className="p-6 pb-2 bg-white rounded-t-lg flex-shrink-0   ">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div>
                          <a
                            href={`/jobs/${job._id}`}
                            className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2 hover:text-red-400 transition"
                          >
                            {job.title}
                          </a>
                          <a
                            href={`/companies/${job.company?.slug}`}
                            className="text-gray-700 font-medium mb-2 hover:underline underline-offset-2"
                          >
                            {job.company?.user.fullName}
                          </a>

                          <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                            <LuDollarSign size={20} />
                            <span>{job.salary}</span>
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

                    {appliedJobIds?.includes(job._id) ? (
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
                        onClick={() => handleApplication(job._id)}
                      >
                        Ứng tuyển
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="bg-white p-6 pt-0 rounded-b-lg shadow-md flex flex-col gap-2">
                      <p className="flex gap-1 items-center text-gray-600">
                        <LuMapPin size={16} />
                        {job.specificAddress}
                      </p>
                      <p className="flex gap-1 items-center text-gray-600">
                        <LuSquareTerminal size={16} />
                        Làm việc tại văn phòng
                      </p>
                      <p className="flex gap-1 items-center text-gray-600">
                        <LuClock size={16} />
                        {getRelativeTime(job.createdAt)}
                      </p>

                      <hr className="border-b border-dashed border-[#dedede] my-2" />

                      {job.keywords && job.keywords.length > 0 && (
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-700 w-30 flex-shrink-0 text-sm">
                            Kỹ năng:
                          </h3>
                          <div className="flex flex-wrap gap-2 ">
                            {job.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full  text-[12px] border border-transparent hover:border-gray-700 cursor-pointer transition-colors"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-700 w-30 flex-shrink-0 text-sm">
                          Chuyên môn:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[12px] border border-transparent hover:border-gray-700 cursor-pointer transition-colors">
                            {job.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-700 w-30 flex-shrink-0 text-sm">
                          Lĩnh vực:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[12px] border border-transparent hover:border-gray-700 cursor-pointer transition-colors">
                            {job.company.industry}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                      {job.benefits && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Phúc lợi
                          </h3>
                          <ul className="space-y-2">
                            {parseHTMLList(job.benefits).map((benefit, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <span className="text-red-500 mt-1">•</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <hr className="border-b border-dashed border-[#dedede] my-4" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          Mô tả công việc
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {job.description}
                        </p>
                      </div>

                      <hr className="border-b border-dashed border-[#dedede] my-4" />

                      {job.requirements && (
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Yêu cầu công việc
                          </h3>
                          <li className="flex items-center gap-2 text-gray-700 mb-1">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{job.level}</span>
                          </li>
                          <ul className="space-y-2">
                            {parseHTMLList(job.requirements).map((req, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Học vấn</p>
                          <p className="font-semibold text-gray-800">
                            {job.degreeRequirement}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm mb-1">
                            Giới tính
                          </p>
                          <p className="font-semibold text-gray-800">
                            {job.genderRequirement}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div className="bg-white rounded-lg w-[30%] z-10 px-4 py-6">
                <div className="flex text-center">
                  <img
                    onClick={() => navigate(`/companies/${company?.slug}`)}
                    className="w-30 h-30 rounded-sm"
                    src={company?.logo?.url}
                    alt={company?.user?.fullName}
                  />

                  <div className="flex flex-col text-start gap-2 pl-3">
                    <a
                      href={`/companies/${company?.slug}`}
                      className="text-2xl font-bold text-gray-800  hover:text-red-500 transition"
                    >
                      {company?.user?.fullName}
                    </a>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid grid-rows-[auto] gap-2">
                    <div className="flex justify-between border-b border-dashed border-gray-300 py-2">
                      <span className="text-gray-400 text-sm">
                        Năm thành lập:
                      </span>
                      <span className="text-gray-700">
                        {company?.foundedYear}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-gray-300 py-2">
                      <span className="text-gray-400 text-sm">
                        Mô hình công ty:
                      </span>
                      <span className="text-gray-700">
                        {company?.companyModel}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-gray-300 py-2">
                      <span className="text-gray-400 text-sm">Lĩnh vực:</span>
                      <span className="text-gray-700">{company?.industry}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-gray-300 py-2">
                      <span className="text-gray-400 text-sm">Quy mô:</span>
                      <span className="text-gray-700">{company?.size}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-gray-300 py-2">
                      <span className="text-gray-400 text-sm">Quốc gia:</span>
                      <span className="text-gray-700">{company?.country}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-gray-300 py-2">
                      <span className="text-gray-400 text-sm">
                        Thời gian làm việc:
                      </span>
                      <span className="text-gray-700">{company?.workTime}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-gray-400 text-sm">
                        Làm việc ngoài giờ:
                      </span>
                      <span className="text-gray-700">Không có</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailJob;
