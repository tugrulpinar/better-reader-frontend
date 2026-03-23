import LogoSvg_en from "@assets/images/logo_en.svg";
import LogoSvg_tr from "@assets/images/logo_tr.svg";

module.exports = [
  {
    locale: "tr",
    domain: process.env.NEXT_PUBLIC_DOMAIN_LOCALE_TR,
    manifest: "/locales/tr/manifest.json",
    logo: {
      component: LogoSvg_tr,
      alt: "Better Reader",
      height: "20px",
    },
    heroImages: {
      dark: "/locales/tr/images/bg/d-bg.webp",
      light: "https://audio.acikkuran.com/images/acbg.webp",
      darkMobile: "/locales/tr/images/bg/d-bg-m.webp",
      lightMobile: "https://audio.acikkuran.com/images/acmb.webp",
    },
  },
  {
    locale: "en",
    domain: process.env.NEXT_PUBLIC_DOMAIN_LOCALE_EN,
    manifest: "/locales/en/manifest.json",
    logo: {
      component: LogoSvg_en,
      alt: "Better Reader",
      height: "14px",
    },
    heroImages: {
      dark: "/locales/tr/images/bg/d-bg.webp",
      light: "https://audio.acikkuran.com/images/acbg.webp",
      darkMobile: "/locales/tr/images/bg/d-bg-m.webp",
      lightMobile: "https://audio.acikkuran.com/images/acmb.webp",
    },
  },
];
