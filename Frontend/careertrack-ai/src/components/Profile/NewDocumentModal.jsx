import React, { useState } from "react";
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaTimes } from "react-icons/fa";

function NewDocumentModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Low");
  const [language, setLanguage] = useState("JavaScript");

  if (!isOpen) return null;

  const applyFormatting = (tagType) => {
    const textarea = document.getElementById("main-modal-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let updatedContent = content;
    let newCursorPos = end;

    if (tagType === "bold") {
      const formatted = `**${selectedText || "text"}**`;
      updatedContent = content.substring(0, start) + formatted + content.substring(end);
      newCursorPos = start + formatted.length;
    } else if (tagType === "italic") {
      const formatted = `*${selectedText || "text"}*`;
      updatedContent = content.substring(0, start) + formatted + content.substring(end);
      newCursorPos = start + formatted.length;
    } else if (tagType === "underline") {
      const formatted = `<u>${selectedText || "text"}</u>`;
      updatedContent = content.substring(0, start) + formatted + content.substring(end);
      newCursorPos = start + formatted.length;
    } else if (tagType === "listUl") {
      const lines = selectedText ? selectedText.split("\n") : [""];
      const formatted = lines.map(line => `- ${line}`).join("\n");
      updatedContent = content.substring(0, start) + formatted + content.substring(end);
      newCursorPos = start + formatted.length;
    } else if (tagType === "listOl") {
      const lines = selectedText ? selectedText.split("\n") : [""];
      const formatted = lines.map((line, idx) => `${idx + 1}. ${line}`).join("\n");
      updatedContent = content.substring(0, start) + formatted + content.substring(end);
      newCursorPos = start + formatted.length;
    }

    setContent(updatedContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = () => {
    onSave({ title, content, priority, language });
    onClose();
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>New Document</h3>
          <FaTimes size={14} color="#9ca3af" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          style={styles.titleInput}
        />

        <div style={styles.editorToolbar}>
          <div style={styles.toolGroup}>
            <button style={styles.toolBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting("bold")}><FaBold size={12} /></button>
            <button style={styles.toolBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting("italic")}><FaItalic size={12} /></button>
            <button style={styles.toolBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting("underline")}><FaUnderline size={12} /></button>
            <button style={styles.toolBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting("listUl")}><FaListUl size={12} /></button>
            <button style={styles.toolBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormatting("listOl")}><FaListOl size={12} /></button>
          </div>

          <div style={styles.selectGroup}>
            <select 
              style={styles.dropdown}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="Markdown">Markdown</option>
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>Priority:</span>
              <select 
                style={styles.dropdown}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        <textarea 
          id="main-modal-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your notes here..."
          style={styles.textarea}
        />

        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSave} style={styles.saveBtn}>Save</button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    borderRadius: "16px",
    padding: "24px",
    width: "600px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
    color: "#ffffff",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  modalTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
    color: "#ffffff",
  },
  titleInput: {
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "16px",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  },
  editorToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1c29",
    border: "1px solid #2a2d3d",
    borderRadius: "8px 8px 0 0",
    padding: "8px 12px",
  },
  toolGroup: {
    display: "flex",
    gap: "8px",
  },
  toolBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  selectGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  dropdown: {
    backgroundColor: "#12131a",
    border: "1px solid #2a2d3d",
    color: "#c084fc",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    minHeight: "220px",
    backgroundColor: "#161622",
    border: "1px solid #2a2d3d",
    borderTop: "none",
    borderRadius: "0 0 8px 8px",
    padding: "16px",
    color: "#d1d5db",
    fontSize: "14px",
    lineHeight: "1.6",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    border: "1px solid #2a2d3d",
    color: "#9ca3af",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#7C3AED",
    border: "none",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  }
};

export default NewDocumentModal;