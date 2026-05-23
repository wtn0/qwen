<template>
  <div class="account-list-page">
    <div class="page-header">
      <h1 class="page-title">子账号管理</h1>
      <button class="btn btn-primary" @click="openAddDialog">+ 新建账号</button>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input v-model="searchKeyword" type="text" placeholder="搜索账号名 / 邮箱..." @input="handleSearch" />
      </div>
      <div class="filter-group">
        <select v-model="filterRole" @change="handleSearch">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="editor">编辑者</option>
          <option value="viewer">观察者</option>
        </select>
        <select v-model="filterStatus" @change="handleSearch">
          <option value="">全部状态</option>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:80px">ID</th>
            <th>账号名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th style="width:180px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td colspan="7" class="empty-row">暂无数据</td>
          </tr>
          <tr v-for="item in paginatedData" :key="item.id">
            <td class="cell-id">{{ item.id }}</td>
            <td>
              <div class="account-info">
                <div class="avatar" :style="{ background: avatarColor(item.name) }">{{ item.name.charAt(0).toUpperCase() }}</div>
                <span class="account-name">{{ item.name }}</span>
              </div>
            </td>
            <td class="cell-email">{{ item.email }}</td>
            <td><span class="tag" :class="'tag-' + item.role">{{ roleLabel(item.role) }}</span></td>
            <td><span class="status-dot" :class="item.status"></span>{{ item.status === 'active' ? '启用' : '禁用' }}</td>
            <td class="cell-date">{{ item.createdAt }}</td>
            <td class="cell-actions">
              <button class="btn btn-sm btn-outline" @click="openEditDialog(item)">编辑</button>
              <button class="btn btn-sm btn-outline" @click="openViewDialog(item)">查看</button>
              <button class="btn btn-sm" :class="item.status === 'active' ? 'btn-danger-outline' : 'btn-success-outline'" @click="handleToggleStatus(item)">
                {{ item.status === 'active' ? '禁用' : '启用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-bar">
      <div class="pagination-info">共 {{ filteredData.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页</div>
      <div class="pagination-controls">
        <button class="btn btn-sm btn-outline" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
        <button v-for="page in visiblePages" :key="page" class="btn btn-sm" :class="page === currentPage ? 'btn-primary' : 'btn-outline'" @click="currentPage = page">{{ page }}</button>
        <button class="btn btn-sm btn-outline" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
      </div>
    </div>

    <AccountDialog v-model:visible="dialogVisible" :account="editingAccount" @submit="handleDialogSubmit" />
    <AccountViewDialog v-model:visible="viewDialogVisible" :account="viewingAccount" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AccountDialog from '../components/AccountDialog.vue'
import AccountViewDialog from '../components/AccountViewDialog.vue'

let nextId = 2000
const mockAccounts = [
  { id: 1001, name: '张三', email: 'zhangsan@example.com', role: 'admin', status: 'active', createdAt: '2024-01-15 10:30' },
  { id: 1002, name: '李四', email: 'lisi@example.com', role: 'editor', status: 'active', createdAt: '2024-02-20 14:22' },
  { id: 1003, name: '王五', email: 'wangwu@example.com', role: 'viewer', status: 'disabled', createdAt: '2024-03-08 09:15' },
  { id: 1004, name: '赵六', email: 'zhaoliu@example.com', role: 'editor', status: 'active', createdAt: '2024-04-12 16:45' },
  { id: 1005, name: '孙七', email: 'sunqi@example.com', role: 'admin', status: 'active', createdAt: '2024-05-01 11:00' },
  { id: 1006, name: '周八', email: 'zhouba@example.com', role: 'viewer', status: 'active', createdAt: '2024-06-18 08:30' },
  { id: 1007, name: '吴九', email: 'wujiu@example.com', role: 'editor', status: 'disabled', createdAt: '2024-07-22 13:10' },
  { id: 1008, name: '郑十', email: 'zhengshi@example.com', role: 'viewer', status: 'active', createdAt: '2024-08-30 17:55' },
  { id: 1009, name: '陈一', email: 'chenyi@example.com', role: 'admin', status: 'active', createdAt: '2024-09-05 10:00' },
  { id: 1010, name: '刘二', email: 'liuer@example.com', role: 'editor', status: 'disabled', createdAt: '2024-10-11 15:40' },
  { id: 1011, name: '黄三', email: 'huangsan@example.com', role: 'viewer', status: 'active', createdAt: '2024-11-03 09:25' },
  { id: 1012, name: '林四', email: 'linsi@example.com', role: 'editor', status: 'active', createdAt: '2024-12-20 14:00' },
]
const accounts = ref([...mockAccounts])

const searchKeyword = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 5

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const editingAccount = ref(null)
const viewingAccount = ref(null)

const filteredData = computed(() => {
  let data = [...accounts.value]
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    data = data.filter(i => i.name.toLowerCase().includes(kw) || i.email.toLowerCase().includes(kw))
  }
  if (filterRole.value) data = data.filter(i => i.role === filterRole.value)
  if (filterStatus.value) data = data.filter(i => i.status === filterStatus.value)
  return data
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize) || 1)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function roleLabel(role) { const map = { admin: '管理员', editor: '编辑者', viewer: '观察者' }; return map[role] || role }

function avatarColor(name) {
  const colors = ['#4361ee','#3a86ff','#7209b7','#f72585','#4cc9f0','#06d6a0']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function handleSearch() { currentPage.value = 1 }

function openAddDialog() {
  editingAccount.value = null
  dialogVisible.value = true
}

function openEditDialog(item) {
  editingAccount.value = { ...item }
  dialogVisible.value = true
}

function openViewDialog(item) {
  viewingAccount.value = item
  viewDialogVisible.value = true
}

function handleDialogSubmit(formData) {
  const now = new Date()
  const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  if (editingAccount.value) {
    const idx = accounts.value.findIndex(i => i.id === editingAccount.value.id)
    if (idx !== -1) accounts.value[idx] = { ...accounts.value[idx], ...formData }
  } else {
    accounts.value.unshift({ id: nextId++, ...formData, createdAt: ts })
  }
}

function handleToggleStatus(item) {
  item.status = item.status === 'active' ? 'disabled' : 'active'
}
</script>

<style scoped>
.account-list-page { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0; }
.btn { display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; padding: 8px 16px; transition: all .2s ease; }
.btn-primary { background: #4361ee; color: #fff; }
.btn-primary:hover { background: #3a56d4; }
.btn-outline { background: #fff; color: #555; border: 1px solid #ddd; }
.btn-outline:hover { border-color: #4361ee; color: #4361ee; }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-danger-outline { background: #fff; color: #e74c3c; border: 1px solid #e74c3c; }
.btn-danger-outline:hover { background: #e74c3c; color: #fff; }
.btn-success-outline { background: #fff; color: #27ae60; border: 1px solid #27ae60; }
.btn-success-outline:hover { background: #27ae60; color: #fff; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; min-width: 240px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; pointer-events: none; }
.search-box input { width: 100%; height: 42px; padding: 0 16px 0 40px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: #fff; outline: none; transition: border-color .2s; box-sizing: border-box; }
.search-box input:focus { border-color: #4361ee; }
.filter-group { display: flex; gap: 12px; }
.filter-group select { height: 42px; padding: 0 36px 0 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: #fff; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; transition: border-color .2s; }
.filter-group select:focus { border-color: #4361ee; }
.table-container { background: #fff; border-radius: 12px; border: 1px solid #eee; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead { background: #f8f9fc; }
.data-table th { text-align: left; padding: 14px 16px; font-size: 13px; font-weight: 600; color: #666; border-bottom: 1px solid #eee; }
.data-table td { padding: 14px 16px; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #f8f9ff; }
.empty-row { text-align: center; color: #999; padding: 48px 0 !important; }
.cell-id { color: #999; font-family: 'SF Mono','Menlo',monospace; font-size: 13px; }
.cell-email { color: #666; }
.cell-date { color: #888; font-size: 13px; }
.account-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.account-name { font-weight: 500; }
.tag { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.tag-admin { background: #ede9fe; color: #7c3aed; }
.tag-editor { background: #dbeafe; color: #2563eb; }
.tag-viewer { background: #f3f4f6; color: #6b7280; }
.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
.status-dot.active { background: #27ae60; }
.status-dot.disabled { background: #ccc; }
.cell-actions { display: flex; gap: 8px; }
.pagination-bar { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; flex-wrap: wrap; gap: 12px; }
.pagination-info { font-size: 13px; color: #888; }
.pagination-controls { display: flex; gap: 6px; }
</style>
