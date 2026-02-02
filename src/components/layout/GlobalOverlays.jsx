import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectTheme,
  selectContactFormOpen,
  selectTrackOrderOpen,
  selectToast,
  setContactFormOpen,
  setTrackOrderOpen,
  hideToast,
} from "../../store/slices/uiSlice";

import CustomCursor from "./CustomCursor";
import Preloader from "./Preloader";
import WhatsAppButton from "../common/WhatsAppButton";
import LoginModal from "../admin/LoginModal";
import Toast from "../common/Toast";
import ContactForm from "../common/ContactForm";
import TrackOrder from "../common/TrackOrder";

const GlobalOverlays = ({ isReady }) => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const contactFormOpen = useSelector(selectContactFormOpen);
  const trackOrderOpen = useSelector(selectTrackOrderOpen);
  const toast = useSelector(selectToast);

  return (
    <>
      <CustomCursor />
      <Preloader isReady={isReady} />
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        onClose={() => dispatch(hideToast())}
      />
      <WhatsAppButton />
      <LoginModal />
      <TrackOrder
        isOpen={trackOrderOpen}
        onClose={() => dispatch(setTrackOrderOpen(false))}
        theme={theme}
      />
      <ContactForm
        isOpen={contactFormOpen}
        onClose={() => dispatch(setContactFormOpen(false))}
        theme={theme}
      />
    </>
  );
};

export default GlobalOverlays;
