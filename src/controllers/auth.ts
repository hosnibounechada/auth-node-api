import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { BadRequestError, NotFoundError } from "../errors";
import { UsernameGenerator, PasswordHash } from "../services";
import { isValidObjectId, ObjectId } from "mongoose";

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.currentUser) return res.send({ currentUser: null });

  if (!isValidObjectId(req.currentUser.id))
    throw new BadRequestError("Invalid Request");

  const currentUser = await User.findById(req.currentUser.id);

  if (!currentUser) throw new NotFoundError();

  return res.send({ currentUser: currentUser });
};

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, google } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) throw new BadRequestError("E-mail in Use");

  const username = await UsernameGenerator.generate(firstName, lastName);

  const user = User.build({
    firstName,
    lastName,
    username,
    email,
    local: { password },
  });
  await user.save();

  res.status(201).send(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  const user = await User.findOne(email ? { email } : { username }).select(
    "+local"
  );

  if (!user || !user.local?.password)
    throw new BadRequestError("Invalid Credentials");

  if (!(await PasswordHash.compare(user.local.password, password)))
    throw new BadRequestError("Invalid Credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_KEY!,
    {
      expiresIn: 300,
    }
  );
  return res.status(200).send({ user, token });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) throw new BadRequestError("No user Found");

  user.set(req.body);

  await user.save();

  res.status(200).send({ user });
};

export const updateUserPassword = async (req: Request, res: Response) => {
  const { email, oldPassword, password } = req.body;

  const user = await User.findOne({ email }).select("+local");

  if (!user || !user.local?.password)
    throw new BadRequestError("No user Found");

  if (!(await PasswordHash.compare(user.local.password, oldPassword)))
    throw new BadRequestError("Incorrect password!");

  user.set({ local: { password } });

  await user.save();

  res.status(200).send(user);
};

export const test = async (req: Request, res: Response) => {
  console.log(req.body);
  res.status(200).send(req.body);
};
