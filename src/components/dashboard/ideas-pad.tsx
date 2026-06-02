"use client";

import { useEffect, useMemo, useState } from "react";

type IdeasPadProps = {
  identity: string;
};

export function IdeasPad({ identity }: IdeasPadProps) {
  const storageKey = useMemo(() => `pathly:ideas:${identity.toLowerCase()}`, [identity]);
  const [value, setValue] = useState("");
  const [savedAt, setSavedAt] = useState<string>("");

  useEffect(() => {
    const saved = globalThis.localStorage?.getItem(storageKey);
    if (saved) {
      setValue(saved);
    }
  }, [storageKey]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      globalThis.localStorage?.setItem(storageKey, value);
      if (value.trim().length > 0) {
        setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    }, 250);

    return () => globalThis.clearTimeout(timer);
  }, [storageKey, value]);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-7 text-slate-400">
        Capture raw ideas, risks, or insights. Saved locally in your browser for this account.
      </p>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="min-h-36 w-full rounded-3xl border border-indigo-500/30 bg-slate-800/40 px-4 py-3 text-slate-100 outline-none transition-all focus:border-indigo-400/60 focus:bg-slate-800/60"
        placeholder={"- Key insight to explore:\n- Risk to address today:\n- Next step that unblocks the most:"}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{savedAt ? `Auto-saved at ${savedAt}` : "Auto-save enabled"}</p>
        <button
          type="button"
          onClick={() => setValue("")}
          className="rounded-full border border-slate-600/40 bg-slate-700/20 px-3 py-1 text-xs font-semibold text-slate-300 transition-all hover:border-indigo-400/40 hover:text-indigo-300"
        >
          Clear notes
        </button>
      </div>
    </div>
  );
}
