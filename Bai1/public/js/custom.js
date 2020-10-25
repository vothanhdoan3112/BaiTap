//Phân Trang Cho Table
//<![CDATA[
function Pager(tableName, itemsPerPage) {
    this.tableName = tableName;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.pages = 0;
    this.inited = false;

    this.showRecords = function (from, to) {
        var rows = document.getElementById(tableName).rows;
        for (var i = 1; i < rows.length; i++) {
            if (i < from || i > to)
                rows[i].style.display = 'none';
            else
                rows[i].style.display = '';
        }
    }

    this.showPage = function (pageNumber) {
        if (!this.inited) {
            alert("not inited");
            return;
        }
        var oldPageAnchor = document.getElementById('pg' + this.currentPage);
        oldPageAnchor.className = 'pg-normal';

        this.currentPage = pageNumber;
        var newPageAnchor = document.getElementById('pg' + this.currentPage);
        newPageAnchor.className = 'pg-selected';

        var from = (pageNumber - 1) * itemsPerPage + 1;
        var to = from + itemsPerPage - 1;
        this.showRecords(from, to);
    }

    this.prev = function () {
        if (this.currentPage > 1)
            this.showPage(this.currentPage - 1);
    }

    this.next = function () {
        if (this.currentPage < this.pages) {
            this.showPage(this.currentPage + 1);
        }
    }

    this.init = function () {
        var rows = document.getElementById(tableName).rows;
        var records = (rows.length - 1);
        this.pages = Math.ceil(records / itemsPerPage);
        this.inited = true;
    }
    this.showPageNav = function (pagerName, positionId) {
        if (!this.inited) {
            alert("not inited");
            return;
        }
        var element = document.getElementById(positionId);

        var pagerHtml = '<span onclick="' + pagerName +
            '.prev();" class="pg-normal">&#171</span> | ';
        for (var page = 1; page <= this.pages; page++)
            pagerHtml += '<span id="pg' + page + '" class="pg-normal" onclick="' + pagerName +
                '.showPage(' + page + ');">' + page + '</span> | ';
        pagerHtml += '<span onclick="' + pagerName + '.next();" class="pg-normal">&#187;</span>';

        element.innerHTML = pagerHtml;
    }
}
//]]>
//loc du lieu
function myFunction() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
//Lọc Table
function sortTable() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("myTable");
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[0];
            y = rows[i + 1].getElementsByTagName("TD")[0];
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            swal("Thành Công!", "Bạn Đã Lọc Thành Công", "success");
        }
    }
}

//Thời Gian
function time() {
    var today = new Date();
    var weekday = new Array(7);
    weekday[0] = "Chủ Nhật";
    weekday[1] = "Thứ Hai";
    weekday[2] = "Thứ Ba";
    weekday[3] = "Thứ Tư";
    weekday[4] = "Thứ Năm";
    weekday[5] = "Thứ Sáu";
    weekday[6] = "Thứ Bảy";
    var day = weekday[today.getDay()];
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    nowTime = h + ":" + m + ":" + s;
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = day + ', ' + dd + '/' + mm + '/' + yyyy;
    tmp = '<i class="fa fa-clock-o" aria-hidden="true"></i> <span class="date">' + today + ' | ' + nowTime +
        '</span>';
    document.getElementById("clock").innerHTML = tmp;
    clocktime = setTimeout("time()", "1000", "Javascript");

    function checkTime(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
}


$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

//////////////////
function loadTable(socket) {
    socket.emit('RequestAllSinhVien');
}
function delRow(){
    $("#myTable > tbody").empty();
}
function refreshTable() {
    const socket = io("localhost:3000");
    loadTable(socket)
    delRow();
    socket.on('getAllSinhVien', function (items) {
        console.log(items);
        items.forEach(function (item) {           
            addItem(item);
        });
    });
    
}
$(document).ready(function () {
    const socket = io("localhost:3000");
    $('#addNewStudent').click(function () {
        $("#addNewStudent" ).prop( "disabled", true );
        var maSinhVien = $("#maSinhVien").val();
        var tenSinhVien = $("#tenSinhVien").val();
        var namSinh = $("#namSinh").val();




        if (maSinhVien == '' || tenSinhVien == '' || namSinh == '') {
            swal("Lỗi!", "Không được để trống", "error");
            $("#addNewStudent" ).prop( "disabled", false );
        } else if (maSinhVien.length != 8) {
            swal("Lỗi!", "Sai định dạng mã sinh viên", "error");
            $("#addNewStudent" ).prop( "disabled", false );
        } else {
            if (!window.FileReader) {
                $("#addNewStudent" ).prop( "disabled", false );
                swal('FileReader API is not supported by your browser.',"error");         
            }
            var $i = $('#avata'), // Put file input ID here
                input = $i[0]; // Getting the element from jQuery
            if (input.files && input.files[0]) {
                file = input.files[0]; // The file
                fr = new FileReader(); // FileReader instance
                fr.onload = function () {
                    var sv = {
                        maSinhVien: maSinhVien,
                        tenSinhVien: tenSinhVien,
                        namSinh: namSinh,
                        avata: maSinhVien + '.jpg',
                        img64: fr.result
                    };
                    socket.emit('addStudent', sv);
                };

                fr.readAsDataURL(file);
            } else {
                // Handle errors here
                alert("File not selected or browser incompatible.");
                $("#addNewStudent" ).prop( "disabled", false );
            }


        }
    });
    socket.on('IsAddStudentSuccess', function (flag) {
        console.log(flag)
        if (flag == true) {
            swal("Thành Công", "Thêm Sinh Viên Mới Thành Công", "success");
           
            refreshTable();
            $("#ModalForm").modal('hide');
            $("#addNewStudent" ).prop( "disabled", false );
        } else if (flag == false) {
            swal("Lỗi", "Thêm Thất Bại", "error");
            $("#addNewStudent" ).prop( "disabled", false );

        }
    });


    //sua

    $(document).on("click", ".edit", function () {
        $("#maSinhVienE").val($(this).parents("tr").find("td[name=maSinhVien]").text());
        $("#tenSinhVienE").val($(this).parents("tr").find("td[name=tenSinhVien]").text());
        $("#namSinhE").val($(this).parents("tr").find("td[name=namSinh]").text());
        $("#previewE").val($(this).parents("tr").find("td[name=avata]").attr("src"));


    });
    $('#editStudent').click(function () {
        $("#editStudent" ).prop( "disabled", true );
        var maSinhVien = $("#maSinhVienE").val();
        var tenSinhVien = $("#tenSinhVienE").val();
        var namSinh = $("#namSinhE").val();


        if (maSinhVien == '' || tenSinhVien == '' || namSinh == '') {
            swal("Lỗi!", "Không được để trống", "error");
            $("#editStudent" ).prop( "disabled", false );
        } else if (maSinhVien.length != 8) {
            swal("Lỗi!", "Sai định dạng mã sinh viên", "error");
            $("#editStudent" ).prop( "disabled", false );
        } else {
            if (!window.FileReader) {
                $("#editStudent" ).prop( "disabled", false );
                swal('FileReader API is not supported by your browser.',"error");
            }
            var $i = $('#avataE'), // Put file input ID here
                input = $i[0]; // Getting the element from jQuery
            if (input.files && input.files[0]) {
                file = input.files[0]; // The file
                fr = new FileReader(); // FileReader instance
                fr.onload = function () {

                    var sv = {
                        maSinhVien: maSinhVien,
                        tenSinhVien: tenSinhVien,
                        namSinh: namSinh,
                        avata: maSinhVien +'.jpg',
                        img64: fr.result
                    };
                    socket.emit('suaSinhVien', sv);
                };

                fr.readAsDataURL(file);
            } else {
                // Handle errors here
                alert("File not selected or browser incompatible.");
                $("#editStudent" ).prop( "disabled", false );
            }
            socket.on('IsUpdStudentSuccess', function (flag) {
                if (flag) {
                    swal("Thành Công!", "Cập nhật Thành Công", "success");
                
                    refreshTable();
                    $("#ModalEditForm").modal('hide');
                    $("#editStudent" ).prop( "disabled", false );
                } else {
                    $("#editStudent" ).prop( "disabled", false );
                }
            });
        }
    });
    //xoa
    $(document).on("click", ".delete", function () {
        var maSv = $(this).parents("tr").find("td[name=maSinhVien]").text();
        socket.emit('xoaSinhVien', maSv.trim());
        socket.on('IsDelStudentSuccess', function (flag) {
            if (flag) {
                swal("Thành Công!", "Bạn Đã Xóa Thành Công", "success");      
                refreshTable();
            } else {
            }
        });


    });
});

function PreviewImage() {
    var oFReader = new FileReader();
    oFReader.readAsDataURL(document.getElementById("avata").files[0]);

    oFReader.onload = function (oFREvent) {
        document.getElementById("preview").src = oFREvent.target.result;
    };
}
function PreviewImageE() {
    var oFReader = new FileReader();
    oFReader.readAsDataURL(document.getElementById("avataE").files[0]);

    oFReader.onload = function (oFREvent) {
        document.getElementById("previewE").src = oFREvent.target.result;
    };
}
function addItem(sv) {
    var actions = '<a class="edit" title="Sửa" data-toggle="modal" data-target="#ModalEditForm""><i class="fa fa-pencil" aria-hidden="true"></i></a>' +
        '<a class="delete" title="Xóa" data-toggle="tooltip"><i class="fa fa-trash-o" aria-hidden="true"></i></a>';
        $("#dataTable").remove();
    var row = '<tr>' +
        '<td name="maSinhVien">' + sv.maSinhVien + '</td>' +
        '<td name="tenSinhVien">' + sv.tenSinhVien + '</td>' +
        '<td name="namSinh">' + sv.namSinh + '</td>' +
        '<td><img name="avata" style="width: 100px; height: 100px;" src="https://images3112.s3.ap-southeast-1.amazonaws.com/' + sv.avata + '"/></td>' +
        '<td>' + actions + '</td>' +
        '</tr>';
    $("table").append(row);
    $('[data-toggle="tooltip"]').tooltip();
}