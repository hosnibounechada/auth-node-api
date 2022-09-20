import { Request, Response } from "express";
import { User } from "../models";
import { BadRequestError } from "../errors";
import { UsernameGenerator, PasswordHash } from "../services";

export const signup = async (req: Request, res: Response) => {
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

  return res.status(200).send(user);
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
