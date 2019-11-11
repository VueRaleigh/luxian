 module.exports = {
    "verbose": true,
    "setupFiles": [
      "<rootDir>/__tests__/setup-pre.js"
    ],
    "setupFilesAfterEnv": [
      "jest-plugin-console-matchers/setup",
      "jest-plugin-unhandled-promise/setup",
      "<rootDir>/__tests__/setup-post.js"
    ],
    "roots": [
      "<rootDir>/__tests__",
      "<rootDir>/src"
    ],
    "modulePaths": [
      "<rootDir>",
      "<rootDir>/src"
    ],
    "moduleDirectories": [
       "node_modules"
    ],
    "moduleNameMapper": {
      "@/(.*)$": "<rootDir>/src/$1"
    },
    "moduleFileExtensions": [
      "js",
      "json",
      "vue"
    ],
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ],
    "resolutions": {
      "babel-core": "7.0.0-bridge.0"
    },
    "transform": {
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
      "^.+\\.vue$": "<rootDir>/node_modules/vue-jest"
    }
    // "transformIgnorePatterns": ["<rootDir>/node_modules/"]
    // transformIgnorePatterns: ["/node_modules/(?!(lodash-es|other-package|next-es-pkg)/)"]
    // transformIgnorePatterns: ["/node_modules/(?!(lodash-es)/)"],
};
