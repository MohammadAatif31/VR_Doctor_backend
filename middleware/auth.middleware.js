import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing"
      }); 
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = decoded.id;
    req.userRole = decoded.role;

                                 
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token invalid"
    });
  }
};