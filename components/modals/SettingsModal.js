import { setCookie } from "cookies-next";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiSettings5Line } from "react-icons/ri";
import Switch from "react-switch";
import { useRecoilState } from "recoil";

import Selectbox from "@components/common/Selectbox";
import { modalState } from "@recoil/atoms";
import {
  FormGeneric,
  FormItemDivider,
  FormSelectItem,
  FormSwitchItem,
} from "@styles/form.style";
import {
  SettingsModalContainer,
} from "@styles/settings.style";
import { authorOptions, fetchJson } from "@utils/funcs";

import BaseModal from "./BaseModal";

const SettingsModal = (props) => {
  const { modalKey, fullscreen } = props;

  const { t } = useTranslation("common");
  const locale = process.env.NEXT_PUBLIC_LOCALE;
  const router = useRouter();
  const MODAL_WIDTH = 600;

  const [modalInfo, setModalInfo] = useRecoilState(modalState);

  const [authors, setAuthors] = useState([]);
  const [modalUserSettings, setModalUserSettings] = useState(
    modalInfo?.modalProps?.userSettings || {}
  );

  useEffect(() => {
    if (modalInfo?.modalProps) {
      setModalUserSettings(modalInfo.modalProps.userSettings);
    }
  }, [modalInfo?.modalProps]);

  const getAuthors = async () => {
    const { data } = await fetchJson(
      `${process.env.NEXT_PUBLIC_API_URL}/authors`
    );
    setAuthors(authorOptions(data, locale));
  };

  useEffect(() => {
    getAuthors();
  }, []);

  const setSomething = async (key, event) => {
    const newValue = event === false ? "" : event;
    const newSettings = {
      ...modalUserSettings,
      [key]: newValue,
    };
    if (locale === "en" && key === "a") {
      newSettings.a_en = newValue;
    }
    if (modalInfo.modalProps.setUserSettings) {
      modalInfo.modalProps.setUserSettings(newSettings);
    }

    setModalUserSettings(newSettings);
    setCookie("settings", JSON.stringify(newSettings), {
      maxAge: 60 * 60 * 24 * 12265,
    });

    if (key === "a") {
      setTimeout(() => router.reload(), 50);
    }
  };

  return (
    <BaseModal
      title={t("settings__tab__settings_title")}
      modalKey={modalKey}
      width={MODAL_WIDTH}
      fullscreen={fullscreen}
      contentStyle={{ padding: 0 }}
    >
      <SettingsModalContainer>
        {modalInfo.modalProps && (
          <FormGeneric>
            <FormSelectItem>
              <label>{t("settings__form__author_label")}</label>

              <Selectbox
                instanceId="change-author__select"
                className="change-author__select"
                placeholder={t("selectbox__author_placeholder")}
                isSearchable
                value={authors.find((i) => i.value == modalUserSettings.a)}
                options={authors}
                menuPosition="fixed"
                onChange={(event) => {
                  setSomething("a", event.value);
                }}
                onChangeNative={(event) => {
                  setSomething("a", event.target.value);
                }}
                aria-label={t("selectbox__select_author")}
              />
            </FormSelectItem>
            <FormSwitchItem style={{ paddingTop: 4 }}>
              <label>{t("settings__form__footnote_label")}</label>
              <Switch
                checkedIcon={false}
                uncheckedIcon={false}
                checked={Boolean(modalUserSettings.sF || false)}
                activeBoxShadow={"unset"}
                onColor={"#82a573"}
                offColor={"#838383"}
                onChange={(event) => {
                  setSomething("sF", event);
                }}
              />
            </FormSwitchItem>
            <FormItemDivider>
              {t("settings__form__surah_divider")}
            </FormItemDivider>
            <FormSwitchItem>
              <label>{t("settings__form__hide_arabic_label")}</label>
              <Switch
                checkedIcon={false}
                uncheckedIcon={false}
                onChange={(event) => {
                  setSomething("hO", event);
                }}
                checked={Boolean(modalUserSettings.hO || false)}
                activeBoxShadow={"unset"}
                onColor={"#82a573"}
                offColor={"#838383"}
                disabled={Boolean(
                  modalUserSettings.hC && modalUserSettings.hT
                )}
              />
            </FormSwitchItem>
            <FormSwitchItem>
              <label>{t("settings__form__hide_transcription_label")}</label>
              <Switch
                checkedIcon={false}
                uncheckedIcon={false}
                onChange={(event) => {
                  setSomething("hC", event);
                }}
                checked={Boolean(modalUserSettings.hC || false)}
                activeBoxShadow={"unset"}
                onColor={"#82a573"}
                offColor={"#838383"}
                disabled={Boolean(
                  modalUserSettings.hO && modalUserSettings.hT
                )}
              />
            </FormSwitchItem>
            <FormSwitchItem>
              <label>{t("settings__form__hide_translation_label")}</label>
              <Switch
                checkedIcon={false}
                uncheckedIcon={false}
                onChange={(event) => {
                  setSomething("hT", event);
                }}
                checked={Boolean(modalUserSettings.hT || false)}
                activeBoxShadow={"unset"}
                disabled={Boolean(
                  modalUserSettings.hO && modalUserSettings.hC
                )}
                onColor={"#82a573"}
                offColor={"#838383"}
              />
            </FormSwitchItem>
          </FormGeneric>
        )}
      </SettingsModalContainer>
    </BaseModal>
  );
};

export default SettingsModal;
