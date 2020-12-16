import { Request, Response, Router } from "express";
import { validate, isEmpty } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import auth from "../middlewares/auth";
import User from "../entities/User";

// Register Route
const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    //  Validate data
    let errors: any = {};
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    if (emailUser) errors.email = "Email is already taken";
    if (usernameUser) errors.username = "Username is already taken";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    //  Create the user
    const user = new User({ email, username, password });

    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json({ errors });

    await user.save();

    //  Return the user
    return res.json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Login Route
const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Check empty field
    let errors: any = {};

    if (isEmpty(username)) errors.username = "Username must not be empty";
    if (isEmpty(password)) errors.password = "Password must not be empty";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "user not found" });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      return res.status(401).json({ password: "Password is incorrect" });

    // Set Token
    const token = jwt.sign({ username }, process.env.JWT_SECRET);

    // Set Cookie
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600 * 24,
        path: "/",
      })
    );

    return res.json(user);
  } catch (err) {}
};

// Me Route
const me = async (_: Request, res: Response) => {
  return res.json(res.locals.user);
};

// Logout Route
const logout = (_: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );

  return res.status(200).json({ success: true });
};

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);
router.get("/logout", auth, logout);

export default router;
