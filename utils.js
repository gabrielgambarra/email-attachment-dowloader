const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");

const TOKEN_PATH = path.join(__dirname, "./token.json");
const CREDENTIALS_PATH = path.join(__dirname, "./credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

async function loadSavedCredentialsIfExist() {
  try {
    const content = fs.readFileSync(TOKEN_PATH, "utf8");
    const credentials = JSON.parse(content);
    const { client_id, client_secret, redirect_uris } = JSON.parse(
      fs.readFileSync(CREDENTIALS_PATH, "utf8"),
    ).installed;

    const auth = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );
    auth.setCredentials(credentials);
    return auth;
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const credentials = client.credentials;
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
}

async function getAuthenticatedClient() {
  const savedClient = await loadSavedCredentialsIfExist();
  if (savedClient) {
    return savedClient;
  }

  const auth = await authenticate({
    keyfilePath: CREDENTIALS_PATH,
    scopes: SCOPES,
  });
  await saveCredentials(auth);
  return auth;
}

const downloadAttachment = async (gmail) => {
  try {
    const { data } = await gmail.users.messages.list({
      userId: "me",
      q: "has:attachment is:unread",
      maxResults: 500,
    });

    if (!data.messages || data.messages.length === 0) {
      console.log("No messages with attachments found.");
      return;
    }

    for (const { id } of data.messages) {
      const { data: message } = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "full",
      });

      const parts = message.payload?.parts || [];
      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          await download(
            gmail,
            "me",
            id,
            part.body.attachmentId,
            part.filename,
          );
        }
      }
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

async function download(gmail, userId, messageId, attachmentId, filename) {
  try {
    const { data } = await gmail.users.messages.attachments.get({
      userId,
      messageId,
      id: attachmentId,
    });

    const filePath = path.join(__dirname, "attachments", filename);
    const fileData = Buffer.from(data.data, "base64");

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileData);

    console.log(`Downloaded: ${filePath}`);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    throw error;
  }
}

module.exports = {
  getAuthenticatedClient,
  google,
  downloadAttachment,
};
