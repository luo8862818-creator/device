
/* ==================================================
   DeviceHub - 函数拆分与职责设计
   本次只整理函数结构，不新增业务功能。
================================================== */


/* ==================================================
   1. 模拟设备数据
================================================== */

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


/* ==================================================
   2. 获取页面 DOM 元素
================================================== */

// 设备列表与筛选
const deviceTableBody = document.getElementById("deviceTableBody");
const deviceCount = document.getElementById("deviceCount");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortFilter = document.getElementById("sortFilter");
const sortById = document.getElementById("sortById");
const sortByName = document.getElementById("sortByName");

// 新增/编辑弹窗与表单
const addDeviceBtn = document.getElementById("addDeviceBtn");
const deviceModal = document.getElementById("deviceModal");
const cancelBtn = document.getElementById("cancelBtn");
const deviceForm = document.getElementById("deviceForm");
const deviceName = document.getElementById("deviceName");
const deviceMac = document.getElementById("deviceMac");
const deviceRoom = document.getElementById("deviceRoom");
const deviceStatus = document.getElementById("deviceStatus");

// 设备统计
const totalDevices = document.getElementById("totalDevices");
const onlineDevices = document.getElementById("onlineDevices");
const offlineDevices = document.getElementById("offlineDevices");

// 表单错误提示
const macError = document.getElementById("macError");
const nameError = document.getElementById("nameError");
const roomError = document.getElementById("roomError");

// 设备详情弹窗
const detailModal = document.getElementById("detailModal");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const detailId = document.getElementById("detailId");
const detailName = document.getElementById("detailName");
const detailMac = document.getElementById("detailMac");
const detailRoom = document.getElementById("detailRoom");
const detailStatus = document.getElementById("detailStatus");

// null 表示新增模式，数字表示正在编辑的设备 ID
let editingDeviceId = null;


/* ==================================================
   3. 设备数据管理
   这一组函数只负责操作 devices 数据，不操作 DOM。
================================================== */

/**
 * 根据设备 ID 查找设备。
 * 找到时返回设备对象，找不到时返回 undefined。
 */
function findDevice(deviceId) {
  return devices.find(function (device) {
    return device.id === deviceId;
  });
}

/**
 * 新增设备。
 * 负责生成 ID 并将设备加入数组，返回新设备对象。
 */
function addDevice(deviceData) {
  const ids = devices.map(function (device) {
    return device.id;
  });

  const maxId = devices.length > 0 ? Math.max(...ids) : 0;

  const newDevice = {
    id: maxId + 1,
    name: deviceData.name,
    mac: deviceData.mac,
    room: deviceData.room,
    status: deviceData.status,
  };

  devices.push(newDevice);

  return newDevice;
}

/**
 * 修改设备。
 * 修改成功返回 true，设备不存在返回 false。
 */
function updateDevice(deviceId, deviceData) {
  const device = findDevice(deviceId);

  if (!device) {
    return false;
  }

  device.name = deviceData.name;
  device.mac = deviceData.mac;
  device.room = deviceData.room;
  device.status = deviceData.status;

  return true;
}

/**
 * 删除设备。
 * 删除成功返回 true，设备不存在返回 false。
 */
function deleteDevice(deviceId) {
  const index = devices.findIndex(function (device) {
    return device.id === deviceId;
  });

  if (index === -1) {
    return false;
  }

  devices.splice(index, 1);

  return true;
}


/* ==================================================
   4. 页面渲染与统计
   这一组函数只负责把数据展示到页面。
================================================== */

/**
 * 根据传入的设备数组渲染表格。
 */
function renderDevices(deviceList = devices) {
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

/**
 * 更新设备统计数字。
 * 统计范围仍然是全部设备，不受搜索和筛选条件影响。
 */
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

/**
 * 更新表格标题中的排序箭头。
 */
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


/* ==================================================
   5. 搜索、筛选与排序
   这一组函数负责处理设备数组，不直接操作表格 DOM。
================================================== */

/**
 * 根据搜索关键词和状态条件筛选设备。
 * 返回筛选后的新数组。
 */
function getFilteredDevices() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  return devices.filter(function (device) {
    const matchKeyword =
      device.name.toLowerCase().includes(keyword) ||
      device.mac.toLowerCase().includes(keyword) ||
      device.room.toLowerCase().includes(keyword);

    const matchStatus =
      selectedStatus === "all" || device.status === selectedStatus;

    return matchKeyword && matchStatus;
  });
}

/**
 * 根据当前排序规则返回排序后的新数组。
 * 使用 [...deviceList]，避免 sort() 修改传入的原数组。
 */
function sortDevices(deviceList) {
  const sortType = sortFilter.value;

  return [...deviceList].sort(function (a, b) {
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
}

/**
 * 统一刷新设备列表。
 * 负责协调筛选、排序、渲染和统计更新。
 */
function refreshDeviceList() {
  const filteredDevices = getFilteredDevices();
  const sortedDevices = sortDevices(filteredDevices);

  renderDevices(sortedDevices);
  updateStats();
  updateSortIndicators();
}


/* ==================================================
   6. 新增/编辑弹窗管理
================================================== */

/**
 * 打开新增设备弹窗。
 */
function openAddDeviceModal() {
  editingDeviceId = null;

  deviceForm.reset();
  clearFormErrors();

  deviceModal.querySelector("h2").textContent = "新增设备";
  deviceModal.style.display = "flex";
}

/**
 * 打开编辑设备弹窗，并将设备数据填入表单。
 */
function openEditDeviceModal(deviceId) {
  const device = findDevice(deviceId);

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
}

/**
 * 关闭新增/编辑弹窗并清理表单状态。
 */
function closeDeviceModal() {
  deviceModal.style.display = "none";
  deviceForm.reset();

  editingDeviceId = null;
  clearFormErrors();
}


/* ==================================================
   7. 设备详情弹窗管理
================================================== */

/**
 * 打开设备详情弹窗。
 */
function openDetailModal(deviceId) {
  const device = findDevice(deviceId);

  if (!device) {
    alert("设备不存在！");
    return;
  }

  detailId.textContent = device.id;
  detailName.textContent = device.name;
  detailMac.textContent = device.mac;
  detailRoom.textContent = device.room;
  detailStatus.textContent =
    device.status === "online" ? "在线" : "离线";

  detailModal.style.display = "flex";
}

/**
 * 关闭设备详情弹窗。
 */
function closeDetailModal() {
  detailModal.style.display = "none";
}


/* ==================================================
   8. 表单错误提示
   本次保留原有验证规则，不提前拆分字段验证函数。
================================================== */

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

/**
 * 一次性清除全部表单错误。
 */
function clearFormErrors() {
  clearMacError();
  clearFieldError(deviceName, nameError);
  clearFieldError(deviceRoom, roomError);
}


/* ==================================================
   9. 表单提交处理
   负责读取表单、验证数据、调用数据管理函数、
   显示结果并关闭弹窗。
================================================== */

function handleDeviceSubmit(event) {
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

  const deviceData = {
    name: name,
    mac: mac,
    room: room,
    status: status,
  };

  if (editingDeviceId === null) {
    // 新增模式：调用数据管理函数
    const newDevice = addDevice(deviceData);

    console.log("新增设备：", newDevice);
    alert("设备新增成功！");
  } else {
    // 编辑模式：调用数据管理函数
    const success = updateDevice(editingDeviceId, deviceData);

    if (!success) {
      alert("设备不存在！");
      return;
    }

    console.log("修改设备：", findDevice(editingDeviceId));
    alert("设备修改成功！");
  }

  refreshDeviceList();
  closeDeviceModal();
}


/* ==================================================
   10. 设备列表事件处理
   tbody 只保留一个 click 事件委托入口。
================================================== */

function handleDeviceTableClick(event) {
  // 1. 删除设备
  const deleteBtn = event.target.closest(".delete-btn");

  if (deleteBtn) {
    const deviceId = Number(deleteBtn.dataset.id);

    // 先确认用户是否真的要删除
    const confirmed = confirm("确定删除这台设备吗？");

    if (!confirmed) {
      return;
    }

    const success = deleteDevice(deviceId);

    if (!success) {
      alert("设备不存在！");
      return;
    }

    refreshDeviceList();
    alert("设备删除成功！");
    return;
  }

  // 2. 编辑设备
  const editBtn = event.target.closest(".edit-btn");

  if (editBtn) {
    const deviceId = Number(editBtn.dataset.id);
    openEditDeviceModal(deviceId);
    return;
  }

  // 3. 点击设备名称，打开详情
  const nameCell = event.target.closest(".device-name");

  if (nameCell) {
    const deviceId = Number(nameCell.dataset.id);
    openDetailModal(deviceId);
  }
}


/* ==================================================
   11. 排序表头点击处理
================================================== */

function handleSortById() {
  if (sortFilter.value === "id-asc") {
    sortFilter.value = "id-desc";
  } else {
    sortFilter.value = "id-asc";
  }

  refreshDeviceList();
}

function handleSortByName() {
  if (sortFilter.value === "name-asc") {
    sortFilter.value = "name-desc";
  } else {
    sortFilter.value = "name-asc";
  }

  refreshDeviceList();
}


/* ==================================================
   12. 键盘事件处理
   保留原有约定：不支持点击遮罩关闭弹窗。
================================================== */

function handleDocumentKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }

  if (deviceModal.style.display === "flex") {
    closeDeviceModal();
  }

  if (detailModal.style.display === "flex") {
    closeDetailModal();
  }
}


/* ==================================================
   13. 输入时清除对应字段的旧错误
================================================== */

function handleMacInput() {
  clearMacError();
}

function handleNameInput() {
  clearFieldError(deviceName, nameError);
}

function handleRoomInput() {
  clearFieldError(deviceRoom, roomError);
}


/* ==================================================
   14. 注册事件监听
   将事件监听集中在一个入口，便于查看和维护。
================================================== */

function bindEvents() {
  // 搜索、筛选与下拉排序
  searchInput.addEventListener("input", refreshDeviceList);
  statusFilter.addEventListener("change", refreshDeviceList);
  sortFilter.addEventListener("change", refreshDeviceList);

  // 表头排序
  sortById.addEventListener("click", handleSortById);
  sortByName.addEventListener("click", handleSortByName);

  // 新增、取消、表单提交
  addDeviceBtn.addEventListener("click", openAddDeviceModal);
  cancelBtn.addEventListener("click", closeDeviceModal);
  deviceForm.addEventListener("submit", handleDeviceSubmit);

  // 设备列表事件委托
  deviceTableBody.addEventListener("click", handleDeviceTableClick);

  // 详情弹窗关闭
  closeDetailBtn.addEventListener("click", closeDetailModal);

  // 键盘事件
  document.addEventListener("keydown", handleDocumentKeydown);

  // 表单输入时清除旧错误
  deviceMac.addEventListener("input", handleMacInput);
  deviceName.addEventListener("input", handleNameInput);
  deviceRoom.addEventListener("input", handleRoomInput);
}


/* ==================================================
   15. 页面初始化
================================================== */

function init() {
  bindEvents();
  refreshDeviceList();
}

init();
