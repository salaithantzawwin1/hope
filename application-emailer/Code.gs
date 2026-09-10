/**
 * Hope International School — Job application emailer
 * ===================================================
 *
 * Receives job applications from the website's "Apply Now" popup form,
 * saves each CV to a Google Drive folder, logs the application in a Google
 * Sheet, and emails it (with the CV attached) to the admin address.
 *
 * SETUP (see README.md → "Job application form" for the full walkthrough):
 *   1. Create a Google Sheet (sheets.new). Note its name.
 *   2. Extensions → Apps Script → paste this whole file → save.
 *   3. Check ADMIN_EMAIL below — this is where applications are sent.
 *   4. Deploy → New deployment → Web app:
 *        - Execute as:  Me
 *        - Who has access:  Anyone
 *      Copy the /exec URL.
 *   5. Paste that URL into `lib/job-application.ts` → APPLICATION_ENDPOINT,
 *      then rebuild/redeploy the website.
 *
 * HOW IT WORKS:
 *   - The website POSTs JSON (CV included as base64) to this web app.
 *   - doPost() saves the CV into Drive folder "Hope Job Applications",
 *     appends a row to the "Applications" sheet, and emails ADMIN_EMAIL
 *     with the CV attached.
 *   - Even if the email fails (daily quota), the CV is safe in Drive and
 *     the row is in the Sheet — nothing is lost.
 *
 * CHANGING THE EMAIL LATER:
 *   Just edit ADMIN_EMAIL below and re-save. No redeploy needed.
 */

/** ✏️ The address that receives job applications. */
var ADMIN_EMAIL = "iyfmyanmar.admin@gmail.com";

/** Google Drive folder that stores every uploaded CV. */
var DRIVE_FOLDER_NAME = "Hope Job Applications";

var SHEET_NAME = "Applications";
var HEADERS = [
  "Submitted At",
  "Locale",
  "Applicant Name",
  "Phone",
  "Email",
  "Position",
  "Notes",
  "CV File",
  "CV Drive Link",
];

/** Entry point called by the website (POST with a JSON body). */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  var cvBlob = Utilities.newBlob(
    Utilities.base64Decode(data.cvBase64 || ""),
    data.cvMimeType || "application/octet-stream",
    data.cvFileName || "cv.pdf"
  );

  // 1. Save the CV to Drive so it is never lost (even if email quota hits).
  var folder = getFolder_();
  var file = folder.createFile(cvBlob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // 2. Log the application in the Sheet.
  var sheet = getSheet_();
  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.locale || "",
    data.name || "",
    data.phone || "",
    data.email || "",
    data.position || "",
    data.notes || "",
    data.cvFileName || "",
    file.getUrl(),
  ]);

  // 3. Email the application (with CV attached) to the school.
  try {
    sendApplicationEmail_(data, cvBlob, file.getUrl());
  } catch (err) {
    Logger.log("Email failed (CV is still saved in Drive): " + err);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Emails one application with the CV attached to ADMIN_EMAIL. */
function sendApplicationEmail_(data, cvBlob, driveLink) {
  var subject =
    "Job application: " + (data.position || "General") +
    " — " + (data.name || "Unknown applicant");

  var body =
    "New job application from the website.\n\n" +
    "Name:     " + (data.name || "-") + "\n" +
    "Phone:    " + (data.phone || "-") + "\n" +
    "Email:    " + (data.email || "-") + "\n" +
    "Position: " + (data.position || "-") + "\n" +
    "Notes:    " + (data.notes || "-") + "\n\n" +
    "CV attached (" + (data.cvFileName || "cv") + ").\n" +
    "Drive copy: " + driveLink + "\n";

  MailApp.sendEmail(ADMIN_EMAIL, subject, body, {
    attachments: [cvBlob],
    replyTo: data.email || undefined,
  });
}

/** Returns (and lazily creates) the Drive folder for CVs. */
function getFolder_() {
  var it = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

/** Returns (and lazily creates) the applications sheet with headers. */
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

/** Adds a menu so staff can open the CV folder quickly. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Applications")
    .addItem("Open CV folder", "openCvFolder")
    .addToUi();
}

/** Shows the Drive folder that holds all uploaded CVs. */
function openCvFolder() {
  var url = getFolder_().getUrl();
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(
      '<p><a href="' + url + '" target="_blank">Open CV folder</a></p>' +
      '<script>window.open("' + url + '");google.script.host.close()</script>'
    ),
    "CV folder"
  );
}
