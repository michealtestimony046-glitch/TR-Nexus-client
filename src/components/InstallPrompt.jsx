import React, { useEffect, useState } from "react";

const DISMISS_KEY = "tr_install_dismissed_at";
const DISMISS_DAYS = 7;

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const stillCool = Date.now() - dismissedAt < DISMISS_DAYS * 86400_000;

    function onPrompt(e) {
      e.preventDefault();
      setDeferred(e);
      if (!stillCool) setVisible(true);
    }
    function onInstalled() {
      setVisible(false);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible || !deferred) return null;

  return (
    <div className="install-prompt" role="dialog" aria-label="Install T/R Agency">
      <div className="ip-mark">T/R</div>
      <div className="ip-body">
        <strong>Install T/R Agency</strong>
        <span>Fast access from your home screen. Works offline.</span>
      </div>
      <div className="ip-actions">
        <button className="ip-btn ghost" onClick={dismiss}>Later</button>
        <button className="ip-btn primary" onClick={install}>Install</button>
      </div>
    </div>
  );
}
