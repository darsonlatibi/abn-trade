/* =========================================================
   ABN FLEET SYSTEM
   HELPDESK MESSAGE
   ========================================================= */

import { useEffect, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Edit3,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../stores/store";

import {
  clearHelpdeskMessageError,
  clearHelpdeskMessageSuccess,
  clearSelectedHelpdeskMessage,
  createHelpdeskMessage,
  deleteHelpdeskMessage,
  fetchHelpdeskMessageById,
  fetchMessagesByTicket,
  selectHelpdeskMessageCount,
  selectHelpdeskMessageCountLoading,
  selectHelpdeskMessageDetailLoading,
  selectHelpdeskMessageListLoading,
  selectHelpdeskMessageLoadingState,
  selectHelpdeskMessageSliceError,
  selectHelpdeskMessageSuccess,
  selectHelpdeskMessages,
  selectSelectedHelpdeskMessage,
  updateHelpdeskMessage,
} from "../../features/helpdesk/helpdeskMessageSlice";

import "./HelpdeskMessage.css";

/* =========================================================
   TYPES
   ========================================================= */

interface HelpdeskMessageUser {
  id: number;
  username?: string;
  email?: string;
  full_name?: string;
  role?: string;
}

/* =========================================================
   HELPERS
   ========================================================= */

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUserName = (user?: HelpdeskMessageUser) => {
  return (
    user?.full_name ||
    user?.username ||
    user?.email ||
    `User #${user?.id ?? "-"}`
  );
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function HelpdeskMessage() {
  const dispatch = useDispatch<AppDispatch>();

  /* =======================================================
     REDUX
     ======================================================= */

  const messages = useSelector((state: RootState) =>
    selectHelpdeskMessages(state),
  );

  const selectedMessage = useSelector((state: RootState) =>
    selectSelectedHelpdeskMessage(state),
  );

  const messageCount = useSelector((state: RootState) =>
    selectHelpdeskMessageCount(state),
  );

  const loading = useSelector((state: RootState) =>
    selectHelpdeskMessageLoadingState(state),
  );

  const listLoading = useSelector((state: RootState) =>
    selectHelpdeskMessageListLoading(state),
  );

  const detailLoading = useSelector((state: RootState) =>
    selectHelpdeskMessageDetailLoading(state),
  );

  const countLoading = useSelector((state: RootState) =>
    selectHelpdeskMessageCountLoading(state),
  );

  const error = useSelector((state: RootState) =>
    selectHelpdeskMessageSliceError(state),
  );

  const successMessage = useSelector((state: RootState) =>
    selectHelpdeskMessageSuccess(state),
  );

  /* =======================================================
     TICKET ID
     ======================================================= */

  const [ticketId, setTicketId] = useState<number | null>(null);

  /* =======================================================
     LOCAL STATE
     ======================================================= */

  const [message, setMessage] = useState("");

  const [isInternal, setIsInternal] = useState(false);

  const [showCreate, setShowCreate] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [editMessage, setEditMessage] = useState("");

  const [editInternal, setEditInternal] = useState(false);

  /* =======================================================
     READ TICKET ID FROM URL
     ======================================================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const id = Number(params.get("ticketId"));

    if (Number.isInteger(id) && id > 0) {
      setTicketId(id);
    }
  }, []);

  /* =======================================================
     LOAD MESSAGES
     ======================================================= */

  useEffect(() => {
    if (!ticketId) return;

    dispatch(fetchMessagesByTicket(ticketId));
  }, [dispatch, ticketId]);

  /* =======================================================
     AUTO CLEAR SUCCESS
     ======================================================= */

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => {
      dispatch(clearHelpdeskMessageSuccess());
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [successMessage, dispatch]);

  /* =======================================================
     CREATE MESSAGE
     ======================================================= */

  const handleCreateMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!ticketId) return;

    if (!message.trim()) return;

    const result = await dispatch(
      createHelpdeskMessage({
        ticketId,
        message: message.trim(),
        is_internal: isInternal,
      }),
    );

    if (createHelpdeskMessage.fulfilled.match(result)) {
      setMessage("");
      setIsInternal(false);
      setShowCreate(false);

      dispatch(fetchMessagesByTicket(ticketId));
    }
  };

  /* =======================================================
     SELECT MESSAGE
     ======================================================= */

  const handleSelectMessage = (id: number) => {
    dispatch(fetchHelpdeskMessageById(id));
  };

  /* =======================================================
     EDIT
     ======================================================= */

  const handleOpenEdit = () => {
    if (!selectedMessage) return;

    setEditMessage(selectedMessage.message);

    setEditInternal(selectedMessage.is_internal);

    setShowEdit(true);
  };

  /* =======================================================
     UPDATE
     ======================================================= */

  const handleUpdateMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedMessage) return;

    if (!editMessage.trim()) return;

    const result = await dispatch(
      updateHelpdeskMessage({
        id: selectedMessage.id,
        message: editMessage.trim(),
        is_internal: editInternal,
      }),
    );

    if (updateHelpdeskMessage.fulfilled.match(result)) {
      setShowEdit(false);
    }
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    const confirmed = window.confirm(`Hapus message #${selectedMessage.id}?`);

    if (!confirmed) return;

    const result = await dispatch(deleteHelpdeskMessage(selectedMessage.id));

    if (deleteHelpdeskMessage.fulfilled.match(result)) {
      dispatch(clearSelectedHelpdeskMessage());

      if (ticketId) {
        dispatch(fetchMessagesByTicket(ticketId));
      }
    }
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    if (!ticketId) return;

    dispatch(fetchMessagesByTicket(ticketId));
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="helpdesk-message-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="helpdesk-message-header-main">
        <div className="helpdesk-message-title">
          <div className="helpdesk-message-title-icon">
            <MessageSquare size={24} />
          </div>

          <div>
            <h1>Helpdesk Messages</h1>

            <p>Ticket conversation & support communication</p>
          </div>
        </div>

        <div className="helpdesk-message-header-actions">
          <button
            type="button"
            className="hm-btn hm-btn-secondary"
            onClick={handleRefresh}
            disabled={listLoading || !ticketId}
          >
            <RefreshCw size={16} className={listLoading ? "hm-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="hm-btn hm-btn-primary"
            onClick={() => setShowCreate(true)}
            disabled={!ticketId}
          >
            <Plus size={17} />
            New Message
          </button>
        </div>
      </div>

      {/* ===================================================
          ALERT
          =================================================== */}

      {error && (
        <div className="hm-alert hm-alert-error">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => dispatch(clearHelpdeskMessageError())}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="hm-alert hm-alert-success">
          <CheckCircle2 size={18} />

          <span>{successMessage}</span>
        </div>
      )}

      {/* ===================================================
          TICKET INFO
          =================================================== */}

      <div className="hm-ticket-info">
        <div>
          <span>Ticket</span>

          <strong>{ticketId ? `#${ticketId}` : "No ticket selected"}</strong>
        </div>

        <div>
          <span>Total Messages</span>

          <strong>
            {countLoading ? (
              <RefreshCw size={15} className="hm-spin" />
            ) : (
              messageCount
            )}
          </strong>
        </div>
      </div>

      {/* ===================================================
          LAYOUT
          =================================================== */}

      <div className="hm-layout">
        {/* =================================================
            MESSAGE LIST
            ================================================= */}

        <section className="hm-list-panel">
          <div className="hm-panel-header">
            <div>
              <h2>Messages</h2>

              <span>
                {messages.length} conversation
                {messages.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="hm-message-list">
            {!ticketId ? (
              <div className="hm-empty">
                <MessageSquare size={34} />

                <strong>No ticket selected</strong>

                <span>Buka halaman dengan parameter ticketId.</span>
              </div>
            ) : listLoading && messages.length === 0 ? (
              <div className="hm-empty">
                <RefreshCw size={27} className="hm-spin" />

                <span>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="hm-empty">
                <MessageSquare size={34} />

                <strong>Belum ada message</strong>

                <span>Belum ada percakapan pada ticket ini.</span>
              </div>
            ) : (
              messages.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`hm-message-item ${
                    selectedMessage?.id === item.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectMessage(item.id)}
                >
                  <div className="hm-message-item-top">
                    <strong>#{item.id}</strong>

                    {item.is_internal && (
                      <span className="hm-internal-badge">INTERNAL</span>
                    )}
                  </div>

                  <div className="hm-message-preview">{item.message}</div>

                  <div className="hm-message-item-bottom">
                    <span>
                      <UserRound size={13} />

                      {getUserName(item.sender)}
                    </span>

                    <time>
                      <Clock3 size={13} />

                      {formatDate(item.created_at)}
                    </time>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* =================================================
            DETAIL
            ================================================= */}

        <section className="hm-detail-panel">
          {!selectedMessage ? (
            <div className="hm-no-selection">
              <MessageSquare size={48} />

              <h2>Select a message</h2>

              <p>Pilih message dari daftar untuk melihat detail.</p>
            </div>
          ) : detailLoading ? (
            <div className="hm-empty">
              <RefreshCw size={28} className="hm-spin" />

              <span>Loading message...</span>
            </div>
          ) : (
            <>
              {/* =========================================
                  DETAIL HEADER
                  ========================================= */}

              <div className="hm-detail-header">
                <div>
                  <div className="hm-detail-id">
                    MESSAGE #{selectedMessage.id}
                  </div>

                  <h2>Ticket #{selectedMessage.ticket_id}</h2>

                  <span>Created {formatDate(selectedMessage.created_at)}</span>
                </div>

                <button
                  type="button"
                  className="hm-icon-btn"
                  title="Close"
                  onClick={() => dispatch(clearSelectedHelpdeskMessage())}
                >
                  <X size={19} />
                </button>
              </div>

              {/* =========================================
                  META
                  ========================================= */}

              <div className="hm-meta-grid">
                <div className="hm-meta-card">
                  <span>Sender</span>

                  <strong>{getUserName(selectedMessage.sender)}</strong>
                </div>

                <div className="hm-meta-card">
                  <span>Message ID</span>

                  <strong>#{selectedMessage.id}</strong>
                </div>

                <div className="hm-meta-card">
                  <span>Type</span>

                  <strong>
                    {selectedMessage.is_internal
                      ? "Internal Note"
                      : "Public Reply"}
                  </strong>
                </div>
              </div>

              {/* =========================================
                  MESSAGE BODY
                  ========================================= */}

              <div className="hm-content-card">
                <div className="hm-section-title">
                  <MessageSquare size={17} />

                  <span>Message</span>
                </div>

                <div
                  className={`hm-message-content ${
                    selectedMessage.is_internal ? "internal" : ""
                  }`}
                >
                  {selectedMessage.message}
                </div>

                {selectedMessage.attachment_path && (
                  <div className="hm-attachment">
                    <strong>Attachment</strong>

                    <span>{selectedMessage.attachment_path}</span>
                  </div>
                )}
              </div>

              {/* =========================================
                  ACTIONS
                  ========================================= */}

              <div className="hm-detail-actions">
                <button
                  type="button"
                  className="hm-btn hm-btn-secondary"
                  onClick={handleOpenEdit}
                >
                  <Edit3 size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  className="hm-btn hm-btn-danger"
                  onClick={handleDeleteMessage}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ===================================================
          CREATE MODAL
          =================================================== */}

      {showCreate && (
        <div
          className="hm-modal-backdrop"
          onMouseDown={() => setShowCreate(false)}
        >
          <div
            className="hm-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="hm-modal-header">
              <div>
                <h2>New Message</h2>

                <p>Kirim message ke ticket #{ticketId}.</p>
              </div>

              <button
                type="button"
                className="hm-icon-btn"
                onClick={() => setShowCreate(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form className="hm-form" onSubmit={handleCreateMessage}>
              <label>
                Message
                <textarea
                  rows={7}
                  placeholder="Tulis message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
              </label>

              <label className="hm-checkbox">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(event) => setIsInternal(event.target.checked)}
                />
                Internal note
              </label>

              <div className="hm-modal-actions">
                <button
                  type="button"
                  className="hm-btn hm-btn-secondary"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hm-btn hm-btn-primary"
                  disabled={loading || !message.trim()}
                >
                  <Send size={16} />

                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          EDIT MODAL
          =================================================== */}

      {showEdit && selectedMessage && (
        <div
          className="hm-modal-backdrop"
          onMouseDown={() => setShowEdit(false)}
        >
          <div
            className="hm-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="hm-modal-header">
              <div>
                <h2>Edit Message</h2>

                <p>Update message #{selectedMessage.id}.</p>
              </div>

              <button
                type="button"
                className="hm-icon-btn"
                onClick={() => setShowEdit(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form className="hm-form" onSubmit={handleUpdateMessage}>
              <label>
                Message
                <textarea
                  rows={7}
                  value={editMessage}
                  onChange={(event) => setEditMessage(event.target.value)}
                  required
                />
              </label>

              <label className="hm-checkbox">
                <input
                  type="checkbox"
                  checked={editInternal}
                  onChange={(event) => setEditInternal(event.target.checked)}
                />
                Internal note
              </label>

              <div className="hm-modal-actions">
                <button
                  type="button"
                  className="hm-btn hm-btn-secondary"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hm-btn hm-btn-primary"
                  disabled={loading || !editMessage.trim()}
                >
                  <CheckCircle2 size={16} />

                  {loading ? "Updating..." : "Update Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
