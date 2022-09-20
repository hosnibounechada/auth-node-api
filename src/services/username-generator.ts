import { randomInt } from "crypto";

export class UsernameGenerator {
  static async generate(firstName: string, lastName: string) {
    const uuid = randomInt(1000, 9999);
    return `${firstName}.${lastName}${uuid}`;
  }
}
