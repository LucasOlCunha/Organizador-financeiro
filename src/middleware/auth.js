// middleware/auth.js
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token)
    return res.status(401).json({ error: "Invalid token format" });

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "CHANGE_ME_PLEASE"
    );
    const id = Number(payload?.id ?? payload?.userId ?? payload?.sub);
    if (!id) return res.status(401).json({ error: "Invalid token payload" });

    req.user = { id };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
