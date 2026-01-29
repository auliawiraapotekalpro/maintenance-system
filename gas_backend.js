
/**
 * GOOGLE APPS SCRIPT BACKEND FOR CEILING LEAK TICKETING
 * 
 * CARA SETTING REMINDER 3 HARI:
 * 1. Di Editor Apps Script, klik ikon jam (Pemicu/Triggers) di sebelah kiri.
 * 2. Klik "+ Tambahkan Pemicu" (Add Trigger).
 * 3. Pilih fungsi: "checkOverdueTickets".
 * 4. Pilih sumber acara: "Dipicu oleh waktu".
 * 5. Pilih jenis pemicu: "Pemicu hari".
 * 6. Pilih waktu: "08.00 s.d. 09.00" (atau sesuaikan).
 * 7. Klik Simpan.
 */

const SS_ID = '1TaE7nZ7WOyC8nIDpyx9CXO1LsdC26Wlzqr84XhMdNJ8'; 
const MAIN_DRIVE_FOLDER_ID = '1VILFbKdKh46tJIZQ5JNqO3Oi16cKIe0E';

function doGet(e) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const action = e.parameter.action;
  
  if (action === 'getUsers') {
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const users = data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    return ContentService.createTextOutput(JSON.stringify(users)).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = ss.getSheetByName('Tickets');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  const headers = data.shift();
  const result = data.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (h === 'photos') { try { val = JSON.parse(val); } catch(e) { val = []; } }
      obj[h] = val;
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Tickets');
  const postData = JSON.parse(e.postData.contents);
  const action = postData.action;

  if (action === 'create') {
    const d = postData.data;
    const photoUrls = [];
    if (d.photos && d.photos.length > 0) {
      try {
        const mainFolder = DriveApp.getFolderById(MAIN_DRIVE_FOLDER_ID);
        let storeFolder;
        const folders = mainFolder.getFoldersByName(d.storeName);
        if (folders.hasNext()) { storeFolder = folders.next(); } 
        else { storeFolder = mainFolder.createFolder(d.storeName); }
        
        d.photos.forEach((base64Data, index) => {
          const parts = base64Data.split(',');
          const contentType = parts[0].split(':')[1].split(';')[0];
          const bytes = Utilities.base64Decode(parts[1]);
          const blob = Utilities.newBlob(bytes, contentType, d.id + "_" + (index + 1) + ".jpg");
          const file = storeFolder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          photoUrls.push(file.getUrl());
        });
      } catch (err) {
        Logger.log("Drive Error: " + err.message);
      }
    }
    sheet.appendRow([d.id, 'PENDING', d.storeName, d.reportDate, d.problemIndicator, 'LOW', '', '', JSON.stringify(photoUrls), d.createdAt, '', '', '', '', '']);
    
    // Kirim email saat submit
    sendEmail(d.storeName, "LAPORAN_BARU", d.id);
  } 
  else if (action === 'update') {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === postData.id) {
        const u = postData.updates;
        const row = i + 1;
        if (postData.isFinished) {
          sheet.getRange(row, 2).setValue('FINISHED');
          sheet.getRange(row, 15).setValue(new Date().toLocaleDateString('id-ID'));
          // Kirim email saat selesai
          sendEmail(data[i][2], "SELESAI", postData.id);
        } else {
          sheet.getRange(row, 2).setValue('PLANNED');
          sheet.getRange(row, 6).setValue(u.riskLevel || 'MEDIUM');
          sheet.getRange(row, 7).setValue(u.businessImpact || '');
          sheet.getRange(row, 8).setValue(u.recommendation || '');
          sheet.getRange(row, 11).setValue(u.department || '');
          sheet.getRange(row, 12).setValue(u.picName || '');
          sheet.getRange(row, 13).setValue(u.plannedDate || '');
          sheet.getRange(row, 14).setValue(u.targetEndDate || '');
          // Kirim email saat rencana dibuat
          sendEmail(data[i][2], "RENCANA", postData.id);
        }
        break;
      }
    }
  }
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Fungsi ini dijalankan oleh Time-Based Trigger setiap hari
 */
function checkOverdueTickets() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Tickets');
  const data = sheet.getDataRange().getValues();
  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  
  for (let i = 1; i < data.length; i++) {
    // Jika status masih PENDING dan sudah lebih dari 3 hari (data[i][9] adalah createdAt)
    if (data[i][1] === 'PENDING' && (now - data[i][9] > threeDays)) {
      sendEmail(data[i][2], "REMINDER", data[i][0]);
    }
  }
}

function sendEmail(storeId, type, ticketId) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const userSheet = ss.getSheetByName('Users');
    const userData = userSheet.getDataRange().getValues();
    
    let outletEmail = "";
    let adminEmails = [];

    // Mencari Email Outlet (Pelapor) dan Seluruh Admin
    const targetStore = String(storeId).trim().toUpperCase();
    
    for (let i = 1; i < userData.length; i++) {
      const rowId = String(userData[i][0]).trim().toUpperCase();
      const rowRole = String(userData[i][2]).trim().toUpperCase();
      const rowEmail = String(userData[i][3]).trim();
      
      if (!rowEmail || !rowEmail.includes("@")) continue;

      // Jika baris ini adalah outlet pelapor
      if (rowId === targetStore) {
        outletEmail = rowEmail;
      }
      
      // Jika baris ini adalah admin/petugas
      if (rowRole === "ADMIN") {
        if (!adminEmails.includes(rowEmail)) {
          adminEmails.push(rowEmail);
        }
      }
    }

    // Gabungkan penerima
    let recipients = [];
    if (outletEmail) recipients.push(outletEmail);
    adminEmails.forEach(email => {
      if (!recipients.includes(email)) recipients.push(email);
    });

    if (recipients.length === 0) {
      Logger.log("Email skip: No valid recipients found for " + storeId);
      return;
    }

    let subject = "";
    let body = "";

    if (type === "LAPORAN_BARU") {
      subject = `[Tiket Baru] Pengajuan Perbaikan Plafon #${ticketId}`;
      body = `Dear Tim,\n\nTelah masuk 1 ticket pengajuan perbaikan plafon dari toko ${storeId} kepada tim GA. Mohon dapat ditindaklanjuti sesuai prosedur yang berlaku. Terima kasih.`;
    } else if (type === "RENCANA") {
      subject = `[Update Rencana] Maintenance Tiket #${ticketId}`;
      body = `Terima kasih. Terkait 1 ticket pengajuan perbaikan plafon dari ${storeId}, tim GA menginformasikan bahwa pengerjaan sudah dijadwalkan sesuai timeline yang ditentukan. Akan kami update kembali jika ada perkembangan.`;
    } else if (type === "SELESAI") {
      subject = `[Selesai] Maintenance Tiket #${ticketId} - Closed`;
      body = `Tim GA menginformasikan bahwa pengerjaan perbaikan plafon di toko ${storeId} telah selesai dilaksanakan. Ticket dinyatakan closed. Terima kasih atas kerja samanya.`;
    } else if (type === "REMINDER") {
      subject = `[REMINDER] Belum Ada Tindakan Tiket #${ticketId}`;
      body = `Menindaklanjuti ticket pengajuan perbaikan plafon dari toko ${storeId}, mohon konfirmasi atau tindak lanjut sesuai dengan status yang berjalan karena tiket sudah lebih dari 3 hari. Terima kasih.`;
    }

    // Mengirim email menggunakan ekosistem Gmail
    GmailApp.sendEmail(recipients.join(","), subject, body);
    Logger.log("Email sukses terkirim ke: " + recipients.join(","));
    
  } catch (err) {
    Logger.log("Email Error: " + err.message);
  }
}
