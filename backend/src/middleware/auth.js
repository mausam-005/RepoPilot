const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    return next();  
  } catch (error) {
    const refreshToken = req.header("refreshToken");
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "malformed" });
    }
    try {
      //console.log to see what is inside decoded,(the payload embedded in auth controller of login)
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const { newAccessToken, newRefreshToken } = generataTokenPair(decoded);
      res.header("x-access-token", newAccessToken);
      res.header("x-refresh-token", newRefreshToken);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token is invalid" });
    }
  }
};

const generataTokenPair = (decoded) => {
  const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  const refreshToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return { newAccessToken: accessToken, newRefreshToken: refreshToken };
};

module.exports = auth;