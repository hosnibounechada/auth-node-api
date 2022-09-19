import mongoose from "mongoose";

interface UserAttrs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface UserDoc extends mongoose.Document<any> {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
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
    },
    password: {
      type: String,
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
        delete ret.__v;
      },
    },
  }
);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
