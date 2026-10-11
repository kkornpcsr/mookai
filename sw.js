// เก็บไฟล์หน้าแอปไว้ในเครื่อง ให้เปิดเร็ว และเปิดหน้าแอปได้แม้เน็ตหลุดชั่วคราว
// ข้อมูลบัญชีไม่ถูกเก็บที่นี่ ยังดึงจาก Google Sheet ทุกครั้ง
const CACHE = "papa-accounting-v2";
const SHELL = ["./", "./index.html", "./config.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => null)))));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// ไฟล์ของแอปเอง: ลองโหลดใหม่จากเน็ตก่อน (จะได้เวอร์ชันล่าสุดเสมอ) ถ้าไม่มีเน็ตค่อยใช้ของที่เก็บไว้
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(cache => cache.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );
});
