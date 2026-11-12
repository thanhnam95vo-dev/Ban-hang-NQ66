/**
 * GHI NHẬN THUÊ BAO VINAPHONE TẬP SME NQ66
 * Nhân viên gửi ảnh + số thuê bao + tên doanh nghiệp -> lưu Google Drive.
 *
 * Cấu trúc lưu:  THƯ MỤC GỐC / yyyy-MM-dd / giờ_sốthuêbao_số thứ tự.jpg
 * Thống kê:      Google Sheet (mỗi ảnh 1 dòng: thời gian, số thuê bao, doanh nghiệp, ghi chú, link ảnh)
 */

// Thư mục Drive chứa ảnh.
const ROOT_FOLDER_ID = '1CXa5ehc-LJb3l0xXnuBRT_Df9_00Dk-8';
// Google Sheet thống kê (dòng 1 là tiêu đề).
const LOG_SPREADSHEET_ID = '1ldF5BZloj74z3Da5cLBUDJ1Ia7PUjC3GbOLq1fmzwsI';
const TZ = 'Asia/Ho_Chi_Minh';
const MAX_BYTES = 8 * 1024 * 1024; // giới hạn mỗi ảnh sau nén

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Ghi nhận thuê bao Vinaphone tập SME NQ66')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Chạy hàm này 1 lần trong trình soạn thảo để cấp quyền và kiểm tra link. */
function setup() {
  Logger.log('Thư mục lưu ảnh: ' + getRoot_().getUrl());
  Logger.log('Sổ thống kê: ' + SpreadsheetApp.openById(LOG_SPREADSHEET_ID).getUrl());
}

function getRoot_() {
  return DriveApp.getFolderById(ROOT_FOLDER_ID);
}

function getLogSheet_() {
  return SpreadsheetApp.openById(LOG_SPREADSHEET_ID).getSheets()[0];
}

function clean_(s, max) {
  return String(s || '').replace(/[\\\/:*?"<>|\r\n]+/g, ' ').trim().substring(0, max || 60);
}

function getSubFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/** Nhận 1 ảnh (base64) từ trình duyệt và lưu vào Drive. */
function uploadPhoto(p) {
  const phone = String(p.phone || '').replace(/\D/g, '');
  if (!/^0\d{9,10}$/.test(phone)) throw new Error('Số thuê bao không hợp lệ.');
  const company = clean_(p.company, 120);
  if (!company) throw new Error('Thiếu tên công ty/doanh nghiệp.');
  if (!p.data) throw new Error('Không có dữ liệu ảnh.');
  const bytes = Utilities.base64Decode(p.data);
  if (bytes.length > MAX_BYTES) throw new Error('Ảnh quá lớn (>8MB).');

  const now = new Date();
  const day = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
  const time = Utilities.formatDate(now, TZ, 'HHmmss');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const dayFolder = getSubFolder_(getRoot_(), day);
    const fileName = time + '_' + phone + '_' + (p.index || 1) + '.jpg';
    const blob = Utilities.newBlob(bytes, 'image/jpeg', fileName);
    const file = dayFolder.createFile(blob);
    file.setDescription(['Số thuê bao: ' + phone, 'Công ty/DN: ' + company, 'Ghi chú: ' + clean_(p.note, 300)].join('\n'));
    const sh = getLogSheet_();
    const row = sh.getLastRow() + 1;
    sh.getRange(row, 2).setNumberFormat('@');
    sh.getRange(row, 1, 1, 6).setValues([[
      Utilities.formatDate(now, TZ, 'dd/MM/yyyy HH:mm:ss'),
      phone, company, clean_(p.note, 300), fileName, file.getUrl()
    ]]);
    return { ok: true, url: file.getUrl() };
  } finally {
    lock.releaseLock();
  }
}
