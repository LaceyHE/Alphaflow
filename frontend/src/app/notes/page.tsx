"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  createdAt: string;
  starred: boolean;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: "starred", name: "收藏 Favorites", color: "#f59e0b", isDefault: true },
  { id: "research", name: "Research Notes", color: "#2563eb", isDefault: true },
  { id: "ideas", name: "Trade Ideas", color: "#16a34a", isDefault: true },
  { id: "macro", name: "Macro Insights", color: "#7c3aed", isDefault: true },
];

const SAMPLE_NOTES: Note[] = [
  { id: "1", title: "Tech Rotation Watch", content: "XLK breaking out vs XLE. Watch for continuation above $200. Risk: Fed hawkishness could reverse.", folder: "research", createdAt: "2025-06-20", starred: true },
  { id: "2", title: "Japan Inflows Thesis", content: "EWJ seeing sustained inflows for 3 weeks. Yen weakness + BOJ policy pivot = structural trade. Target: 10% allocation.", folder: "ideas", createdAt: "2025-06-19", starred: false },
  { id: "3", title: "VIX < 15 Observation", content: "When VIX drops below 15, tech outperforms for avg 6 weeks historically. Current: 13.2. Bullish for QQQ.", folder: "macro", createdAt: "2025-06-18", starred: true },
];

function genId() { return Math.random().toString(36).slice(2, 9); }

export default function NotesPage() {
  const { lang } = useLang();
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [notes, setNotes] = useState<Note[]>(SAMPLE_NOTES);
  const [activeFolder, setActiveFolder] = useState<string>("starred");
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [search, setSearch] = useState("");

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("af_notes");
    const savedFolders = localStorage.getItem("af_folders");
    if (saved) setNotes(JSON.parse(saved));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
  }, []);

  const save = (n: Note[]) => { setNotes(n); localStorage.setItem("af_notes", JSON.stringify(n)); };
  const saveFolders = (f: Folder[]) => { setFolders(f); localStorage.setItem("af_folders", JSON.stringify(f)); };

  const visibleNotes = notes.filter(n => {
    const inFolder = activeFolder === "starred" ? n.starred : n.folder === activeFolder;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return inFolder && matchSearch;
  });

  const createNote = () => {
    const note: Note = {
      id: genId(), title: "Untitled Note", content: "",
      folder: activeFolder === "starred" ? "research" : activeFolder,
      createdAt: new Date().toISOString().slice(0, 10), starred: activeFolder === "starred",
    };
    const updated = [note, ...notes];
    save(updated);
    setActiveNote(note);
    setEditing(true);
  };

  const updateNote = (field: keyof Note, value: string | boolean) => {
    if (!activeNote) return;
    const updated = notes.map(n => n.id === activeNote.id ? { ...n, [field]: value } : n);
    save(updated);
    setActiveNote(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const deleteNote = (id: string) => {
    save(notes.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
  };

  const toggleStar = (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, starred: !n.starred } : n);
    save(updated);
    if (activeNote?.id === id) setActiveNote(prev => prev ? { ...prev, starred: !prev.starred } : prev);
  };

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899"];
    const f: Folder = { id: genId(), name: newFolderName.trim(), color: COLORS[folders.length % COLORS.length] };
    saveFolders([...folders, f]);
    setNewFolderMode(false);
    setNewFolderName("");
    setActiveFolder(f.id);
  };

  const activeF = folders.find(f => f.id === activeFolder);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", background: "#f8fafc" }}>

      {/* Folder sidebar */}
      <div style={{ width: 220, flexShrink: 0, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            {lang === "zh" ? "笔记本" : "Notebooks"}
          </div>
          {/* Global search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === "zh" ? "搜索笔记..." : "Search notes..."}
            style={{ width: "100%", height: 30, padding: "0 8px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 12, color: "#334155", outline: "none", fontFamily: "inherit", background: "#f8fafc", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {folders.map(folder => {
            const count = folder.id === "starred" ? notes.filter(n => n.starred).length : notes.filter(n => n.folder === folder.id).length;
            const active = activeFolder === folder.id;
            return (
              <button key={folder.id} onClick={() => setActiveFolder(folder.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "8px 14px", border: "none", textAlign: "left", cursor: "pointer",
                background: active ? "#eff6ff" : "transparent",
                borderLeft: `3px solid ${active ? folder.color : "transparent"}`,
                fontFamily: "inherit",
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: folder.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#0f172a" : "#475569" }}>{folder.name}</span>
                <span style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", padding: "1px 6px", borderRadius: 10 }}>{count}</span>
              </button>
            );
          })}

          {/* Add folder */}
          {newFolderMode ? (
            <div style={{ padding: "8px 14px" }}>
              <input
                autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addFolder(); if (e.key === "Escape") setNewFolderMode(false); }}
                placeholder={lang === "zh" ? "文件夹名称..." : "Folder name..."}
                style={{ width: "100%", height: 28, padding: "0 8px", border: "1px solid #93c5fd", borderRadius: 4, fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
                <button onClick={addFolder} style={{ flex: 1, padding: "4px 0", fontSize: 11, fontWeight: 600, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}>
                  {lang === "zh" ? "创建" : "Create"}
                </button>
                <button onClick={() => setNewFolderMode(false)} style={{ flex: 1, padding: "4px 0", fontSize: 11, background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}>
                  {lang === "zh" ? "取消" : "Cancel"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNewFolderMode(true)} style={{
              width: "100%", padding: "7px 14px", border: "none", background: "transparent",
              color: "#94a3b8", fontSize: 12, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
              {lang === "zh" ? "新建文件夹" : "New Folder"}
            </button>
          )}
        </div>
      </div>

      {/* Note list */}
      <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {activeF && <span style={{ width: 10, height: 10, borderRadius: "50%", background: activeF.color, flexShrink: 0 }} />}
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{activeF?.name}</span>
          </div>
          <button onClick={createNote} style={{
            width: 28, height: 28, borderRadius: 6, background: "#1e3a5f", border: "none",
            color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit", lineHeight: 1,
          }}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {visibleNotes.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
              {lang === "zh" ? "暂无笔记" : "No notes yet"}
              <br />
              <button onClick={createNote} style={{ marginTop: 10, padding: "5px 14px", fontSize: 12, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }}>
                {lang === "zh" ? "创建第一条笔记" : "Create first note"}
              </button>
            </div>
          ) : visibleNotes.map(note => (
            <div key={note.id} onClick={() => { setActiveNote(note); setEditing(false); }} style={{
              padding: "12px 14px", borderBottom: "1px solid #f8fafc", cursor: "pointer",
              background: activeNote?.id === note.id ? "#eff6ff" : "transparent",
              borderLeft: `3px solid ${activeNote?.id === note.id ? "#1e3a5f" : "transparent"}`,
            }}
              onMouseEnter={e => { if (activeNote?.id !== note.id) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
              onMouseLeave={e => { if (activeNote?.id !== note.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.3, flex: 1 }}>{note.title}</div>
                <button onClick={e => { e.stopPropagation(); toggleStar(note.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 2, color: note.starred ? "#f59e0b" : "#cbd5e1", flexShrink: 0 }}>
                  ★
                </button>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                {note.content || (lang === "zh" ? "（空笔记）" : "(empty note)")}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>{note.createdAt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
        {activeNote ? (
          <>
            {/* Editor toolbar */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setEditing(!editing)} style={{
                padding: "5px 14px", fontSize: 12, fontWeight: 600,
                background: editing ? "#1e3a5f" : "#f1f5f9",
                color: editing ? "#fff" : "#475569",
                border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
              }}>
                {editing ? (lang === "zh" ? "预览" : "Preview") : (lang === "zh" ? "编辑" : "Edit")}
              </button>
              <button onClick={() => toggleStar(activeNote.id)} style={{
                padding: "5px 14px", fontSize: 12, fontWeight: 600,
                background: activeNote.starred ? "#fffbeb" : "#f1f5f9",
                color: activeNote.starred ? "#b45309" : "#475569",
                border: `1px solid ${activeNote.starred ? "#fde68a" : "#e2e8f0"}`,
                borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
              }}>
                {activeNote.starred ? "★ " : "☆ "}{lang === "zh" ? "收藏" : "Favorite"}
              </button>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{activeNote.createdAt}</span>
              <button onClick={() => deleteNote(activeNote.id)} style={{
                padding: "5px 12px", fontSize: 12, background: "#fef2f2", color: "#dc2626",
                border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
              }}>
                {lang === "zh" ? "删除" : "Delete"}
              </button>
            </div>

            {/* Note content */}
            <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
              {editing ? (
                <>
                  <input
                    value={activeNote.title}
                    onChange={e => updateNote("title", e.target.value)}
                    style={{
                      width: "100%", fontSize: 24, fontWeight: 700, color: "#0f172a",
                      border: "none", outline: "none", fontFamily: "inherit",
                      background: "transparent", marginBottom: 16, letterSpacing: "-0.02em",
                    }}
                    placeholder={lang === "zh" ? "标题..." : "Note title..."}
                  />
                  <textarea
                    value={activeNote.content}
                    onChange={e => updateNote("content", e.target.value)}
                    style={{
                      width: "100%", minHeight: 500, fontSize: 15, color: "#334155",
                      border: "none", outline: "none", fontFamily: "inherit",
                      background: "transparent", resize: "none", lineHeight: 1.8,
                    }}
                    placeholder={lang === "zh" ? "在这里写下你的想法、研究和交易笔记..." : "Write your research, thoughts, and trade notes here...\n\nTips:\n• Use clear headers for structure\n• Note the date and market context\n• Link to specific tickers or themes"}
                  />
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.02em" }}>{activeNote.title}</h2>
                  <div style={{ fontSize: 15, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {activeNote.content || <span style={{ color: "#94a3b8" }}>{lang === "zh" ? "（空笔记，点击编辑）" : "(Empty note — click Edit to start writing)"}</span>}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📓</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
              {lang === "zh" ? "选择一条笔记" : "Select a note"}
            </div>
            <div style={{ fontSize: 14, marginBottom: 20 }}>
              {lang === "zh" ? "或新建一条笔记开始记录" : "or create a new one to get started"}
            </div>
            <button onClick={createNote} style={{
              padding: "10px 24px", fontSize: 14, fontWeight: 600,
              background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 6,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {lang === "zh" ? "新建笔记" : "New Note"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
