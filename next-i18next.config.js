const path = require("path");

module.exports = {
  i18n: {
    locales: [process.env.NEXT_PUBLIC_LOCALE],
    defaultLocale: process.env.NEXT_PUBLIC_LOCALE,
    localeDetection: false,
  },
  localePath: path.resolve("./public/locales"),
};
