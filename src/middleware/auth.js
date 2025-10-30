import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "secret";
    const payload = jwt.verify(token, secret);
    // attach basic payload to request
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ erro: "Token inválido." });
  }
};

export default auth;
