import { useState, useEffect } from "react";
import TodoItem from "./components/TodoItem";
import TodoFilter from "./components/TodoFilter";
import './App.css';

function App() {
    // ===== State chính =====

    // Lấy todos từ localStorage khi khởi động (Level 2)
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem("my-todos");
        if (saved) return JSON.parse(saved);
        return [];
    });

    const [inputValue, setInputValue] = useState("");
    const [filter, setFilter] = useState("all");

    // State cho tag đang chọn khi thêm todo (Level 3)
    const [selectedTag, setSelectedTag] = useState("none");

    // State cho drag & drop: lưu id của todo đang được kéo (Level 3)
    const [draggingId, setDraggingId] = useState(null);

    // Danh sách tags có sẵn (Level 3)
    const TAG_LIST = [
        { key: "none",     label: "Không có",  color: "#ccc" },
        { key: "work",     label: "💼 Công việc", color: "#3498db" },
        { key: "study",    label: "📚 Học tập",   color: "#9b59b6" },
        { key: "personal", label: "🏠 Cá nhân",   color: "#e67e22" },
        { key: "urgent",   label: "🔥 Khẩn cấp",  color: "#e74c3c" },
    ];

    // Lưu todos vào localStorage mỗi khi todos thay đổi (Level 2)
    useEffect(() => {
        localStorage.setItem("my-todos", JSON.stringify(todos));
    }, [todos]);

    // ===== Thêm todo =====
    function addTodo() {
        if (inputValue.trim() === "") return;

        // Lấy ngày giờ tạo (Level 1)
        const now = new Date();
        const createdAt = now.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        // Lưu thêm timestamp để group theo ngày (Level 3)
        const dateKey = now.toISOString().split("T")[0]; // "2025-01-15"

        const newTodo = {
            id: Date.now(),
            text: inputValue,
            done: false,
            createdAt: createdAt,   // Ngày hiển thị (Level 1)
            dateKey: dateKey,       // Ngày dạng key để group (Level 3)
            tag: selectedTag,       // Tag/category (Level 3)
        };

        setTodos([...todos, newTodo]);
        setInputValue("");
        // Giữ nguyên selectedTag để thêm liên tiếp cùng tag
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") addTodo();
    }

    // ===== Toggle done =====
    function toggleTodo(id) {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, done: !todo.done } : todo
        ));
    }

    // ===== Xóa todo =====
    function deleteTodo(id) {
        setTodos(todos.filter(todo => todo.id !== id));
    }

    // ===== Sửa todo (Level 2) =====
    function editTodo(id, newText) {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, text: newText } : todo
        ));
    }

    // ===== Đổi tag cho todo (Level 3) =====
    function changeTag(id, newTag) {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, tag: newTag } : todo
        ));
    }

    // ===== Kéo thả sắp xếp (Level 3) =====
    // Khi bắt đầu kéo: lưu lại id của todo đang kéo
    function handleDragStart(id) {
        setDraggingId(id);
    }

    // Khi thả vào vị trí của todo khác: hoán đổi vị trí
    function handleDrop(targetId) {
        if (draggingId === targetId) return; // Kéo vào chính nó thì bỏ qua

        const dragIndex = todos.findIndex(t => t.id === draggingId);
        const targetIndex = todos.findIndex(t => t.id === targetId);

        // Tạo mảng mới với thứ tự đã đổi
        const newTodos = [...todos];
        const [draggedItem] = newTodos.splice(dragIndex, 1); // Lấy ra phần tử đang kéo
        newTodos.splice(targetIndex, 0, draggedItem);        // Chèn vào vị trí mới

        setTodos(newTodos);
        setDraggingId(null);
    }

    function handleDragEnd() {
        setDraggingId(null); // Reset khi thả xong
    }

    // ===== Lọc todos =====
    const filteredTodos = todos.filter(todo => {
        if (filter === "active")    return !todo.done;
        if (filter === "completed") return todo.done;
        return true;
    });

    // ===== Đếm số việc =====
    const activeCount    = todos.filter(todo => !todo.done).length;
    const completedCount = todos.filter(todo => todo.done).length;
    const totalCount     = todos.length; // Level 1

    // ===== Placeholder đổi theo filter (Level 1) =====
    function getPlaceholder() {
        if (filter === "active")    return "Thêm việc chưa xong...";
        if (filter === "completed") return "Thêm việc đã hoàn thành...";
        return "Nhập công việc mới...";
    }

    // ===== Phân nhóm todos theo ngày tạo (Level 3) =====
    // Trả về object: { "2025-01-15": [todo1, todo2], "2025-01-14": [todo3] }
    function groupByDate(todoList) {
        const groups = {};
        todoList.forEach(todo => {
            const key = todo.dateKey || "unknown";
            if (!groups[key]) groups[key] = [];
            groups[key].push(todo);
        });
        return groups;
    }

    // Chuyển dateKey "2025-01-15" thành "15/01/2025"
    function formatDateKey(dateKey) {
        if (dateKey === "unknown") return "Không rõ ngày";
        const [year, month, day] = dateKey.split("-");
        const today = new Date().toISOString().split("T")[0];
        if (dateKey === today) return "🗓️ Hôm nay";
        // Kiểm tra hôm qua
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dateKey === yesterday.toISOString().split("T")[0]) return "🗓️ Hôm qua";
        return `🗓️ ${day}/${month}/${year}`;
    }

    const groupedTodos = groupByDate(filteredTodos);
    // Sắp xếp các nhóm: ngày mới nhất lên trên
    const sortedDateKeys = Object.keys(groupedTodos).sort((a, b) => b.localeCompare(a));

    return (
        <div style={{
            maxWidth: "540px",
            margin: "0 auto",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
        }}>
            {/* Header: emoji và chữ tách riêng để không bị đè lên nhau */}
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "40px", lineHeight: 1 }}>📋</div>
                <h1 style={{ margin: "4px 0 0 0", fontSize: "28px", lineHeight: 1.2 }}>Todo List</h1>
            </div>

            {/* Tổng số todos - Level 1 */}
            {totalCount > 0 && (
                <p style={{ textAlign: "center", color: "#888", margin: "0 0 16px", fontSize: "14px" }}>
                    Tổng cộng: <strong>{totalCount}</strong> công việc
                </p>
            )}

            {/* ===== Chọn tag trước khi thêm - Level 3 ===== */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", color: "#888", alignSelf: "center" }}>Tag:</span>
                {TAG_LIST.map(tag => (
                    <button
                        key={tag.key}
                        onClick={() => setSelectedTag(tag.key)}
                        style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            border: `2px solid ${tag.color}`,
                            borderRadius: "20px",
                            background: selectedTag === tag.key ? tag.color : "white",
                            color: selectedTag === tag.key ? "white" : tag.color,
                            cursor: "pointer",
                            fontWeight: selectedTag === tag.key ? "bold" : "normal",
                        }}
                    >
                        {tag.label}
                    </button>
                ))}
            </div>

            {/* ===== Input thêm todo ===== */}
            <div style={{ display: "flex", marginBottom: "20px" }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getPlaceholder()}
                    style={{
                        flex: 1,
                        padding: "10px",
                        fontSize: "16px",
                        border: "2px solid #ddd",
                        borderRadius: "4px 0 0 4px",
                        outline: "none",
                    }}
                />
                <button
                    onClick={addTodo}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        background: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "0 4px 4px 0",
                        cursor: "pointer",
                    }}
                >
                    Thêm
                </button>
            </div>

            {/* Filter */}
            <TodoFilter filter={filter} setFilter={setFilter} />

            {/* ===== Danh sách todos (phân nhóm theo ngày - Level 3) ===== */}
            {filteredTodos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    {todos.length === 0
                        ? "📝 Chưa có công việc nào"
                        : "Không có công việc phù hợp"}
                </div>
            ) : (
                sortedDateKeys.map(dateKey => (
                    <div key={dateKey}>
                        {/* Tiêu đề nhóm ngày */}
                        <div style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "#888",
                            padding: "8px 4px 4px",
                            borderBottom: "1px dashed #eee",
                            marginTop: "10px",
                        }}>
                            {formatDateKey(dateKey)}
                            <span style={{ fontWeight: "normal", marginLeft: "8px" }}>
                                ({groupedTodos[dateKey].length} việc)
                            </span>
                        </div>

                        {/* Các todo trong nhóm */}
                        {groupedTodos[dateKey].map(todo => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={toggleTodo}
                                onDelete={deleteTodo}
                                onEdit={editTodo}
                                onChangeTag={changeTag}
                                tagList={TAG_LIST}
                                // Props kéo thả (Level 3)
                                isDragging={draggingId === todo.id}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                            />
                        ))}
                    </div>
                ))
            )}

            {/* Footer đếm số việc */}
            {todos.length > 0 && (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "15px",
                    padding: "10px",
                    background: "#f9f9f9",
                    borderRadius: "4px",
                    fontSize: "14px",
                }}>
                    <span>🔵 {activeCount} việc chưa xong</span>
                    {completedCount > 0 && (
                        <span style={{ color: "#27ae60" }}>✅ {completedCount} việc đã xong</span>
                    )}
                </div>
            )}

            {/* Hướng dẫn nhỏ */}
            <p style={{ textAlign: "center", color: "#ccc", fontSize: "11px", marginTop: "16px" }}>
                💡 Kéo thả ☰ để sắp xếp · Double-click text để sửa · Dữ liệu tự lưu vào trình duyệt
            </p>
        </div>
    );
}

export default App;