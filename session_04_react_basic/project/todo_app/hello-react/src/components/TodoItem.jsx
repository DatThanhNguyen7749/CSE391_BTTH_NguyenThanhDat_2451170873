// TodoItem.jsx
// Đã thêm:
//   - Ngày tạo (Level 1)
//   - Nút Sửa inline + Double-click để sửa (Level 2)
//   - Kéo thả sắp xếp (Level 3)
//   - Hiển thị + đổi tag/category (Level 3)

function TodoItem({
    todo,
    onToggle,
    onDelete,
    onEdit,
    onChangeTag,
    tagList,
    // Props kéo thả
    isDragging,
    onDragStart,
    onDrop,
    onDragEnd,
}) {
    // State kiểm tra đang ở chế độ sửa hay không (Level 2)
    const [isEditing, setIsEditing] = useState(false);
    // Text tạm thời khi đang sửa (Level 2)
    const [editText, setEditText] = useState(todo.text);
    // Hiện/ẩn dropdown đổi tag (Level 3)
    const [showTagMenu, setShowTagMenu] = useState(false);

    // Lấy thông tin tag hiện tại của todo
    const currentTag = tagList.find(t => t.key === todo.tag) || tagList[0];

    // Lưu khi sửa xong (Level 2)
    function handleSaveEdit() {
        if (editText.trim() === "") return;
        onEdit(todo.id, editText);
        setIsEditing(false);
    }

    // Hủy sửa, khôi phục text cũ (Level 2)
    function handleCancelEdit() {
        setEditText(todo.text);
        setIsEditing(false);
    }

    // Bấm Enter lưu, Escape hủy (Level 2)
    function handleEditKeyDown(event) {
        if (event.key === "Enter")  handleSaveEdit();
        if (event.key === "Escape") handleCancelEdit();
    }

    // ===== Xử lý kéo thả (Level 3) =====
    function handleDragOver(event) {
        event.preventDefault(); // Bắt buộc phải có để onDrop hoạt động
    }

    return (
        <div
            // Thuộc tính HTML để kéo thả (Level 3)
            draggable
            onDragStart={() => onDragStart(todo.id)}
            onDragOver={handleDragOver}
            onDrop={() => onDrop(todo.id)}
            onDragEnd={onDragEnd}
            style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "10px 12px",
                margin: "5px 0",
                background: todo.done ? "#f0fff0" : "#fff",
                border: isDragging ? "2px dashed #3498db" : "1px solid #eee",
                borderRadius: "4px",
                gap: "8px",
                // Làm mờ item đang được kéo để dễ nhìn
                opacity: isDragging ? 0.4 : 1,
                cursor: "grab",
                transition: "opacity 0.2s",
            }}
        >
            {/* Icon kéo thả (Level 3) */}
            <span style={{ color: "#ccc", fontSize: "16px", paddingTop: "2px", userSelect: "none" }}>
                ☰
            </span>

            {/* Checkbox */}
            <input
                type="checkbox"
                checked={todo.done}
                onChange={() => onToggle(todo.id)}
                style={{ cursor: "pointer", marginTop: "4px" }}
            />

            {/* Phần nội dung chính */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                    // --- Chế độ sửa (Level 2) ---
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        autoFocus
                        style={{
                            width: "100%",
                            padding: "3px 6px",
                            fontSize: "14px",
                            border: "2px solid #3498db",
                            borderRadius: "4px",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                ) : (
                    // --- Chế độ xem ---
                    // Double-click để sửa (Level 2)
                    <span
                        onDoubleClick={() => {
                            setEditText(todo.text); // Đảm bảo editText mới nhất
                            setIsEditing(true);
                        }}
                        title="Double-click để sửa"
                        style={{
                            display: "block",
                            textDecoration: todo.done ? "line-through" : "none",
                            color: todo.done ? "#999" : "#333",
                            cursor: "text",
                            wordBreak: "break-word",
                            fontSize: "14px",
                        }}
                    >
                        {todo.text}
                    </span>
                )}

                {/* Dòng thông tin nhỏ: ngày tạo + tag */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    {/* Ngày tạo (Level 1) */}
                    <span style={{ fontSize: "11px", color: "#bbb" }}>
                        📅 {todo.createdAt}
                    </span>

                    {/* Tag hiện tại (Level 3) - bấm để đổi tag */}
                    {todo.tag && todo.tag !== "none" && (
                        <span
                            onClick={() => setShowTagMenu(!showTagMenu)}
                            title="Bấm để đổi tag"
                            style={{
                                fontSize: "11px",
                                padding: "1px 7px",
                                borderRadius: "10px",
                                background: currentTag.color,
                                color: "white",
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                        >
                            {currentTag.label}
                        </span>
                    )}

                    {/* Nút thêm tag nếu chưa có */}
                    {(!todo.tag || todo.tag === "none") && (
                        <span
                            onClick={() => setShowTagMenu(!showTagMenu)}
                            style={{
                                fontSize: "11px",
                                color: "#bbb",
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                        >
                            + tag
                        </span>
                    )}
                </div>

                {/* Dropdown chọn tag (Level 3) */}
                {showTagMenu && (
                    <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "5px",
                        marginTop: "6px",
                        padding: "8px",
                        background: "#f9f9f9",
                        borderRadius: "4px",
                        border: "1px solid #eee",
                    }}>
                        {tagList.map(tag => (
                            <button
                                key={tag.key}
                                onClick={() => {
                                    onChangeTag(todo.id, tag.key);
                                    setShowTagMenu(false); // Đóng menu sau khi chọn
                                }}
                                style={{
                                    padding: "2px 8px",
                                    fontSize: "11px",
                                    border: `1px solid ${tag.color}`,
                                    borderRadius: "10px",
                                    background: todo.tag === tag.key ? tag.color : "white",
                                    color: todo.tag === tag.key ? "white" : tag.color,
                                    cursor: "pointer",
                                }}
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Các nút hành động */}
            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                {isEditing ? (
                    // Đang sửa: hiện Lưu + Hủy (Level 2)
                    <>
                        <button
                            onClick={handleSaveEdit}
                            style={{
                                background: "#2ecc71",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                            }}
                        >
                            ✓
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            style={{
                                background: "#95a5a6",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                            }}
                        >
                            ✕
                        </button>
                    </>
                ) : (
                    // Không sửa: hiện Sửa + Xóa
                    <>
                        <button
                            onClick={() => {
                                setEditText(todo.text);
                                setIsEditing(true);
                            }}
                            style={{
                                background: "#f39c12",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "13px",
                            }}
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => onDelete(todo.id)}
                            style={{
                                background: "#e74c3c",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "13px",
                            }}
                        >
                            🗑
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// Quan trọng: phải import useState vì dùng trong component này
import { useState } from "react";

export default TodoItem;