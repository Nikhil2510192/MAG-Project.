import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Add the user data to the request object
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};