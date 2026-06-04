"use client";

import { useEffect, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  panelClassName?: string;
  bodyClassName?: string;
  fullscreen?: boolean;
};

export function Dialog({ open, onClose, title, children, panelClassName, bodyClassName, fullscreen = false }: DialogProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex ${fullscreen ? "items-stretch justify-stretch p-0" : "items-end justify-center p-3 sm:items-center sm:p-5"}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative flex ${fullscreen ? "h-full w-full max-h-none max-w-none rounded-none border-0" : "max-h-[88vh] w-full max-w-xl rounded-3xl border border-slate-700/40"} flex-col overflow-hidden bg-[#0c1120] shadow-[0_24px_80px_rgba(0,0,0,0.7)] ${panelClassName ?? ""}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800/60 px-5 py-4">
          {title ? (
            <p className="text-sm font-semibold text-slate-200">{title}</p>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="rounded-full border border-slate-700/40 px-3 py-1 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-500/40 hover:text-slate-200"
          >
            Close ✕
          </button>
        </div>
        <div className={`overflow-y-auto px-5 py-5 ${bodyClassName ?? ""}`}>{children}</div>
      </div>
    </div>
  );
}
