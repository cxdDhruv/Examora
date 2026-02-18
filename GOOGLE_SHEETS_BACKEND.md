# Google Sheets Backend Setup
Since Firebase is blocked on your network, we can use **Google Sheets** as your database. This works over standard web connections and is rarely blocked.

## Step 1: Create the Sheet
1.  Go to [Google Sheets](https://sheets.new) and create a new sheet.
2.  Name it `Examora Database`.

## Step 2: Add the Script
1.  In the Sheet, click **Extensions** > **Apps Script**.
2.  Delete any code in the editor (`myFunction`).
3.  **Paste the code below** exactly:

```javascript
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = 'Submissions';
    let sheet = doc.getSheetByName(sheetName);

    // Create sheet if missing
    if (!sheet) {
      sheet = doc.insertSheet(sheetName);
      sheet.appendRow(['Timestamp', 'Exam ID', 'Student Name', 'Roll No', 'Score', 'Total', 'Status', 'Violations', 'Full Data']);
    }

    const data = JSON.parse(e.postData.contents);

    // Prepare row
    const row = [
      new Date().toISOString(),
      data.examId,
      data.studentInfo?.name || 'Unknown',
      data.studentInfo?.rollNo || '-',
      data.score,
      data.total || '-',
      data.status,
      data.violations || 0,
      JSON.stringify(data) // Backup full data
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName('Submissions');
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift(); // Remove header

  // Convert to array of objects
  const data = rows.map(row => {
    try {
      return JSON.parse(row[8]); // Return the full original data object stored in column I
    } catch (err) {
      return null;
    }
  }).filter(item => item !== null);

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Step 3: Deploy as Web App (Crucial)
1.  Click the blue **Deploy** button (top right) > **New deployment**.
2.  Click the "Select type" gear icon > **Web app**.
3.  **Description**: `Examora API`.
4.  **Execute as**: `Me` (your email).
5.  **Who has access**: `Anyone` (Important! This allows the student app to write to it).
6.  Click **Deploy**.
7.  **Authorize** the script (Click Review Permissions > Choose Account > Advanced > Go to (Unsafe) > Allow).

## Step 4: Copy the URL
1.  Copy the **Web App URL** (it starts with `https://script.google.com/macros/s/...`).
2.  Paste this URL into the Examora App (I will add a setting for this next).
