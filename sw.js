importScripts("https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js");
importScripts("/assets/js/utils/bd-utils.js");
importScripts("/assets/js/utils/sw-utils.js");

const STATIC_CACHE = "staticv1";
const DYNAMIC_CACHE = "dynamicv1";
const INMUTABLE_CACHE = "inmutablev1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/assets/css/main.css",
  "/assets/css/style.css",
  "/assets/img/img-404.png",
  "/assets/img/not-found.svg",
  "/assets/img/reports.ico",
  "/assets/img/reports.png",
  "/assets/js/main.js",
  "/assets/js/admin.home.controller.js",
  "/assets/js/admin.users.controller.js",
  "/assets/js/signin.js",
  "/assets/js/axios/axios-intance.js",
  "/assets/js/toast/toast.js",
];

const APP_SHELL_INMUTABLE = [
  "/assets/jquery-3.7.1.min.js/",
  "/assets/vendor/bootstrap/css/bootstrap.min.css",
  "/assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "/assets/vendor/bootstrap-icons/bootstrap-icons.css",
  "/assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff",
  "/assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2",
  "/assets/vendor/boxicons/css/boxicons.min.css",
  "/assets/vendor/boxicons/fonts/boxicons.woff",
  "/assets/vendor/boxicons/fonts/boxicons.woff2",
  "/assets/vendor/boxicons/fonts/boxicons.eot",
  "/assets/vendor/boxicons/fonts/boxicons.svg",
  "/assets/vendor/simple-tables/simple-table.js",
];

const clear = (cacheName, items = 50) => {
  caches.open(cacheName).then((cache) => {
    return cache.keys().then((keys) => {
      if (keys.length > items) {
        cache.delete(keys[0]).then(clear(cacheName, items));
      }
    });
  });
};

self.addEventListener("install", (e) => {
  const cacheStatic = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(APP_SHELL));
  const cacheInmutable = caches
    .open(INMUTABLE_CACHE)
    .then((cache) => cache.addAll(APP_SHELL_INMUTABLE));
  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("activate", (e) => {
  const response = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== STATIC_CACHE && key.includes("static")) 
        return caches.delete(key);
      if (key !== DYNAMIC_CACHE && key.includes("dynamic")) 
        return caches.delete(key);
    });
  });
  e.waitUntil(response);
});

self.addEventListener("fetch", (e) => {
  //Verificar el POST     'api/user' -> POST
  let source;

  if (e.request.url.includes("/api/")) {
    //Cache | Network with cache fallback
    source = apiSaveIncidence(DYNAMIC_CACHE, e.request);
  } else {
    //Cache with network fallback
    source = caches.match( e.request).then((cacheRes) => {
        if(cacheRes){
            updateStaticCache(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
            return cacheRes;
        }else{
            return fetch(e.request).then((res) => {
                return updateDynamicCache(DYNAMIC_CACHE, e.request, res);
            });
        }
    });
  }
  e.respondWith(source);
});


self.addEventListener("sync", (e) => {
    if (e.tag === "incidence-status-post") {
        e.waitUntil(saveIncidenceToApi());
    }
});