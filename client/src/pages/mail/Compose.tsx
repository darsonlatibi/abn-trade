import React, { useRef, useState } from "react";
import {
  Archive,
  Bold,
  Italic,
  Link,
  List,
  Paperclip,
  Send,
  Trash2,
  Underline,
} from "lucide-react";
import "./Compose.css";

/* =========================================================
   CONSTANTS
   ========================================================= */

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

/* =========================================================
   COMPONENT
   ========================================================= */

const Compose: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [attachments, setAttachments] = useState<File[]>([]);

  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);

  const [errors, setErrors] = useState<{
    to?: string;
    subject?: string;
  }>({});

  /* =======================================================
     HELPERS
     ======================================================= */

  const clearErrors = () => {
    setErrors({});
  };

  const resetCompose = () => {
    setTo("");
    setCc("");
    setBcc("");
    setSubject("");
    setAttachments([]);
    setSaved(false);
    setErrors({});

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  /* =======================================================
     ATTACHMENT
     ======================================================= */

  const handleAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const validFiles = files.filter((file) => file.size <= MAX_ATTACHMENT_SIZE);

    setAttachments((current) => {
      const existingKeys = new Set(
        current.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );

      const newFiles = validFiles.filter(
        (file) =>
          !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`),
      );

      return [...current, ...newFiles];
    });

    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  /* =======================================================
     SAVE DRAFT
     ======================================================= */

  const handleSaveDraft = () => {
    setSaved(true);

    // Backend draft API will be connected here.
    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =======================================================
     DISCARD
     ======================================================= */

  const handleDiscard = () => {
    resetCompose();
  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateForm = () => {
    const nextErrors: {
      to?: string;
      subject?: string;
    } = {};

    if (!to.trim()) {
      nextErrors.to = "Recipient is required.";
    }

    if (!subject.trim()) {
      nextErrors.subject = "Subject is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =======================================================
     SEND
     ======================================================= */

  const handleSend = async () => {
    clearErrors();

    if (!validateForm()) {
      return;
    }

    setSending(true);

    try {
      /*
       * Backend send-mail API will be connected here.
       *
       * Example payload:
       *
       * {
       *   to,
       *   cc,
       *   bcc,
       *   subject,
       *   message: editorRef.current?.innerHTML,
       *   attachments
       * }
       */

      await new Promise((resolve) => setTimeout(resolve, 700));

      resetCompose();
    } finally {
      setSending(false);
    }
  };

  /* =======================================================
     EDITOR COMMAND
     ======================================================= */

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus();

    document.execCommand(command, false, value);
  };

  /* =======================================================
     INSERT LINK
     ======================================================= */

  const handleInsertLink = () => {
    editorRef.current?.focus();

    const url = window.prompt("Enter URL", "https://");

    if (!url?.trim()) {
      return;
    }

    execCommand("createLink", url.trim());
  };

  /* =======================================================
     EDITOR INPUT
     ======================================================= */

  const handleEditorInput = () => {
    setSaved(false);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="compose-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="compose-header">
        <div>
          <h1>Compose</h1>

          <p>Create and send a new message.</p>
        </div>

        {saved && (
          <div className="compose-saved" role="status" aria-live="polite">
            Draft saved
          </div>
        )}
      </div>

      {/* ===================================================
          CARD
          =================================================== */}

      <section className="compose-card">
        {/* =================================================
            TO
            ================================================= */}

        <div className="compose-field-row">
          <label htmlFor="compose-to">To</label>

          <div className="compose-recipient-wrapper">
            <div className="compose-recipient-field">
              <input
                id="compose-to"
                type="text"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);

                  if (errors.to) {
                    setErrors((current) => ({
                      ...current,
                      to: undefined,
                    }));
                  }
                }}
                placeholder="recipient@example.com"
                autoComplete="off"
                aria-invalid={Boolean(errors.to)}
                aria-describedby={errors.to ? "compose-to-error" : undefined}
              />

              <div className="compose-recipient-actions">
                <button
                  type="button"
                  className={showCc ? "active" : ""}
                  onClick={() => setShowCc((current) => !current)}
                >
                  Cc
                </button>

                <button
                  type="button"
                  className={showBcc ? "active" : ""}
                  onClick={() => setShowBcc((current) => !current)}
                >
                  Bcc
                </button>
              </div>
            </div>

            {errors.to && (
              <span id="compose-to-error" className="compose-field-error">
                {errors.to}
              </span>
            )}
          </div>
        </div>

        {/* =================================================
            CC
            ================================================= */}

        {showCc && (
          <div className="compose-field-row">
            <label htmlFor="compose-cc">Cc</label>

            <input
              id="compose-cc"
              type="text"
              value={cc}
              onChange={(event) => setCc(event.target.value)}
              placeholder="carboncopy@example.com"
              autoComplete="off"
            />
          </div>
        )}

        {/* =================================================
            BCC
            ================================================= */}

        {showBcc && (
          <div className="compose-field-row">
            <label htmlFor="compose-bcc">Bcc</label>

            <input
              id="compose-bcc"
              type="text"
              value={bcc}
              onChange={(event) => setBcc(event.target.value)}
              placeholder="blindcopy@example.com"
              autoComplete="off"
            />
          </div>
        )}

        {/* =================================================
            SUBJECT
            ================================================= */}

        <div className="compose-field-row">
          <label htmlFor="compose-subject">Subject</label>

          <div className="compose-field-wrapper">
            <input
              id="compose-subject"
              type="text"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);

                if (errors.subject) {
                  setErrors((current) => ({
                    ...current,
                    subject: undefined,
                  }));
                }
              }}
              placeholder="Subject"
              autoComplete="off"
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? "compose-subject-error" : undefined
              }
            />

            {errors.subject && (
              <span id="compose-subject-error" className="compose-field-error">
                {errors.subject}
              </span>
            )}
          </div>
        </div>

        {/* =================================================
            TOOLBAR
            ================================================= */}

        <div className="compose-editor-toolbar">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => execCommand("bold")}
            title="Bold"
            aria-label="Bold"
          >
            <Bold size={16} />
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => execCommand("italic")}
            title="Italic"
            aria-label="Italic"
          >
            <Italic size={16} />
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => execCommand("underline")}
            title="Underline"
            aria-label="Underline"
          >
            <Underline size={16} />
          </button>

          <span className="compose-toolbar-divider" />

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => execCommand("insertUnorderedList")}
            title="Bullet list"
            aria-label="Bullet list"
          >
            <List size={16} />
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleInsertLink}
            title="Insert link"
            aria-label="Insert link"
          >
            <Link size={16} />
          </button>
        </div>

        {/* =================================================
            EDITOR
            ================================================= */}

        <div
          ref={editorRef}
          className="compose-editor"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Message body"
          data-placeholder="Write your message..."
          onInput={handleEditorInput}
        />

        {/* =================================================
            ATTACHMENTS
            ================================================= */}

        {attachments.length > 0 && (
          <div className="compose-attachments">
            {attachments.map((file, index) => (
              <div
                className="compose-attachment"
                key={`${file.name}-${file.size}-${file.lastModified}`}
              >
                <Paperclip size={15} />

                <span title={file.name}>{file.name}</span>

                <small>
                  {file.size < 1024 * 1024
                    ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                    : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                </small>

                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  title="Remove attachment"
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="compose-footer">
          <div className="compose-footer-left">
            <button
              type="button"
              className="compose-send-button"
              disabled={sending || !to.trim() || !subject.trim()}
              onClick={handleSend}
            >
              <Send size={16} />

              {sending ? "Sending..." : "Send"}
            </button>

            <button
              type="button"
              className="compose-icon-button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
              aria-label="Attach files"
            >
              <Paperclip size={17} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleAttachment}
            />

            <button
              type="button"
              className="compose-draft-button"
              onClick={handleSaveDraft}
            >
              <Archive size={16} />
              Save Draft
            </button>
          </div>

          <button
            type="button"
            className="compose-discard-button"
            onClick={handleDiscard}
            title="Discard"
          >
            <Trash2 size={17} />
            Discard
          </button>
        </div>
      </section>
    </div>
  );
};

export default Compose;
