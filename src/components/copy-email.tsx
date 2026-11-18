"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <>
      <button
        aria-label={copied ? "Email address copied" : "Copy email address"}
        onClick={copyEmail}
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
      </button>
      <span className="copy-status" role="status">
        {copied ? "Email copied" : copyError ? "Please select the email to copy it." : ""}
      </span>
    </>
  );
}
