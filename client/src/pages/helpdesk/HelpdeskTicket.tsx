/* =========================================================
   ABN FLEET SYSTEM
   HELPDESK TICKET
   ========================================================= */

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Filter,
  LifeBuoy,
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
  addMessage,
  clearHelpdeskError,
  clearHelpdeskSuccess,
  clearSelectedTicket,
  createTicket,
  deleteTicket,
  fetchTicketById,
  fetchTickets,
  selectHelpdeskError,
  selectHelpdeskLoading,
  selectHelpdeskMessageError,
  selectHelpdeskMessageLoading,
  selectHelpdeskSuccessMessage,
  selectHelpdeskTicketLoading,
  selectHelpdeskTickets,
  selectSelectedHelpdeskTicket,
  updateTicket,
} from "../../features/helpdesk/helpdeskTicketSlice";

import "./HelpdeskTicket.css";

/* =========================================================
   TYPES
   ========================================================= */

type FilterStatus = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

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

const getUserName = (user?: {
  full_name?: string;
  username?: string;
  email?: string;
}) => {
  return user?.full_name || user?.username || user?.email || "User";
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function HelpdeskTicket() {
  const dispatch = useDispatch<AppDispatch>();

  /* =======================================================
     REDUX
     ======================================================= */

  const tickets = useSelector((state: RootState) =>
    selectHelpdeskTickets(state),
  );

  const selectedTicket = useSelector((state: RootState) =>
    selectSelectedHelpdeskTicket(state),
  );

  const loading = useSelector((state: RootState) =>
    selectHelpdeskLoading(state),
  );

  const ticketLoading = useSelector((state: RootState) =>
    selectHelpdeskTicketLoading(state),
  );

  const messageLoading = useSelector((state: RootState) =>
    selectHelpdeskMessageLoading(state),
  );

  const error = useSelector((state: RootState) => selectHelpdeskError(state));

  const messageError = useSelector((state: RootState) =>
    selectHelpdeskMessageError(state),
  );

  const successMessage = useSelector((state: RootState) =>
    selectHelpdeskSuccessMessage(state),
  );

  /* =======================================================
     LOCAL STATE
     ======================================================= */

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");

  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [subject, setSubject] = useState("");

  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState<Priority>("MEDIUM");

  const [reply, setReply] = useState("");

  const [internalMessage, setInternalMessage] = useState(false);

  const [assignedTo, setAssignedTo] = useState<string>("");

  const [status, setStatus] = useState<string>("");

  const [ticketPriority, setTicketPriority] = useState<string>("");

  /* =======================================================
     LOAD TICKETS
     ======================================================= */

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  /* =======================================================
     SELECTED TICKET SYNC
     ======================================================= */

  useEffect(() => {
    if (!selectedTicket) {
      setStatus("");
      setTicketPriority("");
      setAssignedTo("");
      return;
    }

    setStatus(selectedTicket.status || "");

    setTicketPriority(selectedTicket.priority || "");

    setAssignedTo(
      selectedTicket.assigned_to ? String(selectedTicket.assigned_to) : "",
    );
  }, [selectedTicket]);

  /* =======================================================
     AUTO CLEAR SUCCESS
     ======================================================= */

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => {
      dispatch(clearHelpdeskSuccess());
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [successMessage, dispatch]);

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const statusMatch =
        statusFilter === "ALL" || ticket.status?.toUpperCase() === statusFilter;

      if (!statusMatch) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        ticket.subject?.toLowerCase().includes(keyword) ||
        ticket.description?.toLowerCase().includes(keyword) ||
        String(ticket.id).includes(keyword)
      );
    });
  }, [tickets, statusFilter, search]);

  /* =======================================================
     CREATE TICKET
     ======================================================= */

  const handleCreateTicket = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!subject.trim()) return;

    if (!description.trim()) return;

    const result = await dispatch(
      createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority,
      }),
    );

    if (createTicket.fulfilled.match(result)) {
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      setShowCreate(false);
    }
  };

  /* =======================================================
     OPEN TICKET
     ======================================================= */

  const handleOpenTicket = (id: number) => {
    dispatch(fetchTicketById(id));
  };

  /* =======================================================
     CLOSE DETAIL
     ======================================================= */

  const handleCloseDetail = () => {
    dispatch(clearSelectedTicket());
  };

  /* =======================================================
     UPDATE TICKET
     ======================================================= */

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    await dispatch(
      updateTicket({
        id: selectedTicket.id,
        status,
        priority: ticketPriority,
        assigned_to: assignedTo ? Number(assignedTo) : null,
      }),
    );
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;

    const confirmed = window.confirm(`Hapus ticket #${selectedTicket.id}?`);

    if (!confirmed) return;

    await dispatch(deleteTicket(selectedTicket.id));
  };

  /* =======================================================
     SEND MESSAGE
     ======================================================= */

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedTicket) return;

    if (!reply.trim()) return;

    const result = await dispatch(
      addMessage({
        ticketId: selectedTicket.id,
        message: reply.trim(),
        is_internal: internalMessage,
      }),
    );

    if (addMessage.fulfilled.match(result)) {
      setReply("");
      setInternalMessage(false);
    }
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="helpdesk-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="helpdesk-header">
        <div className="helpdesk-title">
          <div className="helpdesk-title-icon">
            <LifeBuoy size={24} />
          </div>

          <div>
            <h1>Helpdesk</h1>

            <p>Customer support & technical assistance</p>
          </div>
        </div>

        <div className="helpdesk-header-actions">
          <button
            type="button"
            className="helpdesk-btn helpdesk-btn-secondary"
            onClick={() => dispatch(fetchTickets())}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "helpdesk-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="helpdesk-btn helpdesk-btn-primary"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={17} />
            New Ticket
          </button>
        </div>
      </div>

      {/* ===================================================
          ALERT
          =================================================== */}

      {error && (
        <div className="helpdesk-alert helpdesk-alert-error">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button type="button" onClick={() => dispatch(clearHelpdeskError())}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="helpdesk-alert helpdesk-alert-success">
          <CheckCircle2 size={18} />

          <span>{successMessage}</span>
        </div>
      )}

      {/* ===================================================
          TOOLBAR
          =================================================== */}

      <div className="helpdesk-toolbar">
        <div className="helpdesk-search">
          <Filter size={17} />

          <input
            type="text"
            placeholder="Search ticket..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="helpdesk-filters">
          {(
            [
              "ALL",
              "OPEN",
              "IN_PROGRESS",
              "RESOLVED",
              "CLOSED",
            ] as FilterStatus[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              className={statusFilter === item ? "active" : ""}
              onClick={() => setStatusFilter(item)}
            >
              {item === "ALL" ? "All" : item.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================
          MAIN CONTENT
          =================================================== */}

      <div className="helpdesk-layout">
        {/* =================================================
            TICKET LIST
            ================================================= */}

        <section className="helpdesk-ticket-panel">
          <div className="helpdesk-panel-header">
            <div>
              <h2>Tickets</h2>

              <span>
                {filteredTickets.length} ticket
                {filteredTickets.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="helpdesk-ticket-list">
            {loading && tickets.length === 0 ? (
              <div className="helpdesk-empty">
                <RefreshCw size={24} className="helpdesk-spin" />

                <span>Loading tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="helpdesk-empty">
                <LifeBuoy size={32} />

                <strong>No tickets found</strong>

                <span>Belum ada ticket yang sesuai.</span>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <button
                  type="button"
                  key={ticket.id}
                  className={`helpdesk-ticket-item ${
                    selectedTicket?.id === ticket.id ? "selected" : ""
                  }`}
                  onClick={() => handleOpenTicket(ticket.id)}
                >
                  <div className="helpdesk-ticket-top">
                    <strong>#{ticket.id}</strong>

                    <span
                      className={`helpdesk-priority priority-${ticket.priority?.toLowerCase()}`}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <h3>{ticket.subject}</h3>

                  <p>{ticket.description}</p>

                  <div className="helpdesk-ticket-bottom">
                    <span
                      className={`helpdesk-status status-${ticket.status?.toLowerCase()}`}
                    >
                      {ticket.status?.replace("_", " ")}
                    </span>

                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* =================================================
            DETAIL
            ================================================= */}

        <section className="helpdesk-detail-panel">
          {!selectedTicket ? (
            <div className="helpdesk-no-selection">
              <LifeBuoy size={48} />

              <h2>Select a ticket</h2>

              <p>
                Pilih ticket dari daftar untuk melihat detail dan percakapan.
              </p>
            </div>
          ) : ticketLoading ? (
            <div className="helpdesk-empty">
              <RefreshCw size={28} className="helpdesk-spin" />

              <span>Loading ticket...</span>
            </div>
          ) : (
            <>
              {/* =========================================
                  DETAIL HEADER
                  ========================================= */}

              <div className="helpdesk-detail-header">
                <div>
                  <div className="helpdesk-detail-id">
                    TICKET #{selectedTicket.id}
                  </div>

                  <h2>{selectedTicket.subject}</h2>

                  <span>Created {formatDate(selectedTicket.created_at)}</span>
                </div>

                <button
                  type="button"
                  className="helpdesk-icon-btn"
                  onClick={handleCloseDetail}
                  title="Close"
                >
                  <X size={19} />
                </button>
              </div>

              {/* =========================================
                  META
                  ========================================= */}

              <div className="helpdesk-meta-grid">
                <div className="helpdesk-meta-card">
                  <span>Status</span>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="OPEN">OPEN</option>

                    <option value="IN_PROGRESS">IN PROGRESS</option>

                    <option value="RESOLVED">RESOLVED</option>

                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="helpdesk-meta-card">
                  <span>Priority</span>

                  <select
                    value={ticketPriority}
                    onChange={(event) => setTicketPriority(event.target.value)}
                  >
                    <option value="LOW">LOW</option>

                    <option value="MEDIUM">MEDIUM</option>

                    <option value="HIGH">HIGH</option>

                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="helpdesk-meta-card">
                  <span>Assigned To</span>

                  <div className="helpdesk-assigned-input">
                    <UserRound size={15} />

                    <input
                      type="number"
                      placeholder="User ID"
                      value={assignedTo}
                      onChange={(event) => setAssignedTo(event.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="helpdesk-btn helpdesk-btn-primary helpdesk-update-btn"
                  onClick={handleUpdateTicket}
                  disabled={loading}
                >
                  <CheckCircle2 size={16} />
                  Update
                </button>
              </div>

              {/* =========================================
                  DESCRIPTION
                  ========================================= */}

              <div className="helpdesk-description">
                <div className="helpdesk-section-title">
                  <AlertCircle size={17} />

                  <span>Problem Description</span>
                </div>

                <p>{selectedTicket.description}</p>

                <div className="helpdesk-requester">
                  <UserRound size={16} />

                  <span>Requester:</span>

                  <strong>{getUserName(selectedTicket.user)}</strong>
                </div>
              </div>

              {/* =========================================
                  MESSAGES
                  ========================================= */}

              <div className="helpdesk-conversation">
                <div className="helpdesk-section-title">
                  <MessageSquare size={17} />

                  <span>Conversation</span>

                  <small>{selectedTicket.messages?.length || 0} messages</small>
                </div>

                <div className="helpdesk-messages">
                  {!selectedTicket.messages ||
                  selectedTicket.messages.length === 0 ? (
                    <div className="helpdesk-empty">
                      <MessageSquare size={28} />

                      <span>Belum ada message.</span>
                    </div>
                  ) : (
                    selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`helpdesk-message ${
                          message.is_internal ? "internal" : ""
                        }`}
                      >
                        <div className="helpdesk-message-avatar">
                          <UserRound size={17} />
                        </div>

                        <div className="helpdesk-message-body">
                          <div className="helpdesk-message-header">
                            <strong>{getUserName(message.sender)}</strong>

                            {message.is_internal && (
                              <span className="internal-badge">INTERNAL</span>
                            )}

                            <time>{formatDate(message.created_at)}</time>
                          </div>

                          <div className="helpdesk-message-content">
                            {message.message}
                          </div>

                          {message.attachment_path && (
                            <div className="helpdesk-attachment">
                              Attachment: {message.attachment_path}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* =========================================
                  REPLY
                  ========================================= */}

              <form className="helpdesk-reply" onSubmit={handleSendMessage}>
                <div className="helpdesk-section-title">
                  <Send size={17} />

                  <span>Reply</span>
                </div>

                {messageError && (
                  <div className="helpdesk-message-error">{messageError}</div>
                )}

                <textarea
                  placeholder="Tulis balasan..."
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                />

                <div className="helpdesk-reply-actions">
                  <label className="helpdesk-checkbox">
                    <input
                      type="checkbox"
                      checked={internalMessage}
                      onChange={(event) =>
                        setInternalMessage(event.target.checked)
                      }
                    />
                    Internal note
                  </label>

                  <button
                    type="submit"
                    className="helpdesk-btn helpdesk-btn-primary"
                    disabled={messageLoading || !reply.trim()}
                  >
                    <Send size={16} />

                    {messageLoading ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </form>

              {/* =========================================
                  DANGER ZONE
                  ========================================= */}

              <div className="helpdesk-danger-zone">
                <div>
                  <strong>Delete Ticket</strong>

                  <span>Ticket akan dihapus secara permanen.</span>
                </div>

                <button
                  type="button"
                  className="helpdesk-btn helpdesk-btn-danger"
                  onClick={handleDeleteTicket}
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
          className="helpdesk-modal-backdrop"
          onMouseDown={() => setShowCreate(false)}
        >
          <div
            className="helpdesk-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="helpdesk-modal-header">
              <div>
                <h2>Create New Ticket</h2>

                <p>Buat laporan atau permintaan bantuan baru.</p>
              </div>

              <button
                type="button"
                className="helpdesk-icon-btn"
                onClick={() => setShowCreate(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleCreateTicket}
              className="helpdesk-create-form"
            >
              <label>
                Subject
                <input
                  type="text"
                  placeholder="Contoh: GPS vehicle tidak mengirim posisi"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                />
              </label>

              <label>
                Priority
                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as Priority)
                  }
                >
                  <option value="LOW">LOW</option>

                  <option value="MEDIUM">MEDIUM</option>

                  <option value="HIGH">HIGH</option>

                  <option value="URGENT">URGENT</option>
                </select>
              </label>

              <label>
                Description
                <textarea
                  rows={6}
                  placeholder="Jelaskan masalah secara detail..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                />
              </label>

              <div className="helpdesk-modal-actions">
                <button
                  type="button"
                  className="helpdesk-btn helpdesk-btn-secondary"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="helpdesk-btn helpdesk-btn-primary"
                  disabled={loading}
                >
                  <Plus size={16} />

                  {loading ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
