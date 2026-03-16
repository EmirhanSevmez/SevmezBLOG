self.__BUILD_MANIFEST = {
  "/": [
    "static/chunks/pages/index.js"
  ],
  "/admin/users": [
    "static/chunks/pages/admin/users.js"
  ],
  "/login": [
    "static/chunks/pages/login.js"
  ],
  "/new": [
    "static/chunks/pages/new.js"
  ],
  "/posts/[id]": [
    "static/chunks/pages/posts/[id].js"
  ],
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/",
    "/_app",
    "/_error",
    "/admin/users",
    "/login",
    "/new",
    "/posts/[id]",
    "/register"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()