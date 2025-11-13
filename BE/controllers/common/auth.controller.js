import User from "../../models/user.model.js";
import UserDTO from "../../dtos/user.dto.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../configs/system.js";
import jwt from "jsonwebtoken";
import Role from "../../models/role.model.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);

    const user = await User.findOne({
      username,
      isActive: true,
      deleted: false,
    }).populate({ path: "role_id", select: "title permissions" });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    console.log("✅ Đăng nhập thành công:", user);

    user.timeLogin = new Date();
    await user.save();

    Object.keys(req.cookies).forEach((name) => {
      res.clearCookie(name, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    });

    const payload = {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: {
        id: user.role_id._id,
        title: user.role_id.title,
        permissions: user.role_id.permissions,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userDTO = new UserDTO(user);

    res.status(200).json({
      success: true,

      data: userDTO,
    });
  } catch (err) {
    console.error("❌ Lỗi khi đăng nhập:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const tokenOnServer = req.cookies.token;
    if (!tokenOnServer) {
      return res.status(401).json({ success: false });
    }

    const decoded = jwt.verify(tokenOnServer, JWT_SECRET);
    // console.log("decoded", decoded);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false });
    }

    const user = await User.findOne({
      _id: decoded.id,
      isActive: true,
      deleted: false,
    }).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra token:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({ success: true, message: "Đăng xuất thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const register = async (req, res) => {
  try {
    const { username, password, fullName, email, role } = req.body;

    console.log(username, password, fullName, email, role);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Tên đăng nhập đã tồn tại" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã được sử dụng" });
    }

    const roleId = await Role.findOne({
      title: { $regex: new RegExp(`^${role}$`, "i") },
    });
    if (!roleId) {
      return res
        .status(400)
        .json({ success: false, message: "Vai trò không hợp lệ" });
    }
    const newUser = new User({
      username,
      password,
      fullName,
      email,
      role_id: roleId,
    });
    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      data: savedUser,
    });
  } catch (err) {
    console.error("❌ Lỗi khi đăng ký:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
