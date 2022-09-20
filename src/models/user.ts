import mongoose from "mongoose";
import { PasswordHash } from "../services";

interface UserAttrs {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  local?: { password: string };
  google?: { id: string };
}

interface UserDoc extends mongoose.Document<any> {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  local?: { password: string };
  google?: { id: string };
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      minLength: [6, "Username must be more then 5 character"],
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      minLength: [1, "first name must be more then 1 character"],
      maxLength: [25, "first name can not be more than 25 characters"],
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
      minLength: [1, "last name must be more then 1 character"],
      maxLength: [25, "last name can not be more than 25 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    local: {
      type: new mongoose.Schema(
        {
          password: {
            type: String,
          },
        },
        { _id: false }
      ),
      select: false,
    },
    google: {
      type: new mongoose.Schema(
        {
          id: {
            type: String,
          },
        },
        { _id: false }
      ),
      select: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        ret.fullName = { firstName: ret.firstName, lastName: ret.lastName };
        delete ret._id;
        delete ret.firstName;
        delete ret.lastName;
        delete ret.local;
        delete ret.google;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("local.password")) return next();

  const hashedPassword = await PasswordHash.toHash(this.get("local.password"));

  this.set("local.password", hashedPassword);

  return next();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
