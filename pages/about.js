import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18nextConfig from "next-i18next.config";
import { NextSeo } from "next-seo";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { RiHome6Line } from "react-icons/ri";

import Navbar from "@components/layout/Navbar";
import { Content } from "@styles/global.style";
import { SC } from "@styles/verse.style";
import languageAlternates from "@utils/languageAlternates";

const About = (props) => {
  const { locale } = props;
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <SC>
      <Head></Head>
      <NextSeo
        languageAlternates={languageAlternates(router)}
        noindex={process.env.NEXT_PUBLIC_ENVIRONMENT !== "production"}
        title={`${t("seo__about__title")} - ${t("seo__base_title")}`}
        description={t("seo__about__desc")}
      />

      <Navbar hideBottom>
        <div className="navbar-main-title">
          <Link
            href="/"
            aria-label={t("navigation__go_to_homepage")}
            className="button-as-a"
          >
            <RiHome6Line />
          </Link>
          <h1 className="title">{t("about__title")}</h1>
        </div>
        <React.Fragment></React.Fragment>
      </Navbar>

      <Content></Content>
    </SC>
  );
};

export async function getServerSideProps() {
  const locale = process.env.NEXT_PUBLIC_LOCALE;
  return {
    props: {
      locale,
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default About;
