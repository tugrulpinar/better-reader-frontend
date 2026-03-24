import parse from "html-react-parser";
import cookies from "next-cookies";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import {
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiArrowUpSLine,
  RiGitMergeLine,
} from "react-icons/ri";
import InfiniteScroll from "react-infinite-scroll-component";
import { useRecoilValue } from "recoil";

import Button from "@components/common/Button";
import LoadingBar from "@components/common/LoadingBar";
import Organization from "@components/common/Organization";
import Error from "@components/layout/Error";
import Footer from "@components/layout/Footer";
import Navbar from "@components/layout/Navbar";
import VerseExpand from "@components/ui/VerseExpand";
import rootchars from "@data/rootchars";
import { envInfoState, targetVerseState } from "@recoil/atoms";
import { Content } from "@styles/global.style";
import {
  Col,
  ConjugationBody,
  ConjugationHeader,
  ConjugationSection,
  ConjugationTable,
  ConjugationWrapper,
  Container,
  EmptyVersesData,
  RootDetail,
  RootMain,
  RootMainGoToTop,
  RootTitleArabic,
  RootTitleTranscription,
  RootVerse,
  RootVerseArabic,
  RootVerseDetail,
  RootVerseOption,
  RootVerseTag,
  RootVerseTags,
  RootVerseTitle,
  RootVerseTop,
  RootVerseTranscription,
  RootVerseTranslation,
  RootVerses,
  Row,
  SC,
  Tab,
  TabList,
  TabPanel,
  TabText,
  Tabs,
} from "@styles/root.style";
import theme from "@styles/theme";
import { initGA, logEvent, logPageView } from "@utils/analytics";
import { fetchJson, goToRoot } from "@utils/funcs";
import languageAlternates from "@utils/languageAlternates";

const Selectbox = dynamic(() => import("@components/common/Selectbox"), {
  ssr: false,
  loading: () => <></>,
});

const Root = (props) => {
  const { errorCode, root, authorId, locale } = props;
  if (errorCode) {
    return <Error />;
  }
  const router = useRouter();
  const { t } = useTranslation("common");

  const envInfo = useRecoilValue(envInfoState);

  const [showVerses, setShowVerses] = useState([]);
  const [versesData, setVersesData] = useState([]);
  const [versesLinkNext, setVersesLinkNext] = useState();
  const [roots, setRoots] = useState([]);
  const [rootChar, setRootChar] = useState(root.rootchar_id);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [conjugations, setConjugations] = useState(null);
  const [showConjugations, setShowConjugations] = useState(false);
  const targetVerseValue = useRecoilValue(targetVerseState);

  const [navWidth, setNavWidth] = useState(
    theme.awesomegrid.breakpoints.lg * 16
  );

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleVerse = (id) => {
    if (!showVerses.find((i) => i === id)) {
      setShowVerses([...showVerses, id]);
    } else {
      setShowVerses(showVerses.filter((i) => i !== id));
    }
  };

  useEffect(() => {
    if (targetVerseValue) {
      const elementId = `${targetVerseValue.surah_id}-${targetVerseValue.verse_number}-${targetVerseValue.sort_number}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.add("highlighted");
        const yOffset = -340;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, [versesData]);

  const fetchFilters = async (latin) => {
    setLoading(true);

    const { data: rootVersesData, links: rootVersesLinks } = await fetchJson(
      `${process.env.NEXT_PUBLIC_API_URL}/root/latin/${latin}/verseparts?author=${authorId}&limit=1200&page=1`
    );
    setVersesData(rootVersesData);
    setVersesLinkNext(
      rootVersesLinks.next
        ? `${process.env.NEXT_PUBLIC_API_URL}${rootVersesLinks.next}`
        : null
    );
    setLoading(false);
  };

  useEffect(() => {
    if (router?.query?.latin) {
      fetchFilters(router.query.latin);
    }
  }, [router]);

  const fetchRootcharRoots = async (value) => {
    setRootChar(value);
    setRoots(null);
    const { data } = await fetchJson(
      `${process.env.NEXT_PUBLIC_API_URL}/rootchar/${value}`
    );
    const $roots = [];
    data.map((x) => {
      return $roots.push({
        value: x.latin,
        label: `${x.arabic} (${x.latin})`,
      });
    });
    setRoots($roots);
  };

  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
    logEvent("env-info", envInfo || "web");
  }, [root]);

  useEffect(() => {
    if (router?.query?.latin) {
      const fetchConjugations = async () => {
        try {
          const data = await fetchJson(
            `/api/conjugation/${router.query.latin}`
          );
          if (data?.conjugations) {
            setConjugations(data.conjugations);
          } else {
            setConjugations(null);
          }
        } catch {
          setConjugations(null);
        }
      };
      fetchConjugations();
    }
  }, [router?.query?.latin]);

  useEffect(() => {
    fetchRootcharRoots(rootChar);
  }, []);

  const fetchData = async () => {
    const { data, links } = await fetchJson(versesLinkNext);
    const newVersesData = [...versesData, ...data];
    setVersesLinkNext(
      links.next ? `${process.env.NEXT_PUBLIC_API_URL}${links.next}` : null
    );
    setVersesData(newVersesData);
  };

  useEffect(() => {
    setNavWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setNavWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
  });

  const computedMean = useMemo(() => {
    const means = {
      tr: root.mean,
      en: root.mean_en,
    };
    return parse(means[locale]);
  }, [root]);

  const computedTranscription = useMemo(() => {
    const transcriptions = {
      tr: root.transcription,
      en: root.transcription_en,
    };
    return parse(transcriptions[locale]);
  }, [root]);

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SC>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0"
        />
      </Head>
      <NextSeo
        languageAlternates={languageAlternates(router)}
        noindex
        title={`${computedTranscription} / ${root.arabic} - ${t(
          "seo__base_title"
        )}`}
        description={t("seo__root__desc", {
          transcription: computedTranscription,
          arabic: root.arabic,
        })}
        openGraph={{
          locale: locale,
          type: "article",
          url: `${t("seo__base_url")}/root/${root.latin}`,
          title: `${t("seo__root__desc", {
            transcription: computedTranscription,
            arabic: root.arabic,
          })} - ${t("seo__base_title")}`,
        }}
      />
      <Organization />
      <Navbar>
        <div className="navbar-main-title">
          <Button
            type="text"
            onClick={() => Router.back()}
            aria-label={t("navigation__go_to_back")}
          >
            <RiArrowLeftLine />
          </Button>
          <h1 className="title">
            {root.arabic} <em>{root.latin}</em>
          </h1>
        </div>

        <React.Fragment>
          {rootChar && (
            <Selectbox
              instanceId="topbar__select-rootchar"
              className="topbar__select-rootchar"
              placeholder={t("selectbox__rootchar_placeholder")}
              isSearchable
              options={rootchars}
              value={rootchars[rootChar - 1]}
              onChange={(e) => fetchRootcharRoots(e.value)}
              onChangeNative={(e) => fetchRootcharRoots(e.target.value)}
              aria-label={t("selectbox__select_rootchar")}
            />
          )}
          {roots && root && (
            <Selectbox
              className="topbar__select-root"
              placeholder={t("selectbox__root_placeholder")}
              isDisabled={!(roots.length > 0)}
              isSearchable
              options={roots}
              value={roots.find((a) => a.value === root.latin)}
              onChange={(e) => goToRoot(e.value)}
              onChangeNative={(e) => goToRoot(e.target.value)}
              aria-label={t("selectbox__select_root")}
            />
          )}
        </React.Fragment>
      </Navbar>
      <RootMainGoToTop>
        <span
          className={`go-to-top-button ${showButton ? "show" : ""}`}
          onClick={() => {
            goToTop();
          }}
        >
          <RiArrowUpLine /> {t("root__go_to_top")}
        </span>
      </RootMainGoToTop>
      <Content>
        <RootMain>
          <Container>
            <Row>
              <Col>
                <strong>{computedTranscription}</strong>: {computedMean}
              </Col>
            </Row>
          </Container>
        </RootMain>
        {conjugations && (
          <ConjugationWrapper>
            <ConjugationHeader
              onClick={() => setShowConjugations((v) => !v)}
            >
              <span className="conj-header__arabic">{root.arabic}</span>
              <span className="conj-header__title">
                {t("root__conjugations")}
              </span>
              {root.translation && (
                <span className="conj-header__translation">
                  {root.translation}
                </span>
              )}
              <span
                className={`conj-header__chevron ${
                  showConjugations ? "open" : ""
                }`}
              >
                <RiArrowDownSLine />
              </span>
            </ConjugationHeader>
            {showConjugations && (
              <ConjugationBody>
                <Tabs>
                  <TabList>
                    {[
                      { key: "past_tense", label: t("root__past_tense") },
                      {
                        key: "present_tense",
                        label: t("root__present_tense"),
                      },
                    ].map(({ key, label }) => (
                      <Tab key={key}>
                        <TabText>{label}</TabText>
                      </Tab>
                    ))}
                  </TabList>
                  {[
                    { key: "past_tense" },
                    { key: "present_tense" },
                  ].map(({ key }) => {
                    const entries = conjugations[key] || [];

                    const getConj = (person, number, gender) =>
                      entries.find(
                        (e) =>
                          e.person === person &&
                          e.number === number &&
                          (e.gender === gender || e.gender === "common")
                      );

                    const renderCell = (person, number, gender) => {
                      const entry = getConj(person, number, gender);
                      if (!entry)
                        return (
                          <td
                            key={`${person}-${number}-${gender}`}
                            className="conj-cell empty"
                          >
                            —
                          </td>
                        );
                      return (
                        <td
                          key={`${person}-${number}-${gender}`}
                          className="conj-cell"
                        >
                          <span className="cell-form">{entry.form}</span>
                          <span className="cell-transliteration">
                            {entry.transliteration}
                          </span>
                          <span className="cell-pronoun">{entry.pronoun}</span>
                        </td>
                      );
                    };

                    return (
                      <TabPanel key={key}>
                        <ConjugationSection>
                          <ConjugationTable>
                            <thead>
                              <tr>
                                <th rowSpan={2}>{t("root__conj_hal")}</th>
                                <th rowSpan={2}>{t("root__conj_gender")}</th>
                                <th colSpan={3}>{t("root__conj_sayi")}</th>
                              </tr>
                              <tr>
                                <th>{t("root__conj_number_plural")}</th>
                                <th>{t("root__conj_number_dual")}</th>
                                <th>{t("root__conj_number_singular")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td rowSpan={2} className="person-label">
                                  {t("root__conj_person_third")}
                                </td>
                                <td className="gender-label">
                                  {t("root__conj_gender_male")}
                                </td>
                                {renderCell("third", "plural", "male")}
                                {renderCell("third", "dual", "male")}
                                {renderCell("third", "singular", "male")}
                              </tr>
                              <tr>
                                <td className="gender-label">
                                  {t("root__conj_gender_female")}
                                </td>
                                {renderCell("third", "plural", "female")}
                                {renderCell("third", "dual", "female")}
                                {renderCell("third", "singular", "female")}
                              </tr>
                              <tr>
                                <td rowSpan={2} className="person-label">
                                  {t("root__conj_person_second")}
                                </td>
                                <td className="gender-label">
                                  {t("root__conj_gender_male")}
                                </td>
                                {renderCell("second", "plural", "male")}
                                {renderCell("second", "dual", "common")}
                                {renderCell("second", "singular", "male")}
                              </tr>
                              <tr>
                                <td className="gender-label">
                                  {t("root__conj_gender_female")}
                                </td>
                                {renderCell("second", "plural", "female")}
                                {renderCell("second", "dual", "common")}
                                {renderCell("second", "singular", "female")}
                              </tr>
                              <tr>
                                <td className="person-label">
                                  {t("root__conj_person_first")}
                                </td>
                                <td className="gender-label">
                                  {t("root__conj_gender_common")}
                                </td>
                                {renderCell("first", "plural", "common")}
                                {renderCell("first", "dual", "common")}
                                {renderCell("first", "singular", "common")}
                              </tr>
                            </tbody>
                          </ConjugationTable>
                        </ConjugationSection>
                      </TabPanel>
                    );
                  })}
                </Tabs>
              </ConjugationBody>
            )}
          </ConjugationWrapper>
        )}
        <RootDetail>
          <Container>
            <Row>
              <Col sm={12}>
                <Tabs>
                  <TabList>
                    <Tab>
                      <RiGitMergeLine />
                      <TabText>{t("root__verses_list")}</TabText>
                    </Tab>
                  </TabList>
                  <TabPanel>
                    <RootVerses>
                      {loading ? (
                        <LoadingBar />
                      ) : versesData?.length === 0 ? (
                        <EmptyVersesData>
                          {t("root__verses_list_empty")}
                        </EmptyVersesData>
                      ) : (
                        <InfiniteScroll
                          dataLength={versesData.length}
                          next={fetchData}
                          hasMore={!!versesLinkNext}
                          loader={<LoadingBar />}
                        >
                          {versesData &&
                            versesData.map((x) => {
                              const showVerse = !!showVerses.find(
                                (i) => i === x.id
                              );

                              const surahNames = {
                                tr: x.surah.name,
                                en: x.surah.name_en,
                              };

                              const verseTranscriptions = {
                                tr: x.verse.transcription_tr,
                                en: x.verse.transcription_en,
                              };

                              const versePartTranscriptions = {
                                tr: x.transcription_tr,
                                en: x.transcription_en,
                              };

                              const versePartTranslations = {
                                tr: x.translation_tr,
                                en: x.translation_en,
                              };

                              const surahName = surahNames[locale];
                              return (
                                <RootVerse
                                  id={`${x.surah.id}-${x.verse.verse_number}-${x.sort_number}`}
                                  key={x.id}
                                  onClick={() => {
                                    !showVerse && toggleVerse(x.id);
                                  }}
                                >
                                  <RootVerseTop>
                                    <RootVerseTitle>
                                      <div>
                                        <Link
                                          role="button"
                                          href={`/[surah_id]/[verse_number]`}
                                          as={`/${x.surah.id}/${x.verse.verse_number}`}
                                          tabIndex="0"
                                        >
                                          <>
                                            {surahName} / {x.surah.id}:
                                            {x.verse.verse_number}
                                          </>
                                        </Link>
                                        :<em>{x.sort_number}</em>
                                      </div>
                                      <div className="root__title-arabic">
                                        <RiArrowRightSLine />
                                        <RootTitleArabic>
                                          {x.arabic}
                                        </RootTitleArabic>
                                        <RiArrowRightSLine className="show-icon" />
                                        <RootTitleTranscription>
                                          {versePartTranscriptions[locale]}
                                        </RootTitleTranscription>
                                      </div>
                                      <div className="root__title-turkish">
                                        <RiArrowRightSLine />
                                        {versePartTranslations[locale]}
                                      </div>
                                    </RootVerseTitle>

                                    <RootVerseOption>
                                      {showVerse ? (
                                        <Button
                                          tabIndex="0"
                                          aria-label={t("root__toggle_verse")}
                                          type="text"
                                          onClick={() => {
                                            showVerse && toggleVerse(x.id);
                                          }}
                                        >
                                          <RiArrowDownSLine />
                                        </Button>
                                      ) : (
                                        <Button
                                          tabIndex="0"
                                          aria-label={t("root__toggle_verse")}
                                          type="text"
                                          onClick={() => {
                                            showVerse && toggleVerse(x.id);
                                          }}
                                        >
                                          <RiArrowUpSLine />
                                        </Button>
                                      )}
                                    </RootVerseOption>
                                  </RootVerseTop>

                                  {showVerse && (
                                    <RootVerseDetail show={showVerse}>
                                      <RootVerseTags>
                                        {x.details?.map((i, index) => {
                                          return (
                                            i.length > 0 && (
                                              <RootVerseTag key={index}>
                                                {i.map((j, jndex) => {
                                                  return (
                                                    <>
                                                      <span key={jndex}>
                                                        {j[locale]}
                                                      </span>
                                                      {i.length > 1 &&
                                                        jndex < i.length - 1 &&
                                                        ", "}
                                                    </>
                                                  );
                                                })}
                                              </RootVerseTag>
                                            )
                                          );
                                        })}
                                      </RootVerseTags>
                                      <RootVerseTranslation>
                                        <VerseExpand
                                          translation={x.verse.translation}
                                          showFootnotes={false}
                                        />
                                      </RootVerseTranslation>
                                      <RootVerseArabic>
                                        {x.verse.verse}
                                      </RootVerseArabic>
                                      <RootVerseTranscription>
                                        {verseTranscriptions[locale]}
                                      </RootVerseTranscription>
                                    </RootVerseDetail>
                                  )}
                                </RootVerse>
                              );
                            })}
                        </InfiniteScroll>
                      )}
                    </RootVerses>
                  </TabPanel>
                </Tabs>
              </Col>
              {/* <Col sm={4}>
                <Tabs>
                  <TabList>
                    <Tab>
                      <FaLayerGroup />
                      <TabText>Türevler</TabText>
                    </Tab>
                  </TabList>
                  <TabPanel>
                    {prot.diffs.map((x, index) => {
                      return (
                        <RootDiffs key={index}>
                          ({x.count}) {x.diff}
                        </RootDiffs>
                      );
                    })}
                  </TabPanel>
                </Tabs>
              </Col> */}
            </Row>
          </Container>
        </RootDetail>
      </Content>
      {navWidth >= theme.awesomegrid.breakpoints.sm * 16 && <Footer />}
    </SC>
  );
};

export async function getServerSideProps(ctx) {
  const locale = process.env.NEXT_PUBLIC_LOCALE;
  const defaultAuthorId = require("@data/defaultAuthors")[locale];
  const settings = cookies(ctx).settings || { a: defaultAuthorId };
  const authorId = settings?.a || defaultAuthorId;

  const {
    query: { latin },
  } = ctx;

  const { data: rootData } = await fetchJson(
    `${process.env.NEXT_PUBLIC_API_URL}/root/latin/${latin}`
  );

  if (locale && rootData?.rootchar_id) {
    return {
      props: {
        locale,
        authorId,
        root: rootData,
        ...(await serverSideTranslations(locale, ["common"])),
      },
    };
  } else {
    return {
      props: {
        errorCode: 404,
        ...(await serverSideTranslations(locale, ["common"])),
      },
    };
  }
}

export default Root;
