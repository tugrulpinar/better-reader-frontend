import { useRecoilValue } from "recoil";
import { ModalProvider } from "styled-react-modal";

import { modalState } from "@recoil/atoms";
import { FadingBackground } from "@styles/modal.style";

import AuthorSelectionModal from "./AuthorSelectionModal";
import SettingsModal from "./SettingsModal";

const Modals = (props) => {
  const { authorId } = props;
  const modalInfo = useRecoilValue(modalState);

  return (
    <ModalProvider backgroundComponent={FadingBackground}>
      {modalInfo?.openedModal === "settings" && (
        <SettingsModal modalKey="settings" />
      )}
      {modalInfo?.openedModal === "authorSelection" && (
        <AuthorSelectionModal modalKey="authorSelection" fullscreen={true} />
      )}
    </ModalProvider>
  );
};

export default Modals;
