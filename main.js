const {
  getAuthenticatedClient,
  google,
  downloadAttachment,
} = require("./utils");

async function runSample() {
  const auth = await getAuthenticatedClient();
  google.options({ auth });

  const gmail = google.gmail("v1");

  try {
    downloadAttachment(gmail);
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

if (module === require.main) {
  runSample().catch(console.error);
}

module.exports = runSample;
