/**
 * Hope International School — Registration emailer
 * ==================================================
 *
 * Receives registrations from the website, appends them to a Google Sheet,
 * and emails the full list to the school as an Excel (.xlsx) file.
 *
 * SETUP (see README.md → "Registration form" for the full walkthrough):
 *   1. Create a Google Sheet (sheets.new). Note its name.
 *   2. Extensions → Apps Script → paste this whole file → save.
 *   3. Make sure ADMIN_EMAIL below is the address that should receive the
 *      Excel files (the school can change it here later — no code changes
 *      needed anywhere else on the site).
 *   4. Deploy → New deployment → Web app:
 *        - Execute as:  Me
 *        - Who has access:  Anyone
 *      Copy the /exec URL.
 *   5. Paste that URL into `lib/registration.ts` → REGISTRATION_ENDPOINT,
 *      then rebuild/redeploy the website.
 *
 * HOW IT WORKS:
 *   - The website POSTs JSON to this web app for every registration.
 *   - doPost() appends a row to the "Registrations" sheet (created if
 *     missing) and emails the sheet's current contents as hope-registrations.xlsx
 *     to ADMIN_EMAIL.
 *   - A "Registrations → Send Excel to admin email" menu also appears in
 *     the Sheet so staff can email the file manually any time.
 *
 * CHANGING THE EMAIL LATER:
 *   Just edit ADMIN_EMAIL below and re-save. No redeploy needed — the
 *   deployed web app picks up the new value automatically.
 */

/** ✏️ Change this when the school's registration email changes. */
var ADMIN_EMAIL = "iyfmyanmar.admin@gmail.com";

var SHEET_NAME = "Registrations";
var HEADERS = [
  "Submitted At",
  "Locale",
  "Parent / Guardian",
  "Email",
  "Phone",
  "Student Name",
  "Grade / Level",
  "Registering For",
  "Notes",
];

/** Entry point called by the website (POST with a JSON body). */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  var sheet = getSheet_();
  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.locale || "",
    data.parentName || "",
    data.email || "",
    data.phone || "",
    data.studentName || "",
    data.grade || "",
    data.program || "",
    data.notes || "",
  ]);

  // Email the list (Excel format) to the school after every submission.
  // If the email fails (e.g. quota), the registration is still saved.
  try {
    sendExcelEmail();
  } catch (err) {
    Logger.log("Email failed: " + err);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Emails the whole spreadsheet as a real Excel (.xlsx) file to ADMIN_EMAIL.
 * Works by exporting the Sheet via its native xlsx export endpoint.
 */
function sendExcelEmail() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var exportUrl =
    "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=xlsx";
  var blob = UrlFetchApp.fetch(exportUrl, {
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
  }).getBlob();
  blob.setName("hope-registrations.xlsx");

  var body =
    "A new registration was submitted on the website.\n\n" +
    "The full registration list is attached as an Excel (.xlsx) file.";

  MailApp.sendEmail(ADMIN_EMAIL, "New registration — Hope International School website", body, {
    attachments: [blob],
  });
}

/** Adds a menu so staff can email the Excel file manually. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Registrations")
    .addItem("Send Excel to admin email", "sendExcelEmail")
    .addToUi();
}

/** Returns (and lazily creates) the registrations sheet with headers. */
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