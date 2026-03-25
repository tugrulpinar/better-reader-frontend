import cookies from "next-cookies";
import localesConfig from "locales.config";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18nextConfig from "next-i18next.config";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  RiMoonFill,
  RiSunLine,
} from "react-icons/ri";
import { useRecoilState } from "recoil";

import Button from "@components/common/Button";
import Organization from "@components/common/Organization";
import Footer from "@components/layout/Footer";
import DesktopSearch from "@components/ui/DesktopSearch";
import MobileSearch from "@components/ui/MobileSearch";
import { envInfoState } from "@recoil/atoms";
import {
  AuthArea,
  AuthedUser,
  GlobalStyle,
  ImageColumn,
  Logo,
  SC,
  SearchColumn,
} from "@styles/index.style";
import { initGA, logPageView } from "@utils/analytics";
import languageAlternates from "@utils/languageAlternates";

const Index = (props) => {
  const { themeToggler, theme, locale } = props;
  const router = useRouter();
  const { t } = useTranslation("common");

  const [showMobile, setShowMobile] = useState(false);
  const [envInfo, setEnvInfo] = useRecoilState(envInfoState);

  useEffect(() => {
    if (router?.query?.error) {
      toast(t("error__title"), {
        icon: "😞",
      });
      window
        ? window.history.replaceState(null, "", "/")
        : router.replace("/", undefined, { shallow: true });
    }
  }, [router]);

  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, []);

  useEffect(() => {
    if (!envInfo) {
      if (router?.query?.android) {
        setEnvInfo("android");
      } else if (router?.query?.ios) {
        setEnvInfo("ios");
      } else {
        setEnvInfo("web");
      }
    }
  }, [router]);

  const localeItem = localesConfig.find((l) => l.locale === locale);
  const { heroImages, logo } = localeItem;
  const ComputedLogo = useMemo(() => {
    return logo.component;
  });

  const ComputedLogoHeight = useMemo(() => {
    return logo.height;
  });

  return (
    <SC>
      <GlobalStyle />
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0"
        />
      </Head>

      <NextSeo
        languageAlternates={languageAlternates(router)}
        noindex={process.env.NEXT_PUBLIC_ENVIRONMENT !== "production"}
        title={t("seo__home_title")}
        description={t("seo__index__desc")}
        openGraph={{
          type: "article",
          locale: locale,
          url: t("seo__base_url"),
          title: t("seo__home_title"),
          description: t("seo__index__desc"),
        }}
      />
      <Organization />
      <ImageColumn
        bg={
          theme === "light"
            ? heroImages.light
            : theme === "dark" && heroImages.dark // interesting
        }
        mobileBg={
          theme === "light"
            ? heroImages.lightMobile
            : theme === "dark" && heroImages.darkMobile
        }
      >
        <Logo height={ComputedLogoHeight}>
          <Link href="/about" aria-label={t("about__title")}>
            <ComputedLogo />
          </Link>
        </Logo>
        <AuthArea>
          <AuthedUser>
            <Button
              type="text"
              onClick={themeToggler}
              role="button"
              tabIndex="0"
              aria-label={t("theme__toggle")}
            >
              {theme === "light" ? <RiSunLine /> : <RiMoonFill />}
            </Button>
          </AuthedUser>
        </AuthArea>
      </ImageColumn>

      <SearchColumn>
        {showMobile && (
          <MobileSearch setShowMobile={setShowMobile}></MobileSearch>
        )}
        {!showMobile && (
          <DesktopSearch
            indexPage
            hideCloseButton
            setShowMobile={setShowMobile}
          ></DesktopSearch>
        )}
      </SearchColumn>
      <Footer home />
    </SC>
  );
};

export async function getServerSideProps(ctx) {
  const locale = process.env.NEXT_PUBLIC_LOCALE;

  return {
    props: {
      locale,
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Index;
