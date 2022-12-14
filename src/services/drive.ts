import { google } from "googleapis";
import stream from "stream";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

class Drive {
  async uploadFile(file: Express.Multer.File, fileName: string) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    try {
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: file.mimetype,
        },
        media: {
          mimeType: file.mimetype,
          body: bufferStream,
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(error.message);
      return null;
    }
  }

  async updateFile(file: Express.Multer.File, fileName: string, fileId: string) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    try {
      const response = await drive.files.update({
        fileId: fileId,
        requestBody: {
          name: fileName,
          mimeType: file.mimetype,
        },
        media: {
          mimeType: file.mimetype,
          body: bufferStream,
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(error.message);
      return null;
    }
  }

  async generatePublicUrl(fileId: string) {
    try {
      const response = await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
      console.log(response.data);
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async getFileUrl(fileId: string) {
    try {
      const response = await drive.files.get({
        fileId: fileId,
        fields: "webViewLink, webContentLink",
      });
      console.log(response.data);
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async deleteFile(fileId: string) {
    try {
      const response = await drive.files.delete({
        fileId: fileId,
      });
      if (response.status == 204) return true;
    } catch (error: any) {
      console.log(error.message);
      return false;
    }
  }
}

export default new Drive();
