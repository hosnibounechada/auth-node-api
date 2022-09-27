import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

import redis from "../services/redis";
import twilio from "../services/twilio";
import { sendEmail } from "../services/mailer";

import { User } from "../models";
import { TWILIO_STATUS } from "../types";
import { BadRequestError, GoneError, NotFoundError } from "../errors";
import { RandomGenerator, PasswordHash, JwtProvider } from "../services";
import { confirmationEmail, resetPasswordEmail } from "../templates/email";

const client = redis.getRedisClient();

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.currentUser) return res.send({ currentUser: null });

  if (!isValidObjectId(req.currentUser.id)) throw new BadRequestError("Invalid Request");

  const currentUser = await User.findById(req.currentUser.id);

  if (!currentUser) throw new NotFoundError();

  return res.send({ currentUser: currentUser });
};

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, google } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) throw new BadRequestError("E-mail in Use");

  const username = RandomGenerator.username(firstName, lastName);

  const user = User.build({
    firstName,
    lastName,
    username,
    email,
    local: { password },
    google: { id: google },
  });
  await user.save();

  const code = RandomGenerator.randomInt(1000, 9999);

  await client.setEx(email, Number(process.env.CODE_TTL) || 60 * 5, code.toString());

  const options = confirmationEmail(email, code);

  const response = await sendEmail(options);

  if (!response) throw new BadRequestError("Failed to send Confirmation Email");

  res.status(201).send({ user, code });
};

export const login = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  const user = await User.findOne(email ? { email } : { username }).select("+local");

  if (!user || !user.local?.password) throw new BadRequestError("Invalid Credentials");

  if (!(await PasswordHash.compare(user.local.password, password))) throw new BadRequestError("Invalid Credentials");

  const data = { id: user.id, email: user.email };

  const token = JwtProvider.jwtAuth(data);

  return res.status(200).send({ user, token });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) throw new BadRequestError("Invalid Request");

  const value = await client.get(email);

  if (!value) throw new GoneError();

  if (value != code) throw new BadRequestError("Incorrect Code!");

  user.set({ verified: true });

  await user.save();

  return res.status(200).send({ user });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) throw new BadRequestError("Not Found");

  user.set(req.body);

  await user.save();

  res.status(200).send({ user });
};

export const updateUserPassword = async (req: Request, res: Response) => {
  const id = req.currentUser?.id;
  const { oldPassword, password } = req.body;

  const user = await User.findById(id).select("+local");

  if (!user || !user.local?.password) throw new BadRequestError("Invalid Request");

  if (!(await PasswordHash.compare(user.local.password, oldPassword))) throw new BadRequestError("Incorrect password!");

  user.set({ local: { password } });

  await user.save();

  res.status(200).send(user);
};

export const checkExistence = async (req: Request, res: Response) => {
  const { username, email, phone } = req.body;

  const exist = await User.exists(email ? { email } : username ? { username } : { phone });

  if (!exist) return res.status(200).send({ exist: false });

  res.status(200).send({ exist: true });
};

export const updateUsername = async (req: Request, res: Response) => {
  const id = req.currentUser?.id;
  const { username } = req.body;

  const user = await User.findById(id);
  if (!user) throw new BadRequestError("Could not update");

  user.set({ username });
  await user.save();

  res.status(200).send(user);
};

export const sendEmailCode = async (req: Request, res: Response) => {
  const id = req.currentUser?.id;
  const { email, password } = req.body;

  const user = await User.findById(id).select("+local");

  if (!user || !user.local?.password) throw new BadRequestError("Incorrect Password");

  if (!(await PasswordHash.compare(user.local.password, password))) throw new BadRequestError("Invalid Credentials");

  const code = RandomGenerator.randomInt(1000, 9999);

  await client.setEx(email, Number(process.env.CODE_TTL) || 60 * 5, code.toString());

  const options = confirmationEmail(email, code);

  const response = await sendEmail(options);

  if (!response) throw new BadRequestError("Failed to send Confirmation Email");

  res.status(200).send({ user, code });
};

export const updateEmail = async (req: Request, res: Response) => {
  const id = req.currentUser?.id;
  const { email, code } = req.body;

  const user = await User.findById(id);
  if (!user) throw new BadRequestError("Not found");

  const value = await client.get(email);

  console.log(value);

  if (!value) throw new GoneError();

  if (value != code) throw new BadRequestError("Incorrect Code");

  user.set({ email });

  await user.save();

  res.status(200).send({ user });
};

export const sendPhoneSMS = async (req: Request, res: Response) => {
  const { phone } = req.body;

  const existedPhone = await User.findOne({ phone });
  if (existedPhone) throw new BadRequestError("Phone number in use");

  const status = await twilio.sendPhoneCode(phone);

  if (status == TWILIO_STATUS.PENDING) return res.status(201).send({ phone });
  throw new BadRequestError("Try Again");
};

export const confirmPhone = async (req: Request, res: Response) => {
  const id = req.currentUser?.id;
  const { phone, code } = req.body;

  const user = await User.findById(id);
  if (!user) throw new BadRequestError("Invalid user");

  const status = await twilio.verifyPhoneCode(phone, code);

  if (status == TWILIO_STATUS.REJECTED) throw new BadRequestError("Wrong verification code");

  if (status == TWILIO_STATUS.APPROVED) {
    user.set({ phone });
    user.save();
    return res.status(200).send(user);
  }
  throw new BadRequestError("Please try later!");
};

export const forgotPasswordCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) throw new BadRequestError("Not found");

  const code = RandomGenerator.randomInt(1000, 9999);

  await client.setEx(email, Number(process.env.CODE_TTL) || 60 * 5, code.toString());

  const options = resetPasswordEmail(email, code);

  const response = await sendEmail(options);

  if (!response) throw new BadRequestError("Couldn't send Email");

  res.status(200).send({ success: true });
};

export const confirmPasswordCode = async (req: Request, res: Response) => {
  const { email, password, code } = req.body;

  const value = await client.get(email);

  if (!value) throw new BadRequestError("Code expired");

  if (value != code) throw new BadRequestError("Wrong code");

  const user = await User.findOne({ email });

  if (!user) throw new BadRequestError("Email doesn't exist");

  user.set({ password: password });

  user.save();

  res.status(200).send(user);
};

export const deleteAccount = async (req: Request, res: Response) => {
  const id = req.currentUser?.id;

  const user = await User.findById(id);

  if (!user) throw new BadRequestError("Not found");

  user.remove();

  await user.save();

  res.status(204).send({ success: true });
};
