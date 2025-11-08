"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
            borderRadius: "0.5rem",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              border: "1px solid #10b981",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              border: "1px solid #ef4444",
            },
          },
          loading: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#fff",
            },
            style: {
              border: "1px solid #3b82f6",
            },
          },
        }}
      />
    </>
  );
}

