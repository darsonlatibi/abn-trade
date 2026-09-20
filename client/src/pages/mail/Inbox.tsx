import React, { useMemo, useState } from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import "./Inbox.css";

/* =========================================================
   TYPES
   ========================================================= */

interface MailItem {
  id: number;
  sender: string;
  email: string;
  subject: string;
  preview: string;
  date: string;
  time: string;
  unread?: boolean;
  starred?: boolean;
  attachment?: boolean;
}

/* =========================================================
   DEMO DATA
   ========================================================= */

const initialMails: MailItem[] = [
  {
    id: 1,
    sender: "ABN System",
    email: "system@abnfleet.com",
    subject: "Welcome to ABN Fleet System",
    preview: "Your ABN Fleet System account has been successfully configured.",
    date: "23 Aug",
    time: "19:42",
    unread: true,
    starred: true,
  },

  {
    id: 2,
    sender: "SAP Integration",
    email: "sap@abnfleet.com",
    subject: "SAP Integration Status",
    preview:
      "The latest SAP synchronization process has completed successfully.",
    date: "23 Aug",
    time: "17:18",
    unread: true,
  },

  {
    id: 3,
    sender: "Fleet Operations",
    email: "operations@abnfleet.com",
    subject: "Daily Fleet Report",
    preview: "The daily fleet operation report is now available for review.",
    date: "23 Aug",
    time: "15:30",
    attachment: true,
  },

  {
    id: 4,
    sender: "ABN Helpdesk",
    email: "helpdesk@abnfleet.com",
    subject: "Ticket #ABN-1042 Updated",
    preview:
      "Your helpdesk ticket has received a new response from our support team.",
    date: "22 Aug",
    time: "21:05",
    unread: true,
  },

  {
    id: 5,
    sender: "GPS Monitoring",
    email: "monitoring@abnfleet.com",
    subject: "Vehicle Offline Alert",
    preview: "Vehicle B 9123 AB has been offline for more than 15 minutes.",
    date: "22 Aug",
    time: "18:42",
    attachment: true,
  },

  {
    id: 6,
    sender: "ABN Administration",
    email: "admin@abnfleet.com",
    subject: "System Maintenance Notification",
    preview: "Scheduled maintenance will be performed on the ABN Fleet System.",
    date: "21 Aug",
    time: "10:20",
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

const Inbox: React.FC = () => {
  const [mails, setMails] = useState<MailItem[]>(initialMails);

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
        mail.sender.toLowerCase().includes(keyword) ||
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

  const visibleMails = filteredMails.slice(
    (page - 1) * mailsPerPage,
    page * mailsPerPage,
  );

  /* =======================================================
     HELPERS
     ======================================================= */

  const unreadCount = mails.filter((mail) => mail.unread).length;

  const allVisibleSelected =
    visibleMails.length > 0 &&
    visibleMails.every((mail) => selectedIds.includes(mail.id));

  /* =======================================================
     SELECT
     ======================================================= */

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
    // Backend/API integration will be added here.
    setPage(1);
  };

  /* =======================================================
     MARK READ
     ======================================================= */

  const markSelectedAsRead = () => {
    setMails((current) =>
      current.map((mail) =>
        selectedIds.includes(mail.id) ? { ...mail, unread: false } : mail,
      ),
    );

    setSelectedIds([]);
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const deleteSelected = () => {
    setMails((current) =>
      current.filter((mail) => !selectedIds.includes(mail.id)),
    );

    setSelectedIds([]);
  };

  /* =======================================================
     STAR
     ======================================================= */

  const toggleStar = (id: number) => {
    setMails((current) =>
      current.map((mail) =>
        mail.id === id ? { ...mail, starred: !mail.starred } : mail,
      ),
    );
  };

  /* =======================================================
     OPEN MAIL
     ======================================================= */

  const openMail = (id: number) => {
    setMails((current) =>
      current.map((mail) =>
        mail.id === id ? { ...mail, unread: false } : mail,
      ),
    );

    // Navigation to Mail detail can be added later.
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="inbox-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="inbox-header">
        <div>
          <div className="inbox-title-row">
            <Mail size={22} strokeWidth={2} />

            <h1>Inbox</h1>

            {unreadCount > 0 && (
              <span className="inbox-unread-badge">{unreadCount}</span>
            )}
          </div>

          <p>Manage incoming messages and system notifications.</p>
        </div>
      </div>

      {/* =====================================================
          MAIL LAYOUT
          ===================================================== */}

      <div className="inbox-layout">
        {/* ===================================================
            SIDEBAR
            =================================================== */}

        <aside className="inbox-sidebar">
          <button className="inbox-compose-button">
            <Mail size={17} />
            Compose
          </button>

          <nav className="inbox-folder-nav">
            <button className="inbox-folder active">
              <Mail size={17} />

              <span>Inbox</span>

              {unreadCount > 0 && <strong>{unreadCount}</strong>}
            </button>

            <button className="inbox-folder">
              <Star size={17} />

              <span>Starred</span>
            </button>

            <button className="inbox-folder">
              <MailOpen size={17} />

              <span>Sent</span>
            </button>

            <button className="inbox-folder">
              <Archive size={17} />

              <span>Archive</span>
            </button>

            <button className="inbox-folder">
              <Trash2 size={17} />

              <span>Trash</span>
            </button>
          </nav>
        </aside>

        {/* ===================================================
            MAIN
            =================================================== */}

        <section className="inbox-main">
          {/* =================================================
              TOOLBAR
              ================================================= */}

          <div className="inbox-toolbar">
            <div className="inbox-toolbar-left">
              <label className="inbox-checkbox">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                />

                <span />
              </label>

              <button
                type="button"
                className="inbox-tool-button"
                onClick={handleRefresh}
                title="Refresh"
              >
                <RefreshCw size={17} />
              </button>

              {selectedIds.length > 0 && (
                <>
                  <button
                    type="button"
                    className="inbox-tool-button"
                    onClick={markSelectedAsRead}
                    title="Mark as read"
                  >
                    <MailOpen size={17} />
                  </button>

                  <button
                    type="button"
                    className="inbox-tool-button danger"
                    onClick={deleteSelected}
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>
                </>
              )}
            </div>

            <div className="inbox-search">
              <Search size={17} />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search mail..."
              />
            </div>
          </div>

          {/* =================================================
              MESSAGE LIST
              ================================================= */}

          <div className="inbox-list">
            {visibleMails.length === 0 ? (
              <div className="inbox-empty">
                <MailOpen size={42} />

                <h3>No messages found</h3>

                <p>There are no messages matching your search.</p>
              </div>
            ) : (
              visibleMails.map((mail) => (
                <div
                  key={mail.id}
                  className={`inbox-message ${mail.unread ? "unread" : ""}`}
                  onClick={() => openMail(mail.id)}
                >
                  <label
                    className="inbox-checkbox"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(mail.id)}
                      onChange={() => toggleSelect(mail.id)}
                    />

                    <span />
                  </label>

                  <button
                    type="button"
                    className={`inbox-star ${mail.starred ? "active" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleStar(mail.id);
                    }}
                    title="Star"
                  >
                    <Star
                      size={17}
                      fill={mail.starred ? "currentColor" : "none"}
                    />
                  </button>

                  <div className="inbox-sender">
                    <span>{mail.sender}</span>
                  </div>

                  <div className="inbox-content">
                    <strong>{mail.subject}</strong>

                    <span> — {mail.preview}</span>
                  </div>

                  {mail.attachment && (
                    <Paperclip className="inbox-attachment" size={16} />
                  )}

                  <div className="inbox-date">
                    <span>{mail.date}</span>
                    <small>{mail.time}</small>
                  </div>

                  <button
                    type="button"
                    className="inbox-more"
                    onClick={(event) => event.stopPropagation()}
                    title="More"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* =================================================
              FOOTER / PAGINATION
              ================================================= */}

          <div className="inbox-footer">
            <span>
              {filteredMails.length === 0
                ? "0 messages"
                : `${(page - 1) * mailsPerPage + 1}–${Math.min(
                    page * mailsPerPage,
                    filteredMails.length,
                  )} of ${filteredMails.length}`}
            </span>

            <div className="inbox-pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inbox;
