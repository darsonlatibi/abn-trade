import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileEdit,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import "./Drafts.css";

/* =========================================================
   TYPES
   ========================================================= */

interface DraftMail {
  id: number;
  recipient?: string;
  subject?: string;
  preview?: string;
  date: string;
  time: string;
  starred?: boolean;
  attachment?: boolean;
}

/* =========================================================
   DEMO DATA
   ========================================================= */

const initialDrafts: DraftMail[] = [
  {
    id: 1,
    recipient: "operations@abnfleet.com",
    subject: "Fleet Operation Report",
    preview: "Please review the attached fleet operation report before...",
    date: "23 Aug",
    time: "18:32",
    attachment: true,
  },

  {
    id: 2,
    recipient: "admin@abnfleet.com",
    subject: "System Configuration",
    preview: "Regarding the requested configuration changes, we have...",
    date: "23 Aug",
    time: "16:10",
    starred: true,
  },

  {
    id: 3,
    recipient: "sap@abnfleet.com",
    subject: "SAP Integration Review",
    preview: "I would like to discuss the latest synchronization result...",
    date: "22 Aug",
    time: "20:45",
    attachment: true,
  },

  {
    id: 4,
    subject: "Weekly Fleet Summary",
    preview: "The weekly fleet summary report contains the following...",
    date: "21 Aug",
    time: "14:22",
  },

  {
    id: 5,
    recipient: "helpdesk@abnfleet.com",
    subject: "Ticket Follow Up",
    preview: "Following up on the previously reported issue regarding...",
    date: "20 Aug",
    time: "09:15",
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

const Drafts: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftMail[]>(initialDrafts);

  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [page, setPage] = useState(1);

  const draftsPerPage = 6;

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredDrafts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return drafts;
    }

    return drafts.filter(
      (draft) =>
        draft.recipient?.toLowerCase().includes(keyword) ||
        draft.subject?.toLowerCase().includes(keyword) ||
        draft.preview?.toLowerCase().includes(keyword),
    );
  }, [drafts, search]);

  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDrafts.length / draftsPerPage),
  );

  const visibleDrafts = filteredDrafts.slice(
    (page - 1) * draftsPerPage,
    page * draftsPerPage,
  );

  /* =======================================================
     SELECTION
     ======================================================= */

  const allVisibleSelected =
    visibleDrafts.length > 0 &&
    visibleDrafts.every((draft) => selectedIds.includes(draft.id));

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
        current.filter((id) => !visibleDrafts.some((draft) => draft.id === id)),
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...visibleDrafts.map((draft) => draft.id)]),
    ]);
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    // Backend/API integration will be connected here.
    setPage(1);
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const deleteSelected = () => {
    setDrafts((current) =>
      current.filter((draft) => !selectedIds.includes(draft.id)),
    );

    setSelectedIds([]);
  };

  /* =======================================================
     DELETE SINGLE
     ======================================================= */

  const deleteDraft = (id: number) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id));

    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  /* =======================================================
     STAR
     ======================================================= */

  const toggleStar = (id: number) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              starred: !draft.starred,
            }
          : draft,
      ),
    );
  };

  /* =======================================================
     OPEN DRAFT
     ======================================================= */

  const openDraft = (id: number) => {
    // Navigation to Compose/Edit Draft will be added here.
    console.log("Open draft:", id);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="drafts-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="drafts-header">
        <div>
          <div className="drafts-title-row">
            <FileEdit size={22} strokeWidth={2} />

            <h1>Drafts</h1>

            {drafts.length > 0 && (
              <span className="drafts-count">{drafts.length}</span>
            )}
          </div>

          <p>Continue working on unfinished messages.</p>
        </div>
      </div>

      {/* ===================================================
          CARD
          =================================================== */}

      <section className="drafts-card">
        {/* =================================================
            TOOLBAR
            ================================================= */}

        <div className="drafts-toolbar">
          <div className="drafts-toolbar-left">
            <label className="drafts-checkbox">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
              />

              <span />
            </label>

            <button
              type="button"
              className="drafts-tool-button"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                className="drafts-tool-button danger"
                onClick={deleteSelected}
                title="Delete selected drafts"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>

          <div className="drafts-search">
            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search drafts..."
            />
          </div>
        </div>

        {/* =================================================
            LIST
            ================================================= */}

        <div className="drafts-list">
          {visibleDrafts.length === 0 ? (
            <div className="drafts-empty">
              <FileEdit size={42} />

              <h3>No drafts found</h3>

              <p>There are no draft messages matching your search.</p>
            </div>
          ) : (
            visibleDrafts.map((draft) => (
              <div
                key={draft.id}
                className="draft-message"
                onClick={() => openDraft(draft.id)}
              >
                {/* CHECKBOX */}

                <label
                  className="drafts-checkbox"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(draft.id)}
                    onChange={() => toggleSelect(draft.id)}
                  />

                  <span />
                </label>

                {/* STAR */}

                <button
                  type="button"
                  className={`draft-star ${draft.starred ? "active" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleStar(draft.id);
                  }}
                  title="Star"
                >
                  <Star
                    size={17}
                    fill={draft.starred ? "currentColor" : "none"}
                  />
                </button>

                {/* RECIPIENT */}

                <div className="draft-recipient">
                  {draft.recipient ? (
                    <span>To: {draft.recipient}</span>
                  ) : (
                    <span className="draft-no-recipient">No recipient</span>
                  )}
                </div>

                {/* CONTENT */}

                <div className="draft-content">
                  <strong>{draft.subject || "No subject"}</strong>

                  <span> — {draft.preview || "No message content"}</span>
                </div>

                {/* ATTACHMENT */}

                {draft.attachment && (
                  <Paperclip className="draft-attachment" size={16} />
                )}

                {/* DATE */}

                <div className="draft-date">
                  <span>{draft.date}</span>
                  <small>{draft.time}</small>
                </div>

                {/* MORE */}

                <button
                  type="button"
                  className="draft-more"
                  onClick={(event) => event.stopPropagation()}
                  title="More"
                >
                  <MoreHorizontal size={18} />
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  className="draft-delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteDraft(draft.id);
                  }}
                  title="Delete draft"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="drafts-footer">
          <span>
            {filteredDrafts.length === 0
              ? "0 drafts"
              : `${(page - 1) * draftsPerPage + 1}–${Math.min(
                  page * draftsPerPage,
                  filteredDrafts.length,
                )} of ${filteredDrafts.length}`}
          </span>

          <div className="drafts-pagination">
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
  );
};

export default Drafts;
