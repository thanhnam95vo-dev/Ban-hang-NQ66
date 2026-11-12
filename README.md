# Ghi nhận thuê bao Vinaphone tập SME NQ66

Web app (Google Apps Script) để nhân viên gửi ảnh bán hàng về cho quản lý, lưu thẳng vào Google Drive.

## Nhân viên nhập
1. Số thuê bao (bắt buộc, 10–11 số, bắt đầu bằng 0)
2. Tên công ty/doanh nghiệp (bắt buộc)
3. Ghi chú (không bắt buộc)
4. Ảnh: chụp trực tiếp hoặc chọn từ máy (tối đa 20 ảnh/lần, tự nén trước khi gửi)

## Nơi lưu
- Ảnh: thư mục Drive `ANH_BAN_HANG_SME_NQ66` / `yyyy-MM-dd` / `giờ_sốthuêbao_stt.jpg`
- Thống kê: Google Sheet `THONG_KE_THUE_BAO_SME_NQ66` (mỗi ảnh 1 dòng: thời gian, số thuê bao, doanh nghiệp, ghi chú, tên file, link ảnh)

## Cấu trúc
```
src/Code.gs          # xử lý phía máy chủ: nhận ảnh, lưu Drive, ghi sổ thống kê
src/index.html       # giao diện (logo VNPT nhúng sẵn)
src/appsscript.json  # cấu hình Apps Script
```

## Triển khai
**Cách 1 – thủ công:** script.google.com → Dự án mới → dán `Code.gs`, tạo file HTML tên `index` và dán `index.html` → chạy hàm `setup` (cấp quyền) → Triển khai → Ứng dụng web (Thực thi bằng: Tôi; Truy cập: Bất kỳ ai).

**Cách 2 – clasp:**
```
npm i -g @google/clasp
clasp login
clasp create --type webapp --title "Ghi nhan thue bao SME NQ66" --rootDir src
clasp push
clasp deploy
```

## Cập nhật
Sửa code → dán/`clasp push` → Triển khai → Quản lý bản triển khai → Phiên bản mới (link giữ nguyên).

## Lưu ý
- `ROOT_FOLDER_ID` và `LOG_SPREADSHEET_ID` ở đầu `Code.gs` là thư mục/sổ thống kê trên Drive của chủ tài khoản triển khai. Đổi sang thư mục/sổ khác nếu cần.
- Nên để repo ở chế độ **Private**.
- Link web app công khai: ai có link đều gửi được ảnh; chỉ chủ tài khoản xem được ảnh và sổ thống kê.
