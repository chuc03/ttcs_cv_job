import { AuthLayout } from "@components/layout/AuthAdminLayout";

import { Button, Form, Input, message } from "antd";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "@services/common/AuthService";
import { setUser } from "@store/UserReducer";
import { LuLock, LuLogIn, LuUser } from "react-icons/lu";
import { getRedirectPath, isAdminRole } from "@helpers/roleHelper";
import { logout } from "@services/common/AuthService";

const LoginAdmin = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginAuth = async (values) => {
    try {
      const response = await login(values);

      if (!response.success) {
        messageApi.error(
          response.errors?.[0] ||
            response.message ||
            "Tài khoản hoặc mật khẩu không chính xác"
        );
        return;
      }

      if (!isAdminRole(response.data.role)) {
        await logout();
        messageApi.warning("Bạn không có quyền truy cập trang quản trị!");
        setTimeout(() => {
          navigate("/login");
        }, 800);
        return;
      }

      dispatch(setUser(response.data));
      messageApi.success("Đăng nhập thành công");

      const redirectPath = getRedirectPath(response.data.role);
      setTimeout(() => {
        navigate(redirectPath);
      }, 800);
    } catch (error) {
      console.error("Login failed:", error);
      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  };

  return (
    <div
      className="min-h-screen "
      style={{
        background:
          "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)",
      }}
    >
      {contextHolder}
      <AuthLayout>
        <div className="p-4">
          <div className="name flex gap-2 items-center text-amber-50">
            <div className=" text-2xl font-semibold flex items-center justify-center h-7 w-7 rounded-full">
              <LuLogIn />
            </div>
            <p className="text-2xl font-semibold">Trang quản trị</p>
          </div>

          <div className="flex flex-col justify-center items-center mt-20">
            <div className="mb-6text-center">
              <h1 className="text-3xl font-bold text-amber-50">Đăng nhập</h1>
            </div>

            <Form
              name="basic"
              layout="vertical"
              style={{ width: 400 }}
              initialValues={{ remember: true }}
              onFinish={loginAuth}
              autoComplete="true"
            >
              <Form.Item
                label={
                  <div className="flex items-center gap-1 text-amber-50">
                    <LuUser size={16} />
                    <span className=" text-[16px]">Tên đăng nhập</span>
                  </div>
                }
                name="username"
                rules={[{ required: true, message: "Nhập tên đăng nhập" }]}
              >
                <Input
                  className="shadow-sm focus:shadow-lg focus:ring-2 focus:ring-blue-400 border-none px-4 h-12"
                  placeholder="Nhập tên đăng nhập"
                />
              </Form.Item>

              <Form.Item
                label={
                  <div className="flex items-center gap-1 text-amber-50">
                    <LuLock size={16} />
                    <span className="text-[16px] ">Mật khẩu</span>
                  </div>
                }
                name="password"
                rules={[{ required: true, message: "Nhập mật khẩu!" }]}
              >
                <Input.Password
                  className="shadow-sm focus:shadow-lg focus:ring-2 focus:ring-blue-400 border-none px-4 h-12"
                  placeholder="Nhập mật khẩu"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full !h-12 !shadow-lg !text-lg mt-3"
                  size="large"
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
};

export default LoginAdmin;
