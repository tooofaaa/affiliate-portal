"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type OnboardingStatus = "incomplete" | "submitted" | "approved" | "declined" | null;

interface VerificationContextValue {
  onboardingStatus: OnboardingStatus;
  isVerified: boolean;
  triggerVerificationModal: (onConfirm?: () => void) => void;
  closeVerificationModal: () => void;
  modalOpen: boolean;
  onModalConfirm: (() => void) | undefined;
}

const VerificationContext = createContext<VerificationContextValue | null>(null);

export function VerificationProvider({
  children,
  onboardingStatus,
}: {
  children: ReactNode;
  onboardingStatus: OnboardingStatus;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [onModalConfirm, setOnModalConfirm] = useState<(() => void) | undefined>(undefined);

  const isVerified = onboardingStatus === "approved";

  const triggerVerificationModal = useCallback((onConfirm?: () => void) => {
    setOnModalConfirm(() => onConfirm);
    setModalOpen(true);
  }, []);

  const closeVerificationModal = useCallback(() => {
    setModalOpen(false);
    setOnModalConfirm(undefined);
  }, []);

  return (
    <VerificationContext.Provider value={{
      onboardingStatus,
      isVerified,
      triggerVerificationModal,
      closeVerificationModal,
      modalOpen,
      onModalConfirm,
    }}>
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error("useVerification must be used within VerificationProvider");
  return ctx;
}