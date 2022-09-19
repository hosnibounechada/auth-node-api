import "dotenv/config";
import app from "./app";
import mongoose from "mongoose";

const main = async () => {
  const PORT = process.env.PORT || 5000;

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be provided!");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(
      "Connected Successfully to MongoDB URI :",
      process.env.MONGO_URI
    );
  } catch (error) {
    console.error(error);
  }

  app.listen(PORT, () => console.log(`Server is running on PORT : ${PORT}`));
};

main();
