import { Request, Response } from "express";
import { User } from "../models";
import { BadRequestError } from "../errors";
import { PasswordHash } from "../services";

export const foo = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) throw new BadRequestError("Email in Use");

  const hashedPassword = await PasswordHash.toHash(password);

  const result = User.build({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  await result.save();

  if (!result) throw new Error("Something Wrong happened!");
  res.send(result);
};

export const bar = async (req: Request, res: Response) => {
  const storedUser = await User.findOne({ firstName: "hosni" }).select(
    "+password"
  );
  console.log(storedUser);
  if (!storedUser) throw new Error("No User Found");
  if (await PasswordHash.compare(storedUser.password!, "123456"))
    return res.send(storedUser);
  res.send("<h1>Incorrect Password</h1>");
};
