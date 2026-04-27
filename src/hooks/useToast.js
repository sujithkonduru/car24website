/**
 * useToast.js — Thin wrapper around react-hot-toast
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success("Booking confirmed!");
 *   toast.error("Something went wrong");
 *
 * Or standalone:
 *   import { toastSuccess, toastError } from "../hooks/useToast";
 */

import toast from "react-hot-toast";

const BASE = {
  borderRadius: "10px",
  fontFamily: "DM Sans, system-ui, sans-serif",
  fontSize: "0.875rem",
  fontWeight: 500,
  maxWidth: "380px",
  background: "#0d1828",
  color: "#e8edf5",
  border: "1px solid rgba(255,255,255,0.08)",
};

export const toastSuccess = (msg, opts = {}) =>
  toast.success(msg, {
    duration: 3500,
    style: { ...BASE, borderLeft: "3px solid #14b8a6" },
    iconTheme: { primary: "#14b8a6", secondary: "#070d18" },
    ...opts,
  });

export const toastError = (msg, opts = {}) =>
  toast.error(typeof msg === "string" ? msg : msg?.message || "Something went wrong", {
    duration: 4500,
    style: { ...BASE, borderLeft: "3px solid #f87171" },
    iconTheme: { primary: "#f87171", secondary: "#070d18" },
    ...opts,
  });

export const toastLoading = (msg, opts = {}) =>
  toast.loading(msg, {
    style: { ...BASE, borderLeft: "3px solid #2ec4e6" },
    ...opts,
  });

export const toastDismiss = (id) => toast.dismiss(id);

export const toastPromise = (promise, msgs = {}) =>
  toast.promise(
    promise,
    {
      loading: msgs.loading || "Loading…",
      success: msgs.success || "Done!",
      error: (err) => msgs.error || err?.message || "Something went wrong",
    },
    {
      style: BASE,
      success: { iconTheme: { primary: "#14b8a6", secondary: "#070d18" } },
      error:   { iconTheme: { primary: "#f87171", secondary: "#070d18" } },
    }
  );

export default function useToast() {
  return {
    success: toastSuccess,
    error:   toastError,
    loading: toastLoading,
    dismiss: toastDismiss,
    promise: toastPromise,
  };
}
