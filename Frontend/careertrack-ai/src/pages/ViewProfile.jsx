import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileSummary from "../components/Profile/ProfileSummary";
import TopSkills from "../components/Profile/TopSkills";
import ResumeCard from "../components/Profile/ResumeCard";
import PersonalInfo from "../components/Profile/PersonalInfo";
import AcademicDetails from "../components/Profile/AcademicDetails";
import SocialLinks from "../components/Profile/SocialLinks";
import Certificates from "../components/Profile/Certificates";
import DailyCheckinWidget from "../components/Profile/DailyCheckinWidget";
import OnboardingForm from "../components/Profile/OnboardingForm";
import {
  FaPlus,
  FaInfoCircle,
  FaTimes,
  FaBold,
  FaItalic,
  FaUnderline,
  FaCode,
  FaListUl,
  FaListOl,
  FaTrash,
  FaEdit,
  FaSearch,
  FaShareAlt,
} from "react-icons/fa";
import "./ViewProfile.css";

function ViewProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Database Notes State for Profile Preview Card
  const [notes, setNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState("Low");
  const [newLanguage, setNewLanguage] = useState("JavaScript");

  const [isFullNotesView, setIsFullNotesView] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorPriority, setEditorPriority] = useState("Low");
  const [editorLanguage, setEditorLanguage] = useState("JavaScript");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState(null);

  const editorRef = useRef(null);

  useEffect(() => {
    fetchUserDataAndNotes();
  }, []);

  useEffect(() => {
    if (editorRef.current && selectedNote) {
      if (editorRef.current.innerHTML !== (selectedNote.content || "")) {
        editorRef.current.innerHTML = selectedNote.content || "";
      }
    }
  }, [selectedNote?._id, isFullNotesView]);

  const fetchUserDataAndNotes = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userRes = await fetch("http://localhost:8080/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setProfileData(userData);

        if (!userData || !userData.isProfileComplete) {
          setIsEditing(true);
        }
      }

      const notesRes = await fetch("http://localhost:8080/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData);
      }
    } catch (error) {
      console.error("Error loading profile or notes data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openInlineNotes = (noteId = null) => {
    setIsFullNotesView(true);
    if (noteId && notes.length > 0) {
      const found = notes.find((n) => n._id === noteId);
      if (found) selectNoteInInline(found);
    } else if (notes.length > 0) {
      selectNoteInInline(notes[0]);
    }
  };

  const selectNoteInInline = (note) => {
    setSelectedNote(note);
    setEditorTitle(note.title || "");
    setEditorContent(note.content || "");
    setEditorPriority(note.priority || "Low");
    setEditorLanguage(note.language || "JavaScript");
  };

  const handleEditorFieldChange = (
    newTitle,
    newContent,
    newPriority,
    newLang,
  ) => {
    setEditorTitle(newTitle);
    setEditorContent(newContent);
    setEditorPriority(newPriority);
    setEditorLanguage(newLang);

    if (!selectedNote) return;

    setNotes(
      notes.map((n) =>
        n._id === selectedNote._id
          ? {
              ...n,
              title: newTitle,
              content: newContent,
              priority: newPriority,
              language: newLang,
            }
          : n,
      ),
    );

    setIsSaving(true);

    if (window.noteSaveTimer) clearTimeout(window.noteSaveTimer);

    window.noteSaveTimer = setTimeout(async () => {
      await saveNoteToDatabase(
        selectedNote._id,
        newTitle,
        newContent,
        newPriority,
        newLang,
      );
    }, 800);
  };

  const saveNoteToDatabase = async (
    noteId,
    title,
    content,
    priority,
    language,
  ) => {
    const token = localStorage.getItem("token");
    if (!token || !noteId) return;

    try {
      const isNew = String(noteId).startsWith("temp_");
      const method = isNew ? "POST" : "PUT";
      const url = isNew
        ? "http://localhost:8080/api/notes"
        : `http://localhost:8080/api/notes/${noteId}`;

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          priority,
          language,
          type: "markdown",
        }),
      });

      if (res.ok) {
        const savedNote = await res.json();
        setSelectedNote(savedNote);
        setNotes((prev) =>
          prev.map((n) =>
            n._id === noteId || n._id === savedNote._id ? savedNote : n,
          ),
        );
      }
    } catch (err) {
      console.error("Error saving note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const applyInlineFormatting = (command) => {
    document.execCommand(command, false, null);

    const editableDiv =
      editorRef.current || document.getElementById("inline-note-textarea");
    if (editableDiv) {
      const newHtml = editableDiv.innerHTML;
      setEditorContent(newHtml);
      handleEditorFieldChange(
        editorTitle,
        newHtml,
        editorPriority,
        editorLanguage,
      );
    }
  };

  const handleInlineCreateNew = async () => {
    const tempNewNote = {
      _id: "temp_" + Date.now(),
      title: "Untitled",
      content: "",
      priority: "Low",
      language: "JavaScript",
      type: "markdown",
      createdAt: new Date().toISOString(),
    };
    setNotes([tempNewNote, ...notes]);
    selectNoteInInline(tempNewNote);
  };

  const confirmInlineDelete = async () => {
    const targetId = selectedNote?._id || noteToDeleteId;
    if (!targetId) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8080/api/notes/${targetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const updated = notes.filter((n) => n._id !== targetId);
        setNotes(updated);

        if (selectedNote && selectedNote._id === targetId) {
          if (updated.length > 0) {
            selectNoteInInline(updated[0]);
          } else {
            setSelectedNote(null);
          }
        }
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    } finally {
      setShowDeleteConfirm(false);
      setNoteToDeleteId(null);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const token = localStorage.getItem("token");
    const notePayload = {
      title: newTitle,
      content: newContent || "Untitled note content...",
      priority: newPriority,
      language: newLanguage,
      type: "markdown",
    };

    try {
      const response = await fetch("http://localhost:8080/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notePayload),
      });

      if (response.ok) {
        const savedNote = await response.json();
        setNotes([savedNote, ...notes]);
        setNewTitle("");
        setNewContent("");
        setNewPriority("Low");
        setNewLanguage("JavaScript");
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Network error saving note:", error);
    }
  };

  const handleDeleteNote = (e, noteId) => {
    e.stopPropagation();
    setNoteToDeleteId(noteId);
    setShowDeleteConfirm(true);
  };

  const filteredInlineNotes = notes.filter((note) => {
    const matchesSearch =
      (note.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "My Notes")
      return matchesSearch && note.type !== "shared";
    if (activeTab === "Shared Notes")
      return matchesSearch && note.type === "shared";
    return matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "20vh" }}>
        Loading profile...
      </div>
    );
  }

  if (isEditing) {
    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <OnboardingForm
          initialData={profileData}
          onSubmitSuccess={(result) => {
            if (result && result.profile) {
              setProfileData(result.profile);
            }
            setIsEditing(false);
            fetchUserDataAndNotes();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div
        className="profile-header-wrapper"
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "stretch",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <ProfileHeader
            profile={profileData}
            onEditClick={() => setIsEditing(true)}
          />
          <PersonalInfo profile={profileData} />
        </div>
        <div>
          <DailyCheckinWidget />
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-left-column">
          <ProfileSummary profile={profileData} />
          <TopSkills skills={profileData?.skills} />
          <ResumeCard profile={profileData} />
          <SocialLinks profile={profileData} />
        </div>

        <div className="profile-right-column">
          <AcademicDetails profile={profileData} />

          {!isFullNotesView ? (
            <div className="profile-card" style={styles.cardContainer}>
              <div style={styles.cardHeader}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <h3 style={styles.cardTitle}>My Notes</h3>
                  <span title="Your database scratchpad notes">
                    <FaInfoCircle size={14} color="#9ca3af" />
                  </span>
                </div>
                <button
                  onClick={() => openInlineNotes()}
                  style={styles.addBtn}
                  title="Open Notes Workspace"
                >
                  <FaPlus size={12} />
                </button>
              </div>

              <div style={styles.notesList}>
                {notes.length === 0 ? (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      textAlign: "center",
                      margin: "10px 0",
                    }}
                  >
                    No notes saved yet.
                  </p>
                ) : (
                  notes.slice(0, 3).map((note) => {
                    const plainTextSnippet = note.content
                      ? note.content.replace(/<[^>]*>?/gm, "")
                      : "";

                    return (
                      <div
                        key={note._id}
                        style={styles.noteItem}
                        onClick={() => openInlineNotes(note._id)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "#7C3AED")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "#2a2d3d")
                        }
                      >
                        <div style={styles.noteItemTop}>
                          <span style={styles.noteItemTitle}>{note.title}</span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <span style={styles.priorityBadge}>
                              <span
                                style={{
                                  ...styles.dot,
                                  backgroundColor:
                                    note.priority === "High"
                                      ? "#ef4444"
                                      : note.priority === "Medium"
                                        ? "#f59e0b"
                                        : "#10b981",
                                }}
                              ></span>
                              {note.priority}
                            </span>

                            <button
                              onClick={(e) => handleDeleteNote(e, note._id)}
                              style={styles.deleteNoteBtn}
                              title="Delete note"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>

                        <p style={styles.noteSnippet}>
                          {plainTextSnippet.trim() !== ""
                            ? plainTextSnippet.length > 60
                              ? plainTextSnippet.substring(0, 60) + "..."
                              : plainTextSnippet
                            : "No additional content..."}
                        </p>

                        <div style={styles.noteItemBottom}>
                          <span style={styles.noteDate}>
                            {new Date(note.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          <span style={styles.typeTag}>{note.type}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => openInlineNotes()}
                  style={styles.seeAllBtn}
                >
                  See All
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.inlineNotesContainer}>
              <div style={styles.topToolbar}>
                <div style={styles.toolbarLeft}>
                  <button
                    onClick={async () => {
                      if (window.noteSaveTimer)
                        clearTimeout(window.noteSaveTimer);
                      if (selectedNote) {
                        await saveNoteToDatabase(
                          selectedNote._id,
                          editorTitle,
                          editorContent,
                          editorPriority,
                          editorLanguage,
                        );
                      }
                      setIsFullNotesView(false);
                    }}
                    style={styles.backBtn}
                  >
                    ← Back to Profile
                  </button>
                </div>

                <div style={styles.toolbarCenter}>
                  <button
                    style={styles.toolBtn}
                    title="Delete Note"
                    onClick={() => selectedNote && setShowDeleteConfirm(true)}
                  >
                    <FaTrash size={14} />
                  </button>
                  <button
                    style={styles.toolBtn}
                    title="Create New"
                    onClick={handleInlineCreateNew}
                  >
                    <FaEdit size={14} />
                  </button>
                  <div style={styles.divider}></div>

                  <button
                    style={styles.toolBtn}
                    title="Bold"
                    onClick={() => applyInlineFormatting("bold")}
                  >
                    <FaBold size={13} />
                  </button>
                  <button
                    style={styles.toolBtn}
                    title="Italic"
                    onClick={() => applyInlineFormatting("italic")}
                  >
                    <FaItalic size={13} />
                  </button>
                  <button
                    style={styles.toolBtn}
                    title="Underline"
                    onClick={() => applyInlineFormatting("underline")}
                  >
                    <FaUnderline size={13} />
                  </button>
                  <div style={styles.divider}></div>
                  <button
                    style={styles.toolBtn}
                    title="Bullet List"
                    onClick={() => applyInlineFormatting("insertUnorderedList")}
                  >
                    <FaListUl size={13} />
                  </button>
                  <button
                    style={styles.toolBtn}
                    title="Numbered List"
                    onClick={() => applyInlineFormatting("insertOrderedList")}
                  >
                    <FaListOl size={13} />
                  </button>
                  <div style={styles.divider}></div>

                  <select
                    style={styles.languageSelect}
                    value={editorLanguage}
                    onChange={(e) =>
                      handleEditorFieldChange(
                        editorTitle,
                        editorContent,
                        editorPriority,
                        e.target.value,
                      )
                    }
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Markdown">Markdown</option>
                  </select>
                </div>

                <div style={styles.toolbarRight}>
                  <div style={styles.searchBox}>
                    <FaSearch size={12} color="#9ca3af" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={styles.searchInput}
                    />
                    {searchQuery && (
                      <FaTimes
                        size={12}
                        color="#9ca3af"
                        style={{ cursor: "pointer" }}
                        onClick={() => setSearchQuery("")}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.splitBody}>
                <div style={styles.sidebar}>
                  <div style={styles.tabsRow}>
                    {["All", "My Notes", "Shared Notes"].map((tab) => (
                      <span
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          ...styles.tabItem,
                          color: activeTab === tab ? "#C084FC" : "#9ca3af",
                          borderBottom:
                            activeTab === tab ? "2px solid #7C3AED" : "none",
                          paddingBottom: "4px",
                        }}
                      >
                        {tab}
                      </span>
                    ))}
                  </div>

                  <div style={styles.notesList}>
                    {filteredInlineNotes.length === 0 ? (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          textAlign: "center",
                          marginTop: "20px",
                        }}
                      >
                        No notes found.
                      </p>
                    ) : (
                      filteredInlineNotes.map((note) => (
                        <div
                          key={note._id}
                          onClick={() => selectNoteInInline(note)}
                          style={{
                            ...styles.sidebarNoteCard,
                            backgroundColor:
                              selectedNote?._id === note._id
                                ? "#1a1c29"
                                : "transparent",
                            borderLeft:
                              selectedNote?._id === note._id
                                ? "3px solid #7C3AED"
                                : "3px solid transparent",
                          }}
                        >
                          <div style={styles.sidebarNoteTitle}>
                            {note.title || "Untitled"}
                          </div>
                          <div style={styles.sidebarNoteFooter}>
                            <span style={styles.sidebarNoteDate}>
                              {new Date(
                                note.createdAt || Date.now(),
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {note.type === "shared" && (
                                <FaShareAlt size={10} color="#9ca3af" />
                              )}
                              <span
                                style={{
                                  ...styles.miniDot,
                                  backgroundColor:
                                    note.priority === "High"
                                      ? "#ef4444"
                                      : note.priority === "Medium"
                                        ? "#f59e0b"
                                        : "#10b981",
                                }}
                              ></span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={styles.mainEditorPane}>
                  {selectedNote ? (
                    <div>
                      <div style={styles.editorHeaderMeta}>
                        <span style={styles.metaDate}>
                          Last updated:{" "}
                          {new Date(
                            selectedNote.updatedAt ||
                              selectedNote.createdAt ||
                              Date.now(),
                          ).toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>

                        <div style={styles.priorityGroup}>
                          <span>Priority:</span>
                          {["Low", "Medium", "High"].map((pLevel) => (
                            <span
                              key={pLevel}
                              onClick={() =>
                                handleEditorFieldChange(
                                  editorTitle,
                                  editorContent,
                                  pLevel,
                                  editorLanguage,
                                )
                              }
                              style={{
                                ...styles.priorityClickable,
                                color:
                                  pLevel === "High"
                                    ? "#ef4444"
                                    : pLevel === "Medium"
                                      ? "#f59e0b"
                                      : "#10b981",
                                fontWeight:
                                  editorPriority === pLevel ? "700" : "400",
                                opacity: editorPriority === pLevel ? 1 : 0.6,
                              }}
                            >
                              <span
                                style={{
                                  ...styles.dot,
                                  backgroundColor:
                                    pLevel === "High"
                                      ? "#ef4444"
                                      : pLevel === "Medium"
                                        ? "#f59e0b"
                                        : "#10b981",
                                }}
                              ></span>
                              {pLevel}
                            </span>
                          ))}
                          {isSaving && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#9ca3af",
                                marginLeft: "8px",
                              }}
                            >
                              Saving...
                            </span>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={editorTitle}
                        onChange={(e) =>
                          handleEditorFieldChange(
                            e.target.value,
                            editorContent,
                            editorPriority,
                            editorLanguage,
                          )
                        }
                        placeholder="Note Title..."
                        style={styles.editableTitleInput}
                      />

                      <div
                        ref={editorRef}
                        id="inline-note-textarea"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onInput={(e) => {
                          const html = e.currentTarget.innerHTML;
                          setEditorContent(html);
                          handleEditorFieldChange(
                            editorTitle,
                            html,
                            editorPriority,
                            editorLanguage,
                          );
                        }}
                        style={{
                          ...styles.textareaEditor,
                          minHeight: "260px",
                          width: "100%",
                          overflowY: "auto",
                          outline: "none",
                          whiteSpace: "pre-wrap",
                          color: "inherit", // This ensures text is visible in both light/dark modes!
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#6b7280",
                        marginTop: "30vh",
                      }}
                    >
                      Select a note from the sidebar or click edit to create
                      one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Certificates
            certificates={profileData?.certificates}
            onCertificateAdded={fetchUserDataAndNotes}
          />
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmBox}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div style={styles.infoCircleIcon}>i</div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#ffffff" }}>
                Are you sure?
              </h3>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                marginBottom: "24px",
              }}
            >
              Are you sure you want to delete the selected items?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={confirmInlineDelete} style={styles.confirmBtn}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.editorTopBar}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                New Document
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                style={styles.closeBtn}
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form
              onSubmit={handleAddNote}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <input
                type="text"
                required
                placeholder="Untitled"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={styles.titleInput}
              />

              <div style={styles.formattingToolbar}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => applyInlineFormatting("bold")}
                    style={styles.toolBtn}
                    title="Bold"
                  >
                    <FaBold size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyInlineFormatting("italic")}
                    style={styles.toolBtn}
                    title="Italic"
                  >
                    <FaItalic size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyInlineFormatting("underline")}
                    style={styles.toolBtn}
                    title="Underline"
                  >
                    <FaUnderline size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyInlineFormatting("insertUnorderedList")}
                    style={styles.toolBtn}
                    title="Bullet List"
                  >
                    <FaListUl size={12} />
                  </button>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <select
                    style={styles.languageSelect}
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                  </select>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      Priority:
                    </span>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      style={styles.prioritySelect}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <textarea
                id="scratchpad-textarea"
                rows={7}
                placeholder="Start typing your notes here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                style={styles.scratchpadArea}
              />

              <div style={styles.editorFooter}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  cancelEditBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "#2a2d3d",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    zIndex: 10,
  },
  cardContainer: {
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    padding: "20px",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
    marginBottom: "0",
  },
  inlineNotesContainer: {
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "0",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: 0,
    color: "#ffffff",
  },
  addBtn: {
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
  },
  notesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "12px",
  },
  noteItem: {
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  noteItemTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  noteItemTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
  },
  priorityBadge: {
    fontSize: "11px",
    color: "#10b981",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontWeight: "600",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
  },
  noteSnippet: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "4px 0 8px 0",
    lineHeight: "1.4",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  deleteNoteBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    borderRadius: "4px",
    transition: "color 0.2s",
  },
  noteItemBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteDate: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  typeTag: {
    fontSize: "10px",
    backgroundColor: "#2a2d3d",
    color: "#9ca3af",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  seeAllBtn: {
    background: "transparent",
    border: "none",
    color: "#7C3AED",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  topToolbar: {
    height: "60px",
    backgroundColor: "#161821",
    borderBottom: "1px solid #2a2d3d",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  backBtn: {
    backgroundColor: "transparent",
    border: "1px solid #2a2d3d",
    color: "#9ca3af",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  toolbarCenter: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  toolBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: "1px",
    height: "18px",
    backgroundColor: "#2a2d3d",
    margin: "0 4px",
  },
  languageSelect: {
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    color: "#ffffff",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    borderRadius: "8px",
    padding: "4px 10px",
    gap: "6px",
    width: "180px",
  },
  searchInput: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "12px",
    outline: "none",
    width: "100%",
  },
  splitBody: {
    display: "flex",
    height: "480px",
  },
  sidebar: {
    width: "240px",
    backgroundColor: "#12131a",
    borderRight: "1px solid #2a2d3d",
    display: "flex",
    flexDirection: "column",
  },
  tabsRow: {
    display: "flex",
    gap: "16px",
    padding: "12px 16px",
    borderBottom: "1px solid #2a2d3d",
  },
  tabItem: {
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    paddingBottom: "4px",
  },
  sidebarNoteCard: {
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
    margin: "4px 8px",
  },
  sidebarNoteTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "4px",
  },
  sidebarNoteFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sidebarNoteDate: {
    fontSize: "10px",
    color: "#6b7280",
  },
  miniDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
  },
  mainEditorPane: {
    flex: 1,
    backgroundColor: "#0b0c10",
    padding: "24px",
    overflowY: "auto",
  },
  editorHeaderMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    fontSize: "11px",
    color: "#9ca3af",
  },
  priorityGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  priorityClickable: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },
  editableTitleInput: {
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "12px",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  },
  textareaEditor: {
    width: "100%",
    minHeight: "260px",
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    color: "inherit", // Automatically adapts to light/dark container text colors
    fontSize: "13px",
    lineHeight: "1.5",
    fontFamily: "Inter, sans-serif",
    resize: "vertical",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalCard: {
    width: "480px",
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
    boxSizing: "border-box",
  },
  editorTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #2a2d3d",
    paddingBottom: "12px",
    marginBottom: "12px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
  },
  titleInput: {
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
    outline: "none",
    marginBottom: "10px",
    fontFamily: "Inter, sans-serif",
  },
  formattingToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    borderRadius: "8px 8px 0 0",
    padding: "8px 12px",
  },
  prioritySelect: {
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    borderRadius: "6px",
    color: "#10b981",
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 8px",
    outline: "none",
    cursor: "pointer",
  },
  scratchpadArea: {
    width: "100%",
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    borderTop: "none",
    borderRadius: "0 0 8px 8px",
    color: "#e5e7eb",
    fontSize: "13px",
    padding: "12px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "Inter, monospace",
    lineHeight: "1.5",
  },
  editorFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "16px",
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid #2a2d3d",
    color: "#9ca3af",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  saveBtn: {
    backgroundColor: "#7C3AED",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
  },
  confirmBox: {
    backgroundColor: "#161622",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    padding: "24px",
    width: "400px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
  },
  infoCircleIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
    fontStyle: "italic",
  },
  confirmBtn: {
    backgroundColor: "#7C3AED",
    border: "none",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
};

export default ViewProfile;
