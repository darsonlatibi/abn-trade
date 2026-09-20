import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MailOpen,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";

import "./Sent.css";

/* =========================================================
   TYPES
   ========================================================= */

interface SentMail {
  id: number;
  recipient: string;
  email: string;
  subject: string;
  preview: string;
  date: string;
  time: string;
  starred?: boolean;
  attachment?: boolean;
}

/* =========================================================
   DEMO DATA
   ========================================================= */

const initialSentMails: SentMail[] = [
  {
    id: 1,
    recipient: "Fleet Operations",
    email: "operations@abnfleet.com",
    subject: "Daily Fleet Report",
    preview:
      "Please find attached the latest fleet operation report for review.",
    date: "23 Aug",
    time: "16:42",
    attachment: true,
  },

  {
    id: 2,
    recipient: "ABN Administration",
    email: "admin@abnfleet.com",
    subject: "System Configuration Update",
    preview: "The requested system configuration changes have been completed.",
    date: "23 Aug",
    time: "14:20",
    starred: true,
  },

  {
    id: 3,
    recipient: "SAP Integration",
    email: "sap@abnfleet.com",
    subject: "SAP Synchronization Review",
    preview: "Please review the latest SAP synchronization results.",
    date: "22 Aug",
    time: "18:15",
    attachment: true,
  },

  {
    id: 4,
    recipient: "ABN Helpdesk",
    email: "helpdesk@abnfleet.com",
    subject: "Ticket #ABN-1042",
    preview:
      "Additional information regarding the reported issue is included below.",
    date: "22 Aug",
    time: "11:35",
  },

  {
    id: 5,
    recipient: "GPS Monitoring",
    email: "monitoring@abnfleet.com",
    subject: "Vehicle Tracking Review",
    preview: "Please check the tracking status of the affected vehicles.",
    date: "21 Aug",
    time: "16:10",
    attachment: true,
  },

  {
    id: 6,
    recipient: "Fleet Manager",
    email: "fleet.manager@abnfleet.com",
    subject: "Weekly Fleet Summary",
    preview: "The weekly fleet performance summary is ready for review.",
    date: "20 Aug",
    time: "09:25",
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

const Sent: React.FC = () => {
  const [mails, setMails] = useState<SentMail[]>(initialSentMails);

  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [page, setPage] = useState(1);

  const mailsPerPage = 6;

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredMails = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return mails;
    }

    return mails.filter(
      (mail) =>
        mail.recipient.toLowerCase().includes(keyword) ||
        mail.email.toLowerCase().includes(keyword) ||
        mail.subject.toLowerCase().includes(keyword) ||
        mail.preview.toLowerCase().includes(keyword),
    );
  }, [mails, search]);

  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMails.length / mailsPerPage),
  );

  const currentPage = Math.min(page, totalPages);

  const visibleMails = filteredMails.slice(
    (currentPage - 1) * mailsPerPage,
    currentPage * mailsPerPage,
  );

  /* =======================================================
     SELECTION
     ======================================================= */

  const allVisibleSelected =
    visibleMails.length > 0 &&
    visibleMails.every((mail) => selectedIds.includes(mail.id));

  const toggleSelect = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleMails.some((mail) => mail.id === id)),
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...visibleMails.map((mail) => mail.id)]),
    ]);
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    // Future:
    // GET /api/mail/sent

    setPage(1);
    setSelectedIds([]);
  };

  /* =======================================================
     DELETE SELECTED
     ======================================================= */

  const deleteSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected message${
        selectedIds.length > 1 ? "s" : ""
      }?`,
    );

    if (!confirmed) {
      return;
    }

    setMails((current) =>
      current.filter((mail) => !selectedIds.includes(mail.id)),
    );

    setSelectedIds([]);

    setPage((current) => Math.max(1, current));
  };

  /* =======================================================
     STAR
     ======================================================= */

  const toggleStar = (id: number) => {
    setMails((current) =>
      current.map((mail) =>
        mail.id === id
          ? {
              ...mail,
              starred: !mail.starred,
            }
          : mail,
      ),
    );
  };

  /* =======================================================
     OPEN MAIL
     ======================================================= */

  const openMail = (id: number) => {
    // Future:
    // navigate(`/mail/sent/${id}`);

    console.log("Open sent mail:", id);
  };

  /* =======================================================
     MORE
     ======================================================= */

  const handleMore = (id: number) => {
    console.log("More actions for sent mail:", id);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="sent-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="sent-header">
        <div>
          <div className="sent-title-row">
            <Send size={22} strokeWidth={2} />

            <h1>Sent</h1>

            {mails.length > 0 && (
              <span className="sent-count">{mails.length}</span>
            )}
          </div>

          <p>View messages that have been sent from your account.</p>
        </div>
      </div>

      {/* ===================================================
          CARD
          =================================================== */}

      <section className="sent-card">
        {/* =================================================
            TOOLBAR
            ================================================= */}

        <div className="sent-toolbar">
          <div className="sent-toolbar-left">
            <label className="sent-checkbox">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
              />

              <span />
            </label>

            <button
              type="button"
              className="sent-tool-button"
              onClick={handleRefresh}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw size={17} />
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                className="sent-tool-button danger"
                onClick={deleteSelected}
                title="Delete selected"
                aria-label="Delete selected"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>

          <div className="sent-search">
            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search sent mail..."
              aria-label="Search sent mail"
            />
          </div>
        </div>

        {/* =================================================
            LIST
            ================================================= */}

        <div className="sent-list">
          {visibleMails.length === 0 ? (
            <div className="sent-empty">
              <MailOpen size={42} />

              <h3>No sent messages found</h3>

              <p>There are no sent messages matching your search.</p>
            </div>
          ) : (
            visibleMails.map((mail) => (
              <div
                key={mail.id}
                className="sent-message"
                onClick={() => openMail(mail.id)}
              >
                {/* CHECKBOX */}

                <label
                  className="sent-checkbox"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(mail.id)}
                    onChange={() => toggleSelect(mail.id)}
                  />

                  <span />
                </label>

                {/* STAR */}

                <button
                  type="button"
                  className={`sent-star ${mail.starred ? "active" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleStar(mail.id);
                  }}
                  title="Star"
                  aria-label="Star message"
                >
                  <Star
                    size={17}
                    fill={mail.starred ? "currentColor" : "none"}
                  />
                </button>

                {/* RECIPIENT */}

                <div className="sent-recipient" title={mail.email}>
                  <span>To: {mail.recipient}</span>
                </div>

                {/* CONTENT */}

                <div className="sent-content">
                  <strong>{mail.subject}</strong>

                  <span> — {mail.preview}</span>
                </div>

                {/* ATTACHMENT */}

                {mail.attachment && (
                  <Paperclip className="sent-attachment" size={16} />
                )}

                {/* DATE */}

                <div className="sent-date">
                  <span>{mail.date}</span>

                  <small>{mail.time}</small>
                </div>

                {/* MORE */}

                <button
                  type="button"
                  className="sent-more"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleMore(mail.id);
                  }}
                  title="More"
                  aria-label="More actions"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="sent-footer">
          <span>
            {filteredMails.length === 0
              ? "0 messages"
              : `${(currentPage - 1) * mailsPerPage + 1}–${Math.min(
                  currentPage * mailsPerPage,
                  filteredMails.length,
                )} of ${filteredMails.length}`}
          </span>

          <div className="sent-pagination">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            <span>
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sent;
