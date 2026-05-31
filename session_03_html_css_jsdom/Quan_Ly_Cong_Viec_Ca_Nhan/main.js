var danhSachCV = [];
var dangSua = -1;

khoiDong();

function khoiDong() {
    var duLieu = localStorage.getItem('tasks');
    if (duLieu) {
        danhSachCV = JSON.parse(duLieu);
    }
    hienThiDanhSach();
    capNhatThongKe();
}

function hienThiDanhSach() {
    var khung = document.getElementById('danhsach');
    khung.innerHTML = '';

    if (danhSachCV.length === 0) {
        khung.innerHTML = '<div class="empty-message">Chưa có công việc nào</div>';
        return;
    }

    for (var i = 0; i < danhSachCV.length; i++) {
        var cv = danhSachCV[i];
        var the = document.createElement('div');

        if (cv.xong) {
            the.className = 'task-card completed';
        } else {
            the.className = 'task-card';
        }

        var tenUuTien = '';
        if (cv.uuTien === 'high') tenUuTien = 'Cao';
        if (cv.uuTien === 'medium') tenUuTien = 'Trung bình';
        if (cv.uuTien === 'low') tenUuTien = 'Thấp';

        var nutTrangThai = '';
        if (cv.xong) {
            nutTrangThai = '<button class="btn-undo" onclick="doiTrangThai(' + i + ')">Hoàn tác</button>';
        } else {
            nutTrangThai = '<button class="btn-complete" onclick="doiTrangThai(' + i + ')">Hoàn thành</button>';
        }

        the.innerHTML =
            '<div class="task-header">' +
            '<span class="task-title">' + cv.tieuDe + '</span>' +
            '<span class="task-priority ' + cv.uuTien + '">' + tenUuTien + '</span>' +
            '</div>' +
            '<div class="task-desc">' + cv.moTa + '</div>' +
            '<div class="task-deadline">Hạn: ' + cv.hanChot + '</div>' +
            '<div class="task-actions">' +
            nutTrangThai +
            '<button class="btn-edit" onclick="suaCV(' + i + ')">Sửa</button>' +
            '<button class="btn-delete" onclick="xoaCV(' + i + ')">Xóa</button>' +
            '</div>';

        khung.appendChild(the);
    }
}

function moForm() {
    dangSua = -1;
    document.getElementById('tieudeForm').textContent = 'Thêm Công Việc';
    xoaForm();
    document.getElementById('popup').classList.add('show');
}

function dongForm() {
    document.getElementById('popup').classList.remove('show');
    xoaForm();
}

function xoaForm() {
    document.getElementById('tieuDe').value = '';
    document.getElementById('moTa').value = '';
    document.getElementById('hanChot').value = '';
    document.getElementById('mucUuTien').value = 'low';
    dangSua = -1;
}

function luuCongViec(e) {
    e.preventDefault();

    var congViec = {
        tieuDe: document.getElementById('tieuDe').value,
        moTa: document.getElementById('moTa').value,
        hanChot: document.getElementById('hanChot').value,
        uuTien: document.getElementById('mucUuTien').value,
        xong: false
    };

    if (dangSua === -1) {
        danhSachCV.push(congViec);
        hienThongBao('Thêm công việc thành công!');
    } else {
        congViec.xong = danhSachCV[dangSua].xong;
        danhSachCV[dangSua] = congViec;
        hienThongBao('Cập nhật công việc thành công!');
    }

    localStorage.setItem('tasks', JSON.stringify(danhSachCV));
    hienThiDanhSach();
    capNhatThongKe();
    dongForm();
}

function suaCV(viTri) {
    dangSua = viTri;
    document.getElementById('tieudeForm').textContent = 'Sửa Công Việc';

    var cv = danhSachCV[viTri];
    document.getElementById('tieuDe').value = cv.tieuDe;
    document.getElementById('moTa').value = cv.moTa;
    document.getElementById('hanChot').value = cv.hanChot;
    document.getElementById('mucUuTien').value = cv.uuTien;

    document.getElementById('popup').classList.add('show');
}

function xoaCV(viTri) {
    var xacNhan = confirm('Bạn có chắc muốn xóa công việc này?');
    if (xacNhan) {
        danhSachCV.splice(viTri, 1);
        localStorage.setItem('tasks', JSON.stringify(danhSachCV));
        hienThiDanhSach();
        capNhatThongKe();
        hienThongBao('Xóa công việc thành công!');
    }
}

function doiTrangThai(viTri) {
    if (danhSachCV[viTri].xong) {
        danhSachCV[viTri].xong = false;
        hienThongBao('Đã đánh dấu chưa hoàn thành!');
    } else {
        danhSachCV[viTri].xong = true;
        hienThongBao('Đã hoàn thành công việc!');
    }

    localStorage.setItem('tasks', JSON.stringify(danhSachCV));
    hienThiDanhSach();
    capNhatThongKe();
}

function capNhatThongKe() {
    var tong = danhSachCV.length;
    var daXong = 0;

    for (var i = 0; i < danhSachCV.length; i++) {
        if (danhSachCV[i].xong) {
            daXong = daXong + 1;
        }
    }

    document.getElementById('tongCV').textContent = tong;
    document.getElementById('daXong').textContent = daXong;
    document.getElementById('chuaXong').textContent = tong - daXong;
}

function hienThongBao(noiDung) {
    var thongBao = document.getElementById('thongbao');
    thongBao.textContent = noiDung;
    thongBao.className = 'notification success';

    setTimeout(function () {
        thongBao.className = 'notification';
    }, 3000);
}