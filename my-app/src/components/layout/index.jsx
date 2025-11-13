import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Dropdown, message } from "antd";
import { logout } from "@services/common/AuthService";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./LayoutDefault.scss";

import {
  LuBell,
  LuBriefcase,
  LuFileText,
  LuInbox,
  LuLayoutDashboard,
  LuLogOut,
  LuSettings,
  LuUser,
} from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout as userLogout } from "@store/UserReducer";

const LayoutDefault = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const response = await logout();
    if (response.success) {
      dispatch(userLogout());
      message.success("Đăng xuất thành công");
      setTimeout(() => navigate("/login"), 800);
    } else {
      message.error("Đăng xuất thất bại");
    }
  };

  const getInitial = (fullName) => {
    if (!fullName) return "?";
    const parts = fullName.trim().split(/\s+/);
    const last = parts[parts.length - 1] || parts[0];
    return last.charAt(0).toUpperCase();
  };

  const profieMenuItems = [
    {
      key: "dashboard",
      label: "Tổng quan",
      icon: <LuLayoutDashboard size={16} />,
    },
    {
      key: "cv",
      label: "Hồ sơ đính kèm",
      icon: <LuFileText size={16} />,
    },
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <LuUser size={16} />,
    },
    {
      key: "job",
      label: "Việc làm của tôi",
      icon: <LuBriefcase size={16} />,
    },
    {
      key: "invitation",
      label: "Lời mời công việc",
      icon: <LuInbox size={16} />,
    },
    {
      key: "notification",
      label: "Thông báo",
      icon: <LuBell size={16} />,
    },
    {
      key: "setting",
      label: "Cài đặt",
      icon: <LuSettings size={16} />,
    },
    {
      key: "logout",
      label: "Đăng xuất",

      icon: <LuLogOut size={16} />,
    },
  ];

  const profieMenu = {
    items: [
      {
        key: "user-info",
        label: (
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full border object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                {getInitial(user?.fullName)}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-[16px] text-gray-900">
                {user?.fullName}
              </h4>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        ),
        disabled: true,
      },
      {
        type: "divider",
      },
      ...profieMenuItems,
    ],
    onClick: async ({ key }) => {
      if (key === "logout") {
        handleLogout();
      } else {
        navigate(`/${key}`);
      }
    },
  };

  return (
    <div className="layout-default">
      <header className="layout-header bg-gradient-to-r from-green-700 to-teal-500 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="layout-header__logo">
          <NavLink to={"/"}>Home</NavLink>
        </div>
        <div className="layout-header__menu">
          <ul>
            <li>
              <NavLink to={"/jobs"}>Việc làm</NavLink>
            </li>
            <li>
              <NavLink to={"/companies"}>Công ty</NavLink>
            </li>
            <li>
              <NavLink to={"/blogs"}>Bài viết</NavLink>
            </li>
            <li>
              <NavLink to={"/templates"}>Hồ sơ cá nhân</NavLink>
            </li>
            <li>
              <NavLink to={"/about"}>Giới thiệu</NavLink>
            </li>
          </ul>
        </div>
        <div className="layout-header__account">
          {user ? (
            <div>
              <Dropdown
                menu={profieMenu}
                trigger={["hover"]}
                placement="bottomLeft"
                overlayStyle={{
                  width: 280,
                }}
                overlayClassName="custom-dropdown"
              >
                <div className="relative cursor-pointer flex items-center gap-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-9 h-9 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full border bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                      {getInitial(user?.fullName)}
                    </div>
                  )}
                  <span className="absolute right-0 bottom-[-1px] w-4 h-4 rounded-full flex items-center justify-center bg-white">
                    <RiArrowDropDownLine />
                  </span>
                </div>
              </Dropdown>
            </div>
          ) : (
            <>
              <NavLink
                to={"/login"}
                className="px-4 py-1.5 rounded-full bg-amber-50 hover:bg-white/20 hover:text-amber-50 transition-colors"
              >
                <button>Đăng nhập</button>
              </NavLink>
              <NavLink
                to={"/register"}
                className="bg-white text-green-700 px-4 py-1.5 rounded-full shadow-sm hover:bg-blue-100 transition-colors"
              >
                <button>Đăng kí</button>
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="layout-main pt-16  bg-gray-50 bg-gradient-to-br from-teal-90 to-teal-50">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutDefault;
