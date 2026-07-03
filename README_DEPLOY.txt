Production Interview AI Coach - OpenQuiz Style
==============================================

Mục tiêu:
- Giao diện giống luồng học OpenQuiz: Speaking, Hội thoại, Ngữ pháp, Đọc hiểu, Học, Kiểm tra, Nghe Chép.
- Nội dung tập trung vào phỏng vấn và giao tiếp sản xuất.
- Có thể chạy offline, và có thể deploy online để bật AI thật qua serverless function.

Cách chạy local:
1. Mở index.html bằng Chrome hoặc Edge.
2. Cho phép microphone.
3. Dùng các tab để học.

Cách deploy Vercel:
1. Tạo GitHub repo, upload toàn bộ folder này.
2. Vào Vercel → New Project → import repo.
3. Vào Settings → Environment Variables.
4. Thêm OPENAI_API_KEY = API key của bạn.
5. Optional: thêm OPENAI_MODEL nếu muốn đổi model.
6. Deploy.
7. Mở trang, vào Cài đặt AI → Test AI.

Cách deploy Netlify:
1. Tạo GitHub repo, upload toàn bộ folder này.
2. Vào Netlify → Add new site → Import existing project.
3. Build command: để trống.
4. Publish directory: .
5. Functions directory đã có trong netlify.toml.
6. Vào Site configuration → Environment variables.
7. Thêm OPENAI_API_KEY = API key của bạn.
8. Deploy.
9. Mở trang, vào Cài đặt AI → Test AI.

Lưu ý bảo mật:
- Không dán API key vào file index.html.
- API key phải nằm trong biến môi trường serverless function.

Lưu ý microphone:
- Mic hoạt động ổn nhất trên Chrome/Edge.
- Khi deploy online cần HTTPS để trình duyệt cho phép microphone ổn định.
