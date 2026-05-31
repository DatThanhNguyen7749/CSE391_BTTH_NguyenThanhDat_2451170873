// ===== BIẾN TOÀN CỤC =====
var danhSachSV = [];
var indexDangSua = -1; // -1 nghĩa là đang thêm mới, không phải sửa


// ===== LẤY DỮ LIỆU KHI TẢI TRANG =====
function loadFromLocalStorage() {
    var data = localStorage.getItem("danhSachSinhVien");
    if (data != null) {
        // Đã có dữ liệu trong localStorage thì dùng luôn
        danhSachSV = JSON.parse(data);
        renderStudents();
    } else {
        // Chưa có thì đọc từ file data.json
        fetch("data.json")
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                danhSachSV = json;
                saveToLocalStorage();
                renderStudents();
            })
            .catch(function(err) {
                console.log("Lỗi đọc data.json:", err);
                renderStudents(); // render bảng trống
            });
    }
}

// ===== LƯU DỮ LIỆU XUỐNG LOCALSTORAGE =====
function saveToLocalStorage() {
    localStorage.setItem("danhSachSinhVien", JSON.stringify(danhSachSV));
}

// ===== RENDER BẢNG =====
function renderStudents() {
    var tbody = document.getElementById("tableBody");
    tbody.innerHTML = ""; // xóa hết nội dung cũ

    if (danhSachSV.length == 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Chưa có sinh viên nào</td></tr>';
        updateStatistics();
        return;
    }

    for (var i = 0; i < danhSachSV.length; i++) {
        var sv = danhSachSV[i];
        var row = "<tr>";
        row += "<td>" + sv.msv + "</td>";
        row += "<td>" + sv.hoTen + "</td>";
        row += "<td>" + sv.ngaySinh + "</td>";
        row += "<td>" + sv.lop + "</td>";
        row += "<td>" + sv.diem + "</td>";
        row += "<td>" + sv.email + "</td>";
        row += '<td><div class="d-flex gap-2">';
        row += '<button class="btn btn-warning btn-sm" onclick="bấmSua(' + i + ')">Sửa</button>';
        row += '<button class="btn btn-danger btn-sm" onclick="bấmXoa(' + i + ')">Xóa</button>';
        row += '</div></td>';
        row += "</tr>";
        tbody.innerHTML += row;
    }

    updateStatistics();
}

// ===== CẬP NHẬT THỐNG KÊ =====
function updateStatistics() {
    document.getElementById("tongSV").innerText = danhSachSV.length;

    if (danhSachSV.length == 0) {
        document.getElementById("diemTB").innerText = "0";
        return;
    }

    var tongDiem = 0;
    for (var i = 0; i < danhSachSV.length; i++) {
        tongDiem += parseFloat(danhSachSV[i].diem);
    }
    var trungBinh = (tongDiem / danhSachSV.length).toFixed(2);
    document.getElementById("diemTB").innerText = trungBinh;
}

// ===== HIỆN THÔNG BÁO =====
function hienThongBao(noiDung, loai) {
    var div = document.getElementById("thongBao");
    div.innerText = noiDung;
    div.className = "alert alert-" + loai;
    // Tự ẩn sau 3 giây
    setTimeout(function () {
        div.className = "alert d-none";
    }, 3000);
}

// ===== MỞ POPUP =====
function moForm() {
    document.getElementById("popupForm").classList.add("show");
}

// ===== ĐÓNG POPUP VÀ RESET FORM =====
function dongForm() {
    document.getElementById("popupForm").classList.remove("show");
    resetForm();
}

function resetForm() {
    document.getElementById("formSinhVien").reset();
    indexDangSua = -1;
    document.getElementById("tieuDeForm").innerText = "Thêm sinh viên";
    document.getElementById("btnLuu").innerText = "Lưu";
    document.getElementById("inputMSV").disabled = false;
}

// ===== SỰ KIỆN NÚT THÊM =====
document.getElementById("btnMoForm").onclick = function () {
    resetForm();
    moForm();
};

// ===== SỰ KIỆN ĐÓNG / HỦY =====
document.getElementById("btnDongForm").onclick = function () {
    dongForm();
};
document.getElementById("btnHuy").onclick = function () {
    dongForm();
};

// ===== SỰ KIỆN SUBMIT FORM (THÊM + SỬA) =====
document.getElementById("formSinhVien").onsubmit = function (e) {
    e.preventDefault(); // ngăn không cho trang reload

    // Lấy dữ liệu từ form
    var msv      = document.getElementById("inputMSV").value.trim();
    var hoTen    = document.getElementById("inputHoTen").value.trim();
    var ngaySinh = document.getElementById("inputNgaySinh").value;
    var lop      = document.getElementById("inputLop").value.trim();
    var diem     = parseFloat(document.getElementById("inputDiem").value);
    var email    = document.getElementById("inputEmail").value.trim();

    // Tạo object sinh viên
    var svMoi = {
        msv: msv,
        hoTen: hoTen,
        ngaySinh: ngaySinh,
        lop: lop,
        diem: diem,
        email: email
    };

    if (indexDangSua == -1) {
        // === THÊM MỚI ===
        // Kiểm tra MSV bị trùng không
        var trung = false;
        for (var i = 0; i < danhSachSV.length; i++) {
            if (danhSachSV[i].msv == msv) {
                trung = true;
                break;
            }
        }
        if (trung) {
            hienThongBao("Mã sinh viên đã tồn tại!", "danger");
            return;
        }
        danhSachSV.push(svMoi);
        hienThongBao("Thêm sinh viên thành công!", "success");
    } else {
        // === CẬP NHẬT ===
        danhSachSV[indexDangSua] = svMoi;
        hienThongBao("Cập nhật sinh viên thành công!", "success");
    }

    saveToLocalStorage();
    renderStudents();
    dongForm();
};

// ===== NÚT SỬA =====
function bấmSua(index) {
    var sv = danhSachSV[index];

    // Đưa dữ liệu lên form
    document.getElementById("inputMSV").value      = sv.msv;
    document.getElementById("inputHoTen").value    = sv.hoTen;
    document.getElementById("inputNgaySinh").value = sv.ngaySinh;
    document.getElementById("inputLop").value      = sv.lop;
    document.getElementById("inputDiem").value     = sv.diem;
    document.getElementById("inputEmail").value    = sv.email;

    // Đổi tiêu đề và nút
    document.getElementById("tieuDeForm").innerText = "Sửa sinh viên";
    document.getElementById("btnLuu").innerText     = "Cập nhật";
    document.getElementById("inputMSV").disabled   = true; // không cho sửa MSV

    indexDangSua = index;
    moForm();
}

// ===== NÚT XÓA =====
function bấmXoa(index) {
    var sv = danhSachSV[index];
    var xacNhan = confirm("Bạn có chắc muốn xóa sinh viên \"" + sv.hoTen + "\" không?");
    if (xacNhan) {
        danhSachSV.splice(index, 1);
        saveToLocalStorage();
        renderStudents();
        hienThongBao("Đã xóa sinh viên thành công!", "warning");
    }
}

// ===== KHỞI ĐỘNG TRANG =====
loadFromLocalStorage();