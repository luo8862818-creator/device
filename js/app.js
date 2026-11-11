
/* =========================
   1. 模拟设备数据
========================= */

const devices = [
  {
    id: 1,
    name: "AOA-001",
    mac: "AA:BB:CC:DD:EE:01",
    room: "101",
    status: "online",
  },
  {
    id: 2,
    name: "AOA-002",
    mac: "AA:BB:CC:DD:EE:02",
    room: "102",
    status: "offline",
  },
  {
    id: 3,
    name: "AOA-003",
    mac: "AA:BB:CC:DD:EE:03",
    room: "103",
    status: "online",
  },
];

/* =========================
   2. 获取页面 DOM 元素
========================= */

const deviceTableBody = document.getElementById("deviceTableBody");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortFilter = document.getElementById("sortFilter");

const addDeviceBtn = document.getElementById("addDeviceBtn");
const deviceModal = document.getElementById("deviceModal");
const cancelBtn = document.getElementById("cancelBtn");

const deviceForm = document.getElementById("deviceForm");

const deviceName = document.getElementById("deviceName");
const deviceMac = document.getElementById("deviceMac");
const deviceRoom = document.getElementById("deviceRoom");
const deviceStatus = document.getElementById("deviceStatus");

const totalDevices = document.getElementById("totalDevices");
const onlineDevices = document.getElementById("onlineDevices");
const offlineDevices = document.getElementById("offlineDevices");

const macError = document.getElementById("macError");
const nameError = document.getElementById("nameError");
const roomError = document.getElementById("roomError");

// null 表示新增模式，数字表示正在编辑的设备 ID
let editingDeviceId = null;

/* =========================
   3. 渲染设备列表
========================= */

function renderDevices(deviceList = devices) {
  const deviceCount = document.getElementById("deviceCount");

  deviceCount.textContent = `共找到 ${deviceList.length} 台设备`;

  deviceTableBody.innerHTML = "";

  if (deviceList.length === 0) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">
        暂无符合条件的设备
      </td>
    `;

    deviceTableBody.appendChild(tr);
    return;
  }

  deviceList.forEach(function (device) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>
        <button class="edit-btn" data-id="${device.id}">
          编辑
        </button>
        <button class="delete-btn" data-id="${device.id}">
          删除
        </button>
      </td>
    `;

    const cells = tr.querySelectorAll("td");

    cells[0].textContent = device.id;

    cells[1].textContent = device.name;
    cells[1].className = "device-name";
    cells[1].dataset.id = device.id;

    cells[2].textContent = device.mac;
    cells[3].textContent = device.room;

    const statusSpan = document.createElement("span");

    if (device.status === "online") {
      statusSpan.textContent = "在线";
      statusSpan.className = "status-online";
    } else {
      statusSpan.textContent = "离线";
      statusSpan.className = "status-offline";
    }

    cells[4].appendChild(statusSpan);

    deviceTableBody.appendChild(tr);
  });
}

/* =========================
   4. 更新设备统计
========================= */

function updateStats() {
  const total = devices.length;

  const online = devices.filter(function (device) {
    return device.status === "online";
  }).length;

  const offline = devices.filter(function (device) {
    return device.status === "offline";
  }).length;

  totalDevices.textContent = total;
  onlineDevices.textContent = online;
  offlineDevices.textContent = offline;
}

/* =========================
   5. 搜索、筛选和排序
========================= */

function filterDevices() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filteredDevices = devices.filter(function (device) {
    const matchKeyword =
      device.name.toLowerCase().includes(keyword) ||
      device.mac.toLowerCase().includes(keyword) ||
      device.room.toLowerCase().includes(keyword);

    const matchStatus =
      selectedStatus === "all" || device.status === selectedStatus;

    return matchKeyword && matchStatus;
  });

  const sortType = sortFilter.value;

  filteredDevices.sort(function (a, b) {
    if (sortType === "id-asc") {
      return a.id - b.id;
    }

    if (sortType === "id-desc") {
      return b.id - a.id;
    }

    if (sortType === "name-asc") {
      return a.name.localeCompare(b.name);
    }

    if (sortType === "name-desc") {
      return b.name.localeCompare(a.name);
    }

    return 0;
  });

  renderDevices(filteredDevices);
  updateStats();
  updateSortIndicators();
}

searchInput.addEventListener("input", filterDevices);
statusFilter.addEventListener("change", filterDevices);
sortFilter.addEventListener("change", filterDevices);

const sortById = document.getElementById("sortById");
const sortByName = document.getElementById("sortByName");

sortById.addEventListener("click", function () {
  if (sortFilter.value === "id-asc") {
    sortFilter.value = "id-desc";
  } else {
    sortFilter.value = "id-asc";
  }

  filterDevices();
});

sortByName.addEventListener("click", function () {
  if (sortFilter.value === "name-asc") {
    sortFilter.value = "name-desc";
  } else {
    sortFilter.value = "name-asc";
  }

  filterDevices();
});

/* =========================
   6. 新增设备弹窗
========================= */

addDeviceBtn.addEventListener("click", function () {
  editingDeviceId = null;

  deviceForm.reset();
  clearFormErrors();

  deviceModal.querySelector("h2").textContent = "新增设备";
  deviceModal.style.display = "flex";
});

/* =========================
   7. 取消弹窗
========================= */

cancelBtn.addEventListener("click", function () {
  deviceModal.style.display = "none";
  deviceForm.reset();

  editingDeviceId = null;
  clearFormErrors();
});

/* =========================
   8. 新增和编辑设备保存
========================= */

deviceForm.addEventListener("submit", function (event) {
  // 阻止表单默认提交，避免页面刷新
  event.preventDefault();

  const name = deviceName.value.trim();
  const mac = deviceMac.value.trim();
  const room = deviceRoom.value.trim();
  const status = deviceStatus.value;

  // 清除之前的错误
  clearFormErrors();

  // 统一记录验证结果
  let isValid = true;

  // 1. 验证设备名称
  if (name.length < 2 || name.length > 30) {
    showFieldError(
      deviceName,
      nameError,
      "设备名称必须为 2～30 个字符"
    );
    isValid = false;
  }

  // 2. 验证房间号
  const roomRegex = /^\d{1,6}$/;

  if (!roomRegex.test(room)) {
    showFieldError(
      deviceRoom,
      roomError,
      "房间号只能是 1～6 位数字"
    );
    isValid = false;
  }

  // 3. 验证 MAC 格式
  const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

  if (!macRegex.test(mac)) {
    showFieldError(
      deviceMac,
      macError,
      "MAC 地址格式错误，例如 AA:BB:CC:DD:EE:FF"
    );
    isValid = false;
  } else {
    // 4. MAC 格式正确后，检查重复
    const macExists = devices.some(function (device) {
      return (
        device.mac.toLowerCase() === mac.toLowerCase() &&
        device.id !== editingDeviceId
      );
    });

    if (macExists) {
      showFieldError(
        deviceMac,
        macError,
        "该 MAC 地址已经存在"
      );
      isValid = false;
    }
  }

  // 所有字段检查完毕，再决定是否保存
  if (!isValid) {
    return;
  }

  if (editingDeviceId === null) {
    // ===== 新增设备 =====

    const ids = devices.map(function (device) {
      return device.id;
    });

    const maxId = devices.length > 0 ? Math.max(...ids) : 0;

    const newDevice = {
      id: maxId + 1,
      name: name,
      mac: mac,
      room: room,
      status: status,
    };

    devices.push(newDevice);

    console.log("新增设备：", newDevice);
    alert("设备新增成功！");
  } else {
    // ===== 编辑设备 =====

    const device = devices.find(function (item) {
      return item.id === editingDeviceId;
    });

    if (!device) {
      alert("设备不存在！");
      return;
    }

    device.name = name;
    device.mac = mac;
    device.room = room;
    device.status = status;

    console.log("修改设备：", device);
    alert("设备修改成功！");
  }

  filterDevices();

  deviceModal.style.display = "none";
  deviceForm.reset();

  editingDeviceId = null;
  clearFormErrors();
});

/* =========================
   9. 删除设备
========================= */

deviceTableBody.addEventListener("click", function (event) {
  const deleteBtn = event.target.closest(".delete-btn");

  if (!deleteBtn) {
    return;
  }

  const deviceId = Number(deleteBtn.dataset.id);

  const index = devices.findIndex(function (device) {
    return device.id === deviceId;
  });

  if (index === -1) {
    alert("设备不存在！");
    return;
  }

  const confirmed = confirm("确定删除这台设备吗？");

  if (!confirmed) {
    return;
  }

  devices.splice(index, 1);

  filterDevices();

  alert("设备删除成功！");
});

/* =========================
   10. 编辑设备
========================= */

deviceTableBody.addEventListener("click", function (event) {
  const editBtn = event.target.closest(".edit-btn");

  if (!editBtn) {
    return;
  }

  const deviceId = Number(editBtn.dataset.id);

  const device = devices.find(function (item) {
    return item.id === deviceId;
  });

  if (!device) {
    alert("设备不存在！");
    return;
  }

  editingDeviceId = deviceId;

  deviceName.value = device.name;
  deviceMac.value = device.mac;
  deviceRoom.value = device.room;
  deviceStatus.value = device.status;

  clearFormErrors();

  deviceModal.querySelector("h2").textContent = "编辑设备";
  deviceModal.style.display = "flex";
});

/* =========================
   11. 排序箭头
========================= */

function updateSortIndicators() {
  const sortType = sortFilter.value;

  sortById.textContent = "设备ID ↕";
  sortByName.textContent = "设备名称 ↕";

  if (sortType === "id-asc") {
    sortById.textContent = "设备ID ↑";
  } else if (sortType === "id-desc") {
    sortById.textContent = "设备ID ↓";
  } else if (sortType === "name-asc") {
    sortByName.textContent = "设备名称 ↑";
  } else if (sortType === "name-desc") {
    sortByName.textContent = "设备名称 ↓";
  }
}

/* =========================
   12. 设备详情弹窗
========================= */

const detailModal = document.getElementById("detailModal");
const closeDetailBtn = document.getElementById("closeDetailBtn");

deviceTableBody.addEventListener("click", function (event) {
  const nameCell = event.target.closest(".device-name");

  if (!nameCell) {
    return;
  }

  const deviceId = Number(nameCell.dataset.id);

  const device = devices.find(function (item) {
    return item.id === deviceId;
  });

  if (!device) {
    alert("设备不存在！");
    return;
  }

  document.getElementById("detailId").textContent = device.id;
  document.getElementById("detailName").textContent = device.name;
  document.getElementById("detailMac").textContent = device.mac;
  document.getElementById("detailRoom").textContent = device.room;

  document.getElementById("detailStatus").textContent =
    device.status === "online" ? "在线" : "离线";

  detailModal.style.display = "flex";
});

closeDetailBtn.addEventListener("click", function () {
  detailModal.style.display = "none";
});

/* =========================
   13. Esc 关闭弹窗
========================= */

// 不注册遮罩点击关闭事件

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") {
    return;
  }

  if (deviceModal.style.display === "flex") {
    deviceModal.style.display = "none";
    deviceForm.reset();

    editingDeviceId = null;
    clearFormErrors();
  }

  if (detailModal.style.display === "flex") {
    detailModal.style.display = "none";
  }
});

/* =========================
   14. 表单错误提示
========================= */

function clearMacError() {
  macError.style.display = "none";
  macError.textContent = "";
  deviceMac.classList.remove("input-error");
}

function showFieldError(input, errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.display = "block";
  input.classList.add("input-error");
}

function clearFieldError(input, errorElement) {
  errorElement.textContent = "";
  errorElement.style.display = "none";
  input.classList.remove("input-error");
}

// 一次性清除全部错误提示
function clearFormErrors() {
  clearMacError();
  clearFieldError(deviceName, nameError);
  clearFieldError(deviceRoom, roomError);
}

// 用户重新输入时，清除对应字段的旧错误
deviceMac.addEventListener("input", clearMacError);

deviceName.addEventListener("input", function () {
  clearFieldError(deviceName, nameError);
});

deviceRoom.addEventListener("input", function () {
  clearFieldError(deviceRoom, roomError);
});

/* =========================
   15. 页面初始化
========================= */

renderDevices();
updateStats();
updateSortIndicators();
