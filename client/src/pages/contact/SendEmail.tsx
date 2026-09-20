/* =========================================================
   ABN FLEET SYSTEM
   EMAIL CENTER
   REDUX CONNECTED
   ========================================================= */

import { useEffect, useMemo, useState } from "react";

import type { KeyboardEvent } from "react";

import {
  Archive,
  ChevronLeft,
  Mail,
  MailOpen,
  Plus,
  RefreshCw,
  Reply,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../stores/store";

import {
  archiveEmail,
  deleteEmail,
  fetchEmailById,
  fetchEmails,
  markEmailAsRead,
  sendEmail,
  setEmailFolder,
  setSelectedEmail,
  toggleEmailStar,
  type MailFolder,
  type EmailMessage,
} from "../../features/email/emailSlice";

import "./SendEmail.css";

/* =========================================================
   COMPANY EMAIL
   ========================================================= */

//const COMPANY_EMAIL = "support@abnfleet.com";

/* =========================================================
   DEFAULT RECIPIENT
   ========================================================= */

const DEFAULT_RECIPIENT = "darsonptst@gmail.com";

/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================================================
   SEND EMAIL
   ========================================================= */

function SendEmail() {
  /* =======================================================
     REDUX
     ======================================================= */

  const dispatch = useDispatch<AppDispatch>();

  const { emails, selectedEmail, folder, loading, sending, error } =
    useSelector((state: RootState) => state.email);

  /* =======================================================
     SEARCH
     ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     COMPOSE
     ======================================================= */

  const [composeOpen, setComposeOpen] = useState(false);

  /* =======================================================
     RECIPIENTS
     ======================================================= */

  const [toEmails, setToEmails] = useState<string[]>([]);

  const [recipientInput, setRecipientInput] = useState("");

  /* =======================================================
     SUBJECT
     ======================================================= */

  const [subject, setSubject] = useState("");

  /* =======================================================
     MESSAGE
     ======================================================= */

  const [message, setMessage] = useState("");

  /* =======================================================
     LOAD EMAILS
     ======================================================= */

  useEffect(() => {
    dispatch(
      fetchEmails({
        folder,
        search: search.trim() || undefined,
      }),
    );
  }, [dispatch, folder, search]);

  /* =======================================================
     FILTER EMAIL
     ======================================================= */

  const filteredEmails = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return emails;
    }

    return emails.filter((email) => {
      const fromName = email.fromName?.toLowerCase() || "";

      const fromEmail = email.fromEmail?.toLowerCase() || "";

      const subjectText = email.subject?.toLowerCase() || "";

      const bodyText = email.body?.toLowerCase() || "";

      const previewText = email.preview?.toLowerCase() || "";

      return (
        fromName.includes(keyword) ||
        fromEmail.includes(keyword) ||
        subjectText.includes(keyword) ||
        bodyText.includes(keyword) ||
        previewText.includes(keyword)
      );
    });
  }, [emails, search]);

  /* =======================================================
     OPEN EMAIL
     ======================================================= */

  const handleOpenEmail = async (email: EmailMessage) => {
    dispatch(setSelectedEmail(email));

    /* =====================================================
       LOAD FULL DETAIL
       ===================================================== */

    await dispatch(fetchEmailById(email.id));

    /* =====================================================
       MARK READ
       ===================================================== */

    if (email.unread) {
      await dispatch(markEmailAsRead(email.id));
    }
  };

  /* =======================================================
     STAR
     ======================================================= */

  const handleToggleStar = async (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number,
  ) => {
    event.stopPropagation();

    await dispatch(toggleEmailStar(id));
  };

  /* =======================================================
     OPEN COMPOSE
     ======================================================= */

  const handleOpenCompose = () => {
    dispatch(setSelectedEmail(null));

    setToEmails([DEFAULT_RECIPIENT]);

    setRecipientInput("");

    setSubject("");

    setMessage("");

    setComposeOpen(true);
  };

  /* =======================================================
     CLOSE COMPOSE
     ======================================================= */

  const handleCloseCompose = () => {
    setComposeOpen(false);

    setToEmails([]);

    setRecipientInput("");

    setSubject("");

    setMessage("");
  };

  /* =======================================================
     ADD RECIPIENT
     ======================================================= */

  const addRecipient = () => {
    const email = recipientInput.trim().replace(/,$/, "").toLowerCase();

    if (!email) {
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      return;
    }

    if (toEmails.includes(email)) {
      setRecipientInput("");

      return;
    }

    setToEmails((current) => [...current, email]);

    setRecipientInput("");
  };

  /* =======================================================
     REMOVE RECIPIENT
     ======================================================= */

  const removeRecipient = (email: string) => {
    setToEmails((current) => current.filter((item) => item !== email));
  };

  /* =======================================================
     RECIPIENT KEYBOARD
     ======================================================= */

  const handleRecipientKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === " ") {
      event.preventDefault();

      addRecipient();

      return;
    }

    if (event.key === "Backspace" && !recipientInput && toEmails.length > 0) {
      removeRecipient(toEmails[toEmails.length - 1]);
    }
  };

  /* =======================================================
     SEND EMAIL
     ======================================================= */

  const handleSend = async () => {
    /* =====================================================
       COLLECT RECIPIENTS
       ===================================================== */

    const recipients = [...toEmails];

    const pendingRecipient = recipientInput
      .trim()
      .replace(/,$/, "")
      .toLowerCase();

    if (
      pendingRecipient &&
      EMAIL_REGEX.test(pendingRecipient) &&
      !recipients.includes(pendingRecipient)
    ) {
      recipients.push(pendingRecipient);
    }

    /* =====================================================
       VALIDATION
       ===================================================== */

    if (recipients.length === 0 || !subject.trim() || !message.trim()) {
      return;
    }

    /* =====================================================
       API SEND
       ===================================================== */

    const result = await dispatch(
      sendEmail({
        to: recipients,

        subject: subject.trim(),

        body: message.trim(),
      }),
    );

    /* =====================================================
       SUCCESS
       ===================================================== */

    if (sendEmail.fulfilled.match(result)) {
      handleCloseCompose();

      dispatch(setEmailFolder("SENT"));

      dispatch(
        fetchEmails({
          folder: "SENT",
        }),
      );
    }
  };

  /* =======================================================
     REPLY
     ======================================================= */

  const handleReply = (email: EmailMessage) => {
    if (!email.fromEmail) {
      return;
    }

    setToEmails([email.fromEmail]);

    setRecipientInput("");

    setSubject(
      email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
    );

    setMessage("");

    setComposeOpen(true);
  };

  /* =======================================================
     ARCHIVE
     ======================================================= */

  const handleArchive = async (id: number) => {
    const result = await dispatch(archiveEmail(id));

    if (archiveEmail.fulfilled.match(result)) {
      dispatch(setSelectedEmail(null));
    }
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = async (id: number) => {
    const result = await dispatch(deleteEmail(id));

    if (deleteEmail.fulfilled.match(result)) {
      dispatch(setSelectedEmail(null));
    }
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    dispatch(
      fetchEmails({
        folder,
        search: search.trim() || undefined,
      }),
    );
  };

  /* =======================================================
     CHANGE FOLDER
     ======================================================= */

  const handleFolderChange = (nextFolder: MailFolder) => {
    dispatch(setEmailFolder(nextFolder));

    dispatch(setSelectedEmail(null));
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="send-email-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="send-email-header">
        <div>
          <span className="send-email-eyebrow">
            <Mail size={14} />
            COMPANY EMAIL
          </span>

          <h1>Email Center</h1>

          <p>
            Kelola komunikasi customer, partner, dan kebutuhan kerja sama PT
            Tiga Kawan Jaya.
          </p>
        </div>

        <button
          type="button"
          className="send-email-compose-button"
          onClick={handleOpenCompose}
        >
          <Plus size={18} />
          Compose Email
        </button>
      </header>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && <div className="send-email-error">{error}</div>}

      {/* =====================================================
          TOOLBAR
          ===================================================== */}

      <section className="send-email-toolbar">
        <div className="send-email-folders">
          {/* =================================================
              INBOX
              ================================================= */}

          <button
            type="button"
            className={folder === "INBOX" ? "active" : ""}
            onClick={() => handleFolderChange("INBOX")}
          >
            <Mail size={17} />
            Inbox
          </button>

          {/* =================================================
              SENT
              ================================================= */}

          <button
            type="button"
            className={folder === "SENT" ? "active" : ""}
            onClick={() => handleFolderChange("SENT")}
          >
            <Send size={17} />
            Sent
          </button>

          {/* =================================================
              DRAFT
              ================================================= */}

          <button
            type="button"
            className={folder === "DRAFT" ? "active" : ""}
            onClick={() => handleFolderChange("DRAFT")}
          >
            <Archive size={17} />
            Draft
          </button>

          {/* =================================================
              ARCHIVE
              ================================================= */}

          <button
            type="button"
            className={folder === "ARCHIVE" ? "active" : ""}
            onClick={() => handleFolderChange("ARCHIVE")}
          >
            <Archive size={17} />
            Archive
          </button>

          {/* =================================================
              TRASH
              ================================================= */}

          <button
            type="button"
            className={folder === "TRASH" ? "active" : ""}
            onClick={() => handleFolderChange("TRASH")}
          >
            <Trash2 size={17} />
            Trash
          </button>
        </div>

        {/* ===================================================
            SEARCH
            =================================================== */}

        <div className="send-email-search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Cari email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* ===================================================
            REFRESH
            =================================================== */}

        <button
          type="button"
          className="send-email-refresh"
          title="Refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "is-spinning" : ""} />
        </button>
      </section>

      {/* =====================================================
          EMAIL AREA
          ===================================================== */}

      <section className="send-email-content">
        {/* ===================================================
            EMAIL TABLE
            =================================================== */}

        <div className="send-email-table-wrapper">
          <table className="send-email-table">
            <thead>
              <tr>
                <th className="email-star-column"> </th>

                <th>FROM</th>

                <th>SUBJECT</th>

                <th>MESSAGE</th>

                <th>DATE</th>
              </tr>
            </thead>

            <tbody>
              {/* =============================================
                  LOADING
                  ============================================= */}

              {loading ? (
                <tr>
                  <td colSpan={5} className="send-email-empty">
                    <RefreshCw size={34} className="is-spinning" />

                    <strong>Memuat email...</strong>

                    <span>Mengambil data dari email service.</span>
                  </td>
                </tr>
              ) : filteredEmails.length === 0 ? (
                /* ===========================================
                   EMPTY
                   =========================================== */

                <tr>
                  <td colSpan={5} className="send-email-empty">
                    <MailOpen size={34} />

                    <strong>Tidak ada email</strong>

                    <span>Belum ada pesan pada folder ini.</span>
                  </td>
                </tr>
              ) : (
                /* ===========================================
                   EMAIL LIST
                   =========================================== */

                filteredEmails.map((email) => (
                  <tr
                    key={email.id}
                    className={email.unread ? "unread" : ""}
                    onClick={() => handleOpenEmail(email)}
                  >
                    {/* =====================================
                        STAR
                        ===================================== */}

                    <td>
                      <button
                        type="button"
                        className={`email-star ${
                          email.starred ? "active" : ""
                        }`}
                        onClick={(event) => handleToggleStar(event, email.id)}
                        aria-label={
                          email.starred ? "Unstar email" : "Star email"
                        }
                      >
                        <Star size={16} />
                      </button>
                    </td>

                    {/* =====================================
                        FROM
                        ===================================== */}

                    <td>
                      <div className="email-sender">
                        <strong>{email.fromName || email.fromEmail}</strong>

                        <span>{email.fromEmail}</span>
                      </div>
                    </td>

                    {/* =====================================
                        SUBJECT
                        ===================================== */}

                    <td className="email-subject">{email.subject}</td>

                    {/* =====================================
                        PREVIEW
                        ===================================== */}

                    <td className="email-preview">
                      {email.preview || email.body?.slice(0, 120)}
                    </td>

                    {/* =====================================
                        DATE
                        ===================================== */}

                    <td className="email-date">
                      {email.sentAt
                        ? new Date(email.sentAt).toLocaleString("id-ID")
                        : new Date(email.createdAt).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===================================================
            DETAIL
            =================================================== */}

        {selectedEmail && (
          <aside className="send-email-detail">
            {/* ===============================================
                DETAIL HEADER
                =============================================== */}

            <div className="send-email-detail-header">
              <button
                type="button"
                onClick={() => dispatch(setSelectedEmail(null))}
                aria-label="Back"
              >
                <ChevronLeft size={18} />
              </button>

              <div>
                <strong>{selectedEmail.subject}</strong>

                <span>
                  {selectedEmail.sentAt
                    ? new Date(selectedEmail.sentAt).toLocaleString("id-ID")
                    : new Date(selectedEmail.createdAt).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* ===============================================
                DETAIL META
                =============================================== */}

            <div className="send-email-detail-meta">
              <strong>
                {selectedEmail.fromName || selectedEmail.fromEmail}
              </strong>

              <span>{selectedEmail.fromEmail}</span>

              {/* =============================================
                  RECIPIENTS
                  ============================================= */}

              {selectedEmail.recipients &&
              selectedEmail.recipients.length > 0 ? (
                selectedEmail.recipients
                  .filter((recipient) => recipient.type === "TO")
                  .map((recipient) => (
                    <span key={recipient.id}>
                      To:{" "}
                      {recipient.name
                        ? `${recipient.name} <${recipient.email}>`
                        : recipient.email}
                    </span>
                  ))
              ) : (
                <span>To: -</span>
              )}
            </div>

            {/* ===============================================
                BODY
                =============================================== */}

            <div className="send-email-detail-body">{selectedEmail.body}</div>

            {/* ===============================================
                ACTIONS
                =============================================== */}

            <div className="send-email-detail-actions">
              <button type="button" onClick={() => handleReply(selectedEmail)}>
                <Reply size={16} />
                Reply
              </button>

              {/* =============================================
                  ARCHIVE
                  ============================================= */}

              <button
                type="button"
                onClick={() => handleArchive(selectedEmail.id)}
              >
                <Archive size={16} />
                Archive
              </button>

              {/* =============================================
                  DELETE
                  ============================================= */}

              <button
                type="button"
                onClick={() => handleDelete(selectedEmail.id)}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </aside>
        )}
      </section>

      {/* =====================================================
          COMPOSE
          ===================================================== */}

      {composeOpen && (
        <div className="send-email-modal">
          <div className="send-email-compose">
            {/* =================================================
                COMPOSE HEADER
                ================================================= */}

            <div className="send-email-compose-header">
              <div>
                <Mail size={18} />

                <strong>New Email</strong>
              </div>

              <button
                type="button"
                onClick={handleCloseCompose}
                aria-label="Close compose"
              >
                ×
              </button>
            </div>

            {/* =================================================
                COMPOSE BODY
                ================================================= */}

            <div className="send-email-compose-body">
              {/* ===============================================
                  RECIPIENTS
                  =============================================== */}

              <div className="send-email-recipient-field">
                <label>To</label>

                <div className="send-email-recipient-box">
                  {toEmails.map((email) => (
                    <span key={email} className="send-email-recipient-chip">
                      {email}

                      <button
                        type="button"
                        onClick={() => removeRecipient(email)}
                        aria-label={`Remove ${email}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <input
                    type="email"
                    value={recipientInput}
                    onChange={(event) => setRecipientInput(event.target.value)}
                    onKeyDown={handleRecipientKeyDown}
                    onBlur={addRecipient}
                    placeholder={
                      toEmails.length === 0
                        ? "customer@example.com"
                        : "Tambah email..."
                    }
                  />
                </div>

                <small>Tekan Enter atau koma untuk menambahkan penerima.</small>
              </div>

              {/* ===============================================
                  SUBJECT
                  =============================================== */}

              <label>
                Subject
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Subject email"
                />
              </label>

              {/* ===============================================
                  MESSAGE
                  =============================================== */}

              <label>
                Message
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tulis pesan..."
                  rows={10}
                />
              </label>
            </div>

            {/* =================================================
                COMPOSE FOOTER
                ================================================= */}

            <div className="send-email-compose-footer">
              <button
                type="button"
                className="send-email-cancel"
                onClick={handleCloseCompose}
                disabled={sending}
              >
                Cancel
              </button>

              <button
                type="button"
                className="send-email-send"
                onClick={handleSend}
                disabled={
                  sending ||
                  toEmails.length === 0 ||
                  !subject.trim() ||
                  !message.trim()
                }
              >
                {sending ? (
                  <>
                    <RefreshCw size={16} className="is-spinning" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default SendEmail;
