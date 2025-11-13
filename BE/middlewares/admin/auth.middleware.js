import { JWT_SECRET } from "../../configs/system.js";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive || user.deleted)
      return res.status(403).json({ success: false, message: "Forbidden" });

    res.locals.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      username: user.username,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
