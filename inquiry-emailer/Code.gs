/**
 * Hope International School — Admissions inquiry emailer
 * ======================================================
 *
 * Receives "Send Us an Inquiry" submissions from the Admissions page,
 * appends them to a Google Sheet, and emails each inquiry to the admin
 * address — the same pattern as registration-emailer and
 * application-emailer.
 *
 * SETUP (see README.md → "Inquiry form" for the full walkthrough):
 *   1. Create a Google Sheet (sheets.new). Note its name.
 *   2. Extensions → Apps Script → paste this whole file → save.
 *   3. Make sure ADMIN_EMAIL below is the address that should receive
 *      the inquiries.
 *   4. Deploy → New deployment → Web app:
 *        - Execute as:  Me
 *        - Who has access:  Anyone
 *      Copy the /exec URL.
 *   5. Paste that URL into `lib/inquiry.ts` → INQUIRY_ENDPOINT,
 *      then rebuild/redeploy the website.
 *
 * HOW IT WORKS:
 *   - The website POSTs JSON to this web app for every inquiry.
 *   - doPost() appends a row to the "Inquiries" sheet (created if
 *     missing) and emails the inquiry to ADMIN_EMAIL.
 *   - If the email fails (daily Gmail quota), the inquiry is still
 *     saved in the Sheet — nothing is lost.
 *
 * CHANGING THE EMAIL LATER:
 *   Just edit ADMIN_EMAIL below and re-save. No redeploy needed — the
 *   deployed web app picks up the new value automatically.
 */

/** ✏️ The address that receives admissions inquiries. */
var ADMIN_EMAIL = "iyfmyanmar.admin@gmail.com";

var SHEET_NAME = "Inquiries";
var HEADERS = [
  "Submitted At",
  "Locale",
  "Parent / Guardian",
  "Email",
  "Phone",
  "Grade Interested In",
  "Message",
];

/** Entry point called by the website (POST with a JSON body). */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  var sheet = getSheet_();
  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.locale || "",
    data.name || "",
    data.email || "",
    data.phone || "",
    data.grade || "",
    data.message || "",
  ]);

  // Email the inquiry to the school after every submission. If the email
  // fails (e.g. quota), the inquiry is still saved in the Sheet.
  try {
    sendInquiryEmail_(data);
  } catch (err) {
    Logger.log("Email failed (inquiry is still saved in the Sheet): " + err);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Emails one inquiry to ADMIN_EMAIL (reply-to the visitor's address). */
function sendInquiryEmail_(data) {
  var subject =
    "[Inquiry] " + (data.name || "Unknown") +
    (data.grade ? " — " + data.grade : "");

  var body =
    "New inquiry from the Hope International School website.\n\n" +
    "Name:   " + (data.name || "-") + "\n" +
    "Email:  " + (data.email || "-") + "\n" +
    "Phone:  " + (data.phone || "-") + "\n" +
    "Grade:  " + (data.grade || "-") + "\n\n" +
    "Message:\n" + (data.message || "-") + "\n";

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: subject,
    body: body,
    replyTo: data.email || undefined,
  });
}

/** Adds a menu so staff can open the inquiries sheet quickly. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Inquiries")
    .addItem("Send test email", "sendTestEmail")
    .addToUi();
}

/** Sends a test email to ADMIN_EMAIL to confirm the setup works. */
function sendTestEmail() {
  sendInquiryEmail_({
    name: "Test Inquiry",
    email: ADMIN_EMAIL,
    phone: "-",
    grade: "-",
    message: "This is a test inquiry sent from the Inquiry emailer script.",
  });
  SpreadsheetApp.getUi().alert("Test email sent to " + ADMIN_EMAIL);
}

/** Returns (and lazily creates) the inquiries sheet with headers. */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}
