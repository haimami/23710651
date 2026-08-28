Tran Nam Hai - 23710651 - https://github.com/NamHai23710651/23710651.git - 837271

# CampusMart - 23710651

## Thông tin sinh viên
- Họ và tên: Tran Nam Hai
- MSSV: 23710651
- Lớp học phần: Lập trình cho thiết bị di động (TH)
- Mã Stamp: #837271
- Biến thể:
  - Watermark: Dưới chân màn hình (Số cuối: 1 - lẻ)
  - Nút Sáng/Tối: Pressable
  - Mở Modal: fade
  - Thứ tự 4 chip: Học tập → Nước → Đồ ăn → Tất cả

## Cấu trúc thư mục dự án
```
CampusMart_23710651/
├── README.md
├── App.tsx
├── package.json
├── babel.config.js
├── tsconfig.json
└── src/
    ├── constants/
    │   ├── student.ts
    │   └── theme.ts
    ├── contexts/
    │   └── ThemeContext.tsx
    ├── hooks/
    │   └── useCountdown.ts
    ├── services/
    │   └── productApi.ts
    ├── components/
    │   └── ui/
    │       ├── Typography.tsx
    │       ├── ShopInput.tsx
    │       └── ShopButton.tsx
    └── screens/
        └── HomeScreen.tsx
```

## Các tính năng đã hoàn thành
- **Câu 1 (CLO 1)**:
  - Cấu hình dự án React Native CLI + TypeScript, path aliases `@constants`, `@components`, `@services`, `@contexts`, `@hooks`, `@screens`.
  - Định danh sinh viên trong `student.ts`, tính toán seed, biến thể và mã stamp tự động.
  - Hệ thống Design System: Theme (`COLORS`, `DARK_COLORS`, `SIZES`, `FONTS`).
  - 3 Atom components: `Typography`, `ShopInput`, `ShopButton` theo chuẩn `StyleSheet.create` và `memo`.
- **Câu 2 (CLO 2)**:
  - Xây dựng Giao diện 1 màn Home với đủ các khối `(0)` Watermark, `(A)` Header + Theme Switcher + Flash Timer, `(B)` Search Input có MSSV, `(C)` Picsum Banner, `(D)` 4 Filter Chips theo thứ tự biến thể.
  - Kết nối FakeStore API trong `productApi.ts` phân loại danh mục, tính giá theo `PRICE_MULTIPLIER`.
  - Xử lý 3 trạng thái mạng: Đang tải (`ActivityIndicator`), Có dữ liệu (`FlatList`), Lỗi mạng (Hiển thị thông báo + Nút Thử lại), và Không có món phù hợp (`ListEmptyComponent`).
  - Tối ưu hiệu năng với `useMemo`, `useCallback`, `memo`.
- **Câu 3 (CLO 3)**:
  - Giao diện 2 Modal Đặt món với hiệu ứng mở `fade`, thông tin chi tiết món, bộ đếm số lượng sử dụng `useReducer`.
  - Alert xác nhận đặt món theo đúng định dạng yêu cầu.
  - Tích hợp `ThemeContext` (Dark/Light mode) và custom hook `useCountdown(FLASH_SECONDS)`. Khóa nút xác nhận khi hết giờ Flash Sale.
