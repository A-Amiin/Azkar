// Hand-rolled service worker — deliberately not Serwist/next-pwa/workbox.
// See ARCHITECTURE.md for why: the Next.js 16 PWA guide names Serwist as
// "one option," not mandatory, and this app's caching need (a handful of
// fully static routes, no dynamic data) doesn't justify a build-time
// bundling plugin on top of an already-bleeding-edge stack.
//
// OneSignal's Web Push logic (push + notificationclick listeners, plus its
// own install/activate handling) is merged into this same file via
// importScripts rather than registering a second service worker — a
// scope only allows one active service worker, and this file is it. The
// browser supports multiple listeners per event type, so OneSignal's
// install/activate/push/notificationclick handlers below run alongside —
// not instead of — the caching logic in this file.
//
// This file is named OneSignalSDKWorker.js (OneSignal's default), NOT
// something custom like sw.js. An earlier version of this file tried
// serviceWorkerPath: "sw.js" in OneSignal.init() to keep a shorter custom
// name — that did NOT work in production: OneSignal.init() ignored the
// option and requested /OneSignalSDKWorker.js anyway, which 404'd because
// the file didn't exist there, breaking push entirely (confirmed via a
// live browser console error, not just documentation). Zero-config default
// naming is what's actually reliable — see NOTIFICATIONS_PLAN.md section 16.
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
//
// Strategy:
//   - install: precache the app shell (the pages themselves, not their JS/
//     CSS chunks — those self-populate below, so there's no hashed
//     filename list to hand-maintain).
//   - fetch (navigations): network-first, falling back to the cache, then
//     to /offline/ as a last resort.
//   - fetch (same-origin GET, everything else — _next/static/*, fonts,
//     icons): cache-first, populating the runtime cache on first fetch.
//   - activate: drop any cache whose version doesn't match CACHE_VERSION.
//
// Updates are user-confirmed: this worker never calls skipWaiting() on its
// own. It waits for an explicit "SKIP_WAITING" postMessage (sent by
// components/layout/service-worker-registration.tsx after the user accepts
// the "update available" toast), so a new version never silently swaps
// assets out from under someone mid-session.

const CACHE_VERSION = "v2";
const SHELL_CACHE = `azkar-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `azkar-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline/";

const PRECACHE_URLS = [
  "/",
  "/morning/",
  "/evening/",
  "/favorites/",
  OFFLINE_URL,
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only same-origin GET requests are cacheable here — everything else
  // (POST, cross-origin) passes straight through to the network.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Next may reuse development chunk URLs after their module graph changes.
  // Fetch these assets from the network first so two builds are never mixed.
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(handleNextAsset(request));
    return;
  }

  event.respondWith(handleAsset(request));
});

async function handleNextAsset(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? Response.error();
  }
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    const shellCache = await caches.open(SHELL_CACHE);
    const cachedShell = await shellCache.match(request);
    if (cachedShell) return cachedShell;

    const offline = await shellCache.match(OFFLINE_URL);
    return offline ?? Response.error();
  }
}

async function handleAsset(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // No cached copy and no network — let the request fail naturally
    // (e.g. a font or image that was never fetched before going offline).
    return Response.error();
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
