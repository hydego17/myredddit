import { Router, Request, Response } from "express";
import Post from "../entities/Post";

import auth from "../middlewares/auth";

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;

  const user = res.locals.user;

  if (title.trim() === "") {
    res.status(400).json({ title: "Title must not be empty" });
  }

  try {
    //   TODO: find sub
    const post = new Post({ title, body, user, subName: sub });

    await post.save();

    return res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.post("/", auth, createPost);

export default router;
