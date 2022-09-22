import "dotenv/config";
import app from "./app";
import mongoose from "mongoose";
import redis from "./services/redis";
import twilio from "./services/twilio";

const main = async () => {
  const PORT = process.env.PORT || 5000;

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be provided!");

  if (!process.env.REDIS_URI) throw new Error("REDIS_URI must be provided!");

  if (!process.env.TWILIO_ACCOUNT_SID)
    throw new Error("TWILIO_ACCOUNT_SID must be provided!");
  if (!process.env.TWILIO_AUTH_TOKEN)
    throw new Error("TWILIO_ACCOUNT_SID must be provided!");
  if (!process.env.TWILIO_SERVICE_SID)
    throw new Error("TWILIO_ACCOUNT_SID must be provided!");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(
      "Connected Successfully to MongoDB URI :",
      process.env.MONGO_URI
    );
  } catch (error) {
    console.error(error);
  }

  try {
    await redis.init(process.env.REDIS_URI).connect();
    console.log("Connected Successfully to Redis URI :", process.env.REDIS_URI);
  } catch (err) {
    console.error(err);
  }

  twilio.init(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    process.env.TWILIO_SERVICE_SID
  );
  console.log("Twilio Service Stared");
  statistics();
  app.listen(PORT, () => console.log(`Server is running on PORT : ${PORT}`));
};

main();

const statistics = () => {
  const stats = [];
  const { rss, heapTotal, external, heapUsed } = process.memoryUsage();
  stats.push({ item: "rss", value: `${rss / 1000000} MB` });
  stats.push({ item: "heapTotal", value: `${heapTotal / 1000000} MB` });
  stats.push({ item: "external", value: `${external / 1000000} MB` });
  stats.push({ item: "heapUsed", value: `${heapUsed / 1000000} MB` });
  console.table(stats);
};
