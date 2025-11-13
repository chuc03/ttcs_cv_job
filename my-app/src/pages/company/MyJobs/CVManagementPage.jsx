// src/pages/company/CVManagementPage.jsx
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FileTextOutlined,
  ProfileOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EyeOutlined,
  PushpinOutlined,
  DeleteOutlined,
  MoreOutlined,
  HomeOutlined,
  LogoutOutlined,
  
} from "@ant-design/icons";
import { message, Popconfirm, Button, Dropdown } from "antd";

/*
  CV Management page with left Sidebar and action dropdown per row:
  - Actions: Xem chi tiết (Eye), Ghim (Pushpin), Xóa (Delete, red, with Popconfirm)
  - Uses messageApi for notifications
*/

const sidebarItems = [
  { key: "home", label: "Home", to: "/", icon: <HomeOutlined /> },
  { key: "my-jobs", label: "Tin tuyển dụng", to: "/company/my-jobs", icon: <FileTextOutlined /> },
  { key: "cv", label: "Quản lý CV", to: "/company/cvs", icon: <ProfileOutlined /> },
  { key: "reports", label: "Báo cáo tuyển dụng", to: "/company/reports", icon: <BarChartOutlined /> },
  { key: "logout", label: "Đăng xuất", to: "/logout", icon: <LogoutOutlined /> },
];

const mockFetchCVs = async ({ page = 1, limit = 10, keyword = "" } = {}) => {
  const total = 3;
  const items = Array.from({ length: Math.min(limit, total - (page - 1) * limit) }).map((_, i) => {
    const idx = (page - 1) * limit + i + 1;
    return {
      _id: `cv-${idx}`,
      name: `Ứng viên ${idx}`,
      title: ["Senior Frontend", "Backend Engineer", "QA Tester"][idx % 3],
      position: ["Frontend Developer", "Backend Developer", "Tester"][idx % 3],
      status: ["Mới", "Đang xử lý", "Từ chối"][idx % 3],
      submittedAt: new Date(Date.now() - idx * 86400000).toISOString(),
    };
  });

  await new Promise((r) => setTimeout(r, 200));
  return { data: items, total };
};

const mockDeleteCV = async (id) => {
  await new Promise((r) => setTimeout(r, 150));
  return { success: true };
};

const mockPinCV = async (id) => {
  await new Promise((r) => setTimeout(r, 150));
  return { success: true };
};

const StatusPill = ({ status }) => {
  const map = {
    "Mới": "bg-blue-50 text-blue-800",
    "Đang xử lý": "bg-yellow-50 text-yellow-800",
    "Từ chối": "bg-red-50 text-red-800",
  };
  return <span className={`text-xs font-semibold px-3 py-1 rounded-md ${map[status] ?? "bg-gray-50 text-gray-800"}`}>{status}</span>;
};

export default function CVManagementPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [cvs, setCvs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const fetch = async (p = 1, l = limit, q = keyword) => {
    setLoading(true);
    try {
      const res = await mockFetchCVs({ page: p, limit: l, keyword: q });
      setCvs(res.data);
      setTotal(res.total);
      setPage(p);
    } catch (e) {
      messageApi.error("Không thể tải danh sách CV");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetch(1, limit, keyword);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await mockDeleteCV(id);
      if (res.success) {
        messageApi.success("Xóa CV thành công");
        fetch(page, limit, keyword);
      } else {
        messageApi.error("Xóa thất bại");
      }
    } catch {
      messageApi.error("Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async (id) => {
    setLoading(true);
    try {
      const res = await mockPinCV(id);
      if (res.success) {
        messageApi.success("Đã ghim CV");
      } else {
        messageApi.error("Ghim thất bại");
      }
    } catch {
      messageApi.error("Ghim thất bại");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // build dropdown menu for each row (returns menu element)
  const rowMenu = (record) => (
    <div className="py-1">
      <button
        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50"
        onClick={() => navigate(`/company/cvs/${record._id}`)}
        type="button"
      >
        <EyeOutlined /> <span>Xem chi tiết</span>
      </button>
        <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.99)" }} className="my-1" />
      <button
        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50"
        onClick={() => handlePin(record._id)}
        type="button"
      >
        <PushpinOutlined /> <span>Ghim</span>
      </button>
        <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.99)" }} className="my-1" />
      <Popconfirm
        title="Bạn có chắc muốn xóa CV này?"
        onConfirm={() => handleDelete(record._id)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <button className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 text-red-600" type="button">
          <DeleteOutlined style={{ color: "currentColor" }} /> <span>Xóa</span>
        </button>
      </Popconfirm>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-pageBg">
      {contextHolder}

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
                <NavLink to={it.to} className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md mx-2 transition-colors ${isActive ? "bg-topcvBlue/10 text-topcvBlue font-semibold" : "text-gray-700 hover:bg-gray-50"}`
                }>
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý CV</h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1 shadow-sm">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="outline-none w-64 text-sm"
                placeholder="Tìm CV theo tên, vị trí..."
              />
            </div>

            <button onClick={handleSearch} className="px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-sm">
              Tìm
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 border-b">
                  <th className="py-3 px-3 w-16 text-center">STT</th>
                  <th className="py-3 px-3">Họ và tên</th>
                  <th className="py-3 px-3 text-center w-48">Tiêu đề</th>
                  <th className="py-3 px-3 text-center w-48">Vị trí</th>
                  <th className="py-3 px-3 text-center w-40">Trạng thái</th>
                  <th className="py-3 px-3 text-center w-40">Ngày gửi</th>
                  <th className="py-3 px-3 text-center w-28">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-6 px-3 text-center text-gray-500">Đang tải...</td>
                  </tr>
                ) : cvs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-6 px-3 text-center text-gray-500">Chưa có CV nào</td>
                  </tr>
                ) : (
                  cvs.map((c, i) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 text-center text-sm text-gray-700">{(page - 1) * limit + i + 1}</td>
                      <td className="py-3 px-3 max-w-[220px] truncate text-sm font-medium text-gray-800">{c.name}</td>
                      <td className="py-3 px-3 text-center text-sm text-gray-700">{c.title}</td>
                      <td className="py-3 px-3 text-center text-sm text-gray-700">{c.position}</td>
                      <td className="py-3 px-3 text-center"><StatusPill status={c.status} /></td>
                      <td className="py-3 px-3 text-center text-sm text-gray-700">{new Date(c.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          <Dropdown overlay={() => rowMenu(c)} trigger={['click']}>
                            <Button type="text" className="p-1">
                              <MoreOutlined />
                            </Button>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Tổng: {total} CV</div>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); fetch(1, Number(e.target.value), keyword); }}
                className="text-sm border rounded-md px-2 py-1"
              >
                <option value="5">5 / trang</option>
                <option value="10">10 / trang</option>
                <option value="20">20 / trang</option>
              </select>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => canPrev && fetch(page - 1)}
                  disabled={!canPrev}
                  className={`px-3 py-1 rounded-md border ${!canPrev ? "text-gray-400 border-gray-100" : "hover:bg-gray-50"}`}
                >
                  Trước
                </button>
                <div className="px-3 py-1 text-sm"> {page} / {Math.max(1, Math.ceil(total / limit))} </div>
                <button
                  onClick={() => canNext && fetch(page + 1)}
                  disabled={!canNext}
                  className={`px-3 py-1 rounded-md border ${!canNext ? "text-gray-400 border-gray-100" : "hover:bg-gray-50"}`}
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
