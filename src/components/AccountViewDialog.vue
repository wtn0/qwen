<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
    <div class="dialog-panel">
      <div class="dialog-header">
        <h2>账号详情</h2>
        <button class="dialog-close" @click="handleClose">&times;</button>
      </div>
      <div class="dialog-body" v-if="account">
        <div class="detail-avatar" :style="{ background: avatarColor }">
          {{ account.name.charAt(0).toUpperCase() }}
        </div>
        <div class="detail-row"><label>ID</label><span>{{ account.id }}</span></div>
        <div class="detail-row"><label>账号名</label><span>{{ account.name }}</span></div>
        <div class="detail-row"><label>邮箱</label><span>{{ account.email }}</span></div>
        <div class="detail-row"><label>角色</label><span class="tag" :class="'tag-' + account.role">{{ roleLabel }}</span></div>
        <div class="detail-row"><label>状态</label><span :class="account.status === 'active' ? 'text-success' : 'text-muted'">{{ account.status === 'active' ? '启用' : '禁用' }}</span></div>
        <div class="detail-row"><label>创建时间</label><span>{{ account.createdAt }}</span></div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-primary" @click="handleClose">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ visible: Boolean, account: { type: Object, default: null } })
const emit = defineEmits(['close', 'update:visible'])

function handleClose() { emit('update:visible', false) }

function roleLabel(role) { const map = { admin: '管理员', editor: '编辑者', viewer: '观察者' }; return map[role] || role }

function avatarColor(name) {
  const colors = ['#4361ee','#3a86ff','#7209b7','#f72585','#4cc9f0','#06d6a0']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog-panel { background: #fff; border-radius: 12px; width: 420px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.dialog-header h2 { font-size: 18px; font-weight: 600; color: #1a1a2e; }
.dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 22px; color: #999; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.dialog-close:hover { background: #f5f5f5; color: #333; }
.dialog-body { padding: 24px; }
.detail-avatar { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; font-weight: 600; margin: 0 auto 20px; }
.detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.detail-row:last-child { border-bottom: none; }
.detail-row label { width: 80px; font-size: 14px; color: #888; flex-shrink: 0; }
.detail-row span { font-size: 14px; color: #333; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.tag-admin { background: #ede9fe; color: #7c3aed; }
.tag-editor { background: #dbeafe; color: #2563eb; }
.tag-viewer { background: #f3f4f6; color: #6b7280; }
.text-success { color: #27ae60; }
.text-muted { color: #999; }
.dialog-footer { padding: 0 24px 20px; display: flex; justify-content: center; }
</style>
