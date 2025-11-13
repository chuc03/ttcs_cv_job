import { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import {
  HomeOutlined,
  FileTextOutlined,
  ProfileOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { Pie } from "react-chartjs-2";

const sidebarItems = [
  { key: "home", label: "Home", to: "/", icon: HomeOutlined },
  { key: "my-jobs", label: "Tin tuyển dụng", to: "/company/my-jobs", icon: FileTextOutlined },
  { key: "cv", label: "Quản lý CV", to: "/company/cvs", icon: ProfileOutlined },
  { key: "reports", label: "Báo cáo tuyển dụng", to: "/company/reports", icon: BarChartOutlined },
  { key: "logout", label: "Đăng xuất", to: "/logout", icon: LogoutOutlined },
];

// Đăng ký ChartJS (bắt buộc)
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

// Test (thay bằng service thật nếu có)
const mockFetchReport = async () => {
  await new Promise((r) => setTimeout(r, 200));
  const items = [
    { _id: "j1", title: "Frontend Developer", postedAt: new Date().toISOString(), totalCV: 45, hires: 2 },
    { _id: "j2", title: "Backend Developer", postedAt: new Date().toISOString(), totalCV: 78, hires: 3 },
    { _id: "j3", title: "Tester", postedAt: new Date().toISOString(), totalCV: 21, hires: 1 },
  ];
  const summary = {
    totalJobs: items.length,
    totalCVs: items.reduce((s, i) => s + i.totalCV, 0),
    interviews: 42,
    hires: items.reduce((s, i) => s + i.hires, 0),
  };
  return { items, summary };
};

const SmallStat = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
  </div>
);

export default function RecruitmentReportsPage() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ totalJobs: 0, totalCVs: 0, interviews: 0, hires: 0 });
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterJob, setFilterJob] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await mockFetchReport();
      setItems(res.items);
      setSummary(res.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const filteredItems = useMemo(() => {
    let list = items.slice();
    if (filterJob) list = list.filter((it) => it._id === filterJob);
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((it) => new Date(it.postedAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((it) => new Date(it.postedAt) <= to);
    }
    return list;
  }, [items, filterJob, dateFrom, dateTo]);

  const pieData = useMemo(() => {
    const labels = filteredItems.map((i) => i.title);
    const data = filteredItems.map((i) => i.totalCV ?? 0);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ["#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#F87171"],
          hoverOffset: 6,
        },
      ],
    };
  }, [filteredItems]);

  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, padding: 8, usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label ?? "";
              const value = ctx.parsed ?? 0;
              return `${label}: ${value} CV`;
            },
          },
        },
        title: {
          display: false,
        },
      },
    }),
    []
  );

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setFilterJob("");
  };

  return (
    <div className="min-h-screen flex bg-pageBg">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 h-screen transition-all ${collapsed ? "w-20" : "w-64"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-topcvBlue text-white flex items-center justify-center rounded-sm font-bold">TD</div>
            {!collapsed && <div className="text-lg font-semibold text-gray-800">Tuyển dụng</div>}
          </div>

          <button
            onClick={() => setCollapsed((s) => !s)}
            className="p-1 rounded hover:bg-gray-50 text-gray-600"
            aria-label={collapsed ? "Mở menu" : "Thu gọn menu"}
            title={collapsed ? "Mở menu" : "Thu gọn menu"}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>

        <nav className="px-1 py-3">
          <ul className="space-y-1">
            {sidebarItems.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.key}>
                  <NavLink
                    to={it.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md mx-2 transition-colors ${
                        isActive ? "bg-topcvBlue/10 text-topcvBlue font-semibold" : "text-gray-700 hover:bg-gray-50"
                      }`
                    }
                    aria-label={it.label}
                    title={it.label}
                  >
                    <span className={`text-lg ${collapsed ? "mx-auto" : "text-gray-500"}`}>
                      <Icon className={collapsed ? "text-xl" : "text-lg text-gray-500"} />
                    </span>
                    {!collapsed && <span className="text-sm">{it.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Báo cáo tuyển dụng</h1>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-1 border rounded-md"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-1 border rounded-md"
              />

              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="px-3 py-1 border rounded-md"
              >
                <option value="">Tất cả tin</option>
                {items.map((it) => (
                  <option key={it._id} value={it._id}>
                    {it.title}
                  </option>
                ))}
              </select>

              <button onClick={fetch} className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50">
                Lọc
              </button>

              <button onClick={resetFilters} className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50">
                Đặt lại
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SmallStat title="Tổng tin tuyển dụng" value={summary.totalJobs} />
            <SmallStat title="Tổng CV" value={summary.totalCVs} />
            <SmallStat title="Phỏng vấn" value={summary.interviews} />
            <SmallStat title="Đã tuyển" value={summary.hires} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-4 overflow-x-auto">
              {loading ? (
                <div className="py-10 text-center text-gray-500">Đang tải...</div>
              ) : filteredItems.length === 0 ? (
                <div className="py-10 text-center text-gray-500">Không có báo cáo</div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b">
                      <th className="py-3 px-3 text-left">Tin tuyển dụng</th>
                      <th className="py-3 px-3 text-center w-36">Ngày đăng</th>
                      <th className="py-3 px-3 text-center w-24">Tổng CV</th>
                      <th className="py-3 px-3 text-center w-24">Tuyển được</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((it) => (
                      <tr key={it._id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 font-medium text-gray-800">{it.title}</td>
                        <td className="py-3 px-3 text-center text-sm text-gray-700">{new Date(it.postedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-center text-sm text-gray-700">{it.totalCV}</td>
                        <td className="py-3 px-3 text-center text-sm text-gray-700">{it.hires}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Phân bố CV theo tin</h3>
              <div style={{ minHeight: 220 }}>
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">Không có dữ liệu cho biểu đồ</div>
                ) : (
                  <Pie data={pieData} options={pieOptions} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
