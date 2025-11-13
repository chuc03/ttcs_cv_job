// src/pages/MyJobsPage.jsx
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getMyJobs, deleteMyJob } from "@services/company/JobService";
import { Button, message, Table, Input, Popconfirm, Dropdown, Menu } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  ProfileOutlined,
  BarChartOutlined,
  EyeOutlined,
  MoreOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { formatDateTime } from "@helpers/formatDate";

const sidebarItems = [
  { key: "home", label: "Home", to: "/", icon: <HomeOutlined /> },
  { key: "my-jobs", label: "Tin tuyển dụng", to: "/company/my-jobs", icon: <FileTextOutlined /> },
  { key: "cv", label: "Quản lý CV", to: "/company/cvs", icon: <ProfileOutlined /> },
  { key: "reports", label: "Báo cáo tuyển dụng", to: "/company/reports", icon: <BarChartOutlined /> },
  { key: "logout", label: "Đăng xuất", to: "/logout", icon: <LogoutOutlined /> },
];
const tagClass = (jobType) => {
  switch (jobType) {
    case "Full-time":
      return "bg-blue-50 text-blue-800 border border-blue-200 rounded-sm px-3 py-1 font-semibold";
    case "Part-time":
      return "bg-green-50 text-green-800 border border-green-200 rounded-sm px-3 py-1 font-semibold";
    case "Contract":
      return "bg-orange-50 text-orange-800 border border-orange-200 rounded-sm px-3 py-1 font-semibold";
    case "Internship":
      return "bg-purple-50 text-purple-800 border border-purple-200 rounded-sm px-3 py-1 font-semibold";
    default:
      return "bg-gray-50 text-gray-800 border border-gray-200 rounded-sm px-3 py-1 font-semibold";
  }
};

export default function MyJobsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const fetchJobs = async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      const query = { page, limit, keyword: search?.trim() };
      const res = await getMyJobs(query);
      setJobs(res.data);
      setPagination({ current: page, pageSize: limit, total: res.total });
    } catch (e) {
      messageApi.error("Không thể tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleTableChange = (newPag) => fetchJobs(newPag.current, newPag.pageSize, keyword);
  const handleSearch = () => fetchJobs(1, pagination.pageSize, keyword);

  const handleDelete = async (id) => {
    try {
      const res = await deleteMyJob(id);
      if (res.success) {
        messageApi.success("Xóa công việc thành công");
        fetchJobs(pagination.current, pagination.pageSize, keyword);
      } else messageApi.error("Xóa thất bại");
    } catch {
      messageApi.error("Xóa thất bại");
    }
  };

  const columns = [
    { title: "STT", key: "idx", width: 60, align: "center", render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1 },
    { title: "Tiêu đề", dataIndex: "title", key: "title", render: (t) => <div className="max-w-[480px] truncate font-medium text-gray-800" title={t}>{t}</div> },
    { title: "Địa điểm", dataIndex: "location", key: "location", align: "center", render: (l) => <div className="text-sm font-semibold text-gray-700">{l}</div> },
    { title: "Loại hình", dataIndex: "jobType", key: "jobType", align: "center", render: (jt) => <div className={tagClass(jt)}>{jt}</div> },
    { title: "Lương", dataIndex: "salary", key: "salary", align: "center", render: (s) => <div className="text-sm font-semibold text-gray-700">{s || "Thỏa thuận"}</div> },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", align: "center", render: (d) => <div className="text-sm font-semibold text-gray-700">{formatDateTime(d)}</div> },
    {
      title: "Hành động", key: "action", align: "center",
      render: (_, record) => {
        const menu = (
          <Menu className="w-44" selectable={false}>
            <Menu.Item
              key="view"
              onClick={() => navigate(`/company/my-jobs/${record._id}`)}
              className="flex items-center gap-2 px-3 py-2"
            >
              <EyeOutlined className="text-base text-gray-600 mr-2" />
              <span className="text-sm text-gray-800">Xem chi tiết</span>
            </Menu.Item>

            <Menu.Item
              key="edit"
              onClick={() => navigate(`/company/my-jobs/update/${record._id}`)}
              className="flex items-center gap-2 px-3 py-2"
            >
              <EditOutlined className="text-base text-gray-600 mr-2" />
              <span className="text-sm text-gray-800">Chỉnh sửa</span>
            </Menu.Item>

            <Menu.Item key="delete" className="flex items-center gap-2 px-3 py-2">
              <Popconfirm
                title="Bạn có chắc muốn xóa job này?"
                onConfirm={() => handleDelete(record._id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <span className="flex items-center gap-2">
                  <DeleteOutlined className="text-base icon-delete" />
                  <span className="text-sm text-delete">Xóa</span>
                </span>
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );

        return (
          <div className="flex items-center justify-center">
            <Dropdown overlay={menu} trigger={['click']} overlayClassName="my-jobs-dropdown">
              <Button
                type="text"
                className="p-1 rounded-md bg-transparent hover:bg-transparent more-btn-no-color"
              >
                <MoreOutlined className="text-lg more-icon-no-color" />
              </Button>
            </Dropdown>
          </div>
        );
      }
    }

  ];

  return (
    <div className="min-h-screen flex bg-pageBg">
      {contextHolder}

      <style>{`
        /* Nút More: trong suốt, icon xám */
        .my-jobs-dropdown + .ant-dropdown, /* ensure dropdown sibling */
        .more-btn-no-color,
        .more-btn-no-color .anticon,
        .more-icon-no-color {
          background: transparent !important;
          color: #6b7280 !important; /* text-gray-500 */
        }

        /* Nếu ant places the dropdown elsewhere in DOM, target overlayClassName */
        .my-jobs-dropdown .ant-dropdown-menu {
          background: #ffffff !important;
          border: 1px solid rgba(15, 23, 42, 0.06) !important;
          box-shadow: 0 4px 8px rgba(15,23,42,0.06) !important;
        }

        .my-jobs-dropdown .ant-dropdown-menu-item,
        .my-jobs-dropdown .ant-dropdown-menu-item a,
        .my-jobs-dropdown .ant-dropdown-menu-item span {
          color: #374151 !important; /* text-gray-700 */
          background: transparent !important;
        }

        .my-jobs-dropdown .ant-dropdown-menu-item:hover,
        .my-jobs-dropdown .ant-dropdown-menu-item-active,
        .my-jobs-dropdown .ant-dropdown-menu-item-selected {
          background: rgba(17,24,39,0.04) !important; /* hover nhẹ */
          color: #111827 !important;
        }

        /* Icons inside menu inherit color */
        .my-jobs-dropdown .ant-dropdown-menu-item .anticon {
          color: inherit !important;
        }

        /* Make the "Xóa" text/icon red */
        .my-jobs-dropdown .ant-dropdown-menu-item .text-delete {
          color: #dc2626 !important; /* red-600 */
        }
        .my-jobs-dropdown .ant-dropdown-menu-item .icon-delete {
          color: #dc2626 !important;
        }

        /* Prevent theme class from coloring dropdown items */
        .my-jobs-dropdown .text-topcvBlue,
        .my-jobs-dropdown .ant-dropdown-menu-item.text-topcvBlue {
          color: inherit !important;
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 h-screen transition-all ${collapsed ? "w-20" : "w-64"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-topcvBlue text-white flex items-center justify-center rounded-sm font-bold">TD</div>
            {!collapsed && <div className="text-lg font-semibold text-gray-800">Tuyển dụng</div>}
          </div>
          <button onClick={() => setCollapsed(s => !s)} className="p-1 rounded hover:bg-gray-50 text-gray-600">
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>

        <nav className="px-1 py-3">
          <ul className="space-y-1">
            {sidebarItems.map(it => (
              <li key={it.key}>
                <NavLink to={it.to} className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md mx-2 ${isActive ? "bg-topcvBlue/10 text-topcvBlue font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                  <span className={`text-lg ${collapsed ? "mx-auto" : "text-gray-500"}`}>{it.icon}</span>
                  {!collapsed && <span className="text-sm">{it.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-semibold text-gray-900">TIN TUYỂN DỤNG</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1 shadow-sm">
                <SearchOutlined className="text-gray-400 mr-2" />
                <Input placeholder="Tìm kiếm..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onPressEnter={handleSearch} bordered={false} />
              </div>

              <Button type="default" onClick={handleSearch} className="border border-gray-200 bg-white hover:bg-gray-50">Tìm</Button>

              <Button type="primary" icon={<PlusOutlined />} onClick={() => window.location.href = "/company/my-jobs/create"} className="bg-primaryGreen border-primaryGreen hover:bg-green-700">
                Đăng tin mới
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-card p-4">
            <Table
              rowKey="_id"
              loading={loading}
              columns={columns}
              dataSource={jobs}
              pagination={{ ...pagination, showSizeChanger: true, showTotal: t => `Tổng ${t} công việc` }}
              onChange={handleTableChange}
              bordered={false}
              sticky
              rowClassName={() => "hover:bg-gray-50 transition-colors"}
              locale={{ emptyText: "Chưa có công việc nào" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
