<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleCancel">
    <div class="dialog-panel">
      <div class="dialog-header">
        <h2>{{ isEdit ? '编辑账号' : '新建账号' }}</h2>
        <button class="dialog-close" @click="handleCancel">&times;</button>
      </div>
      <div class="dialog-body">
        <div class="form-group">
          <label>账号名 <span class="required">*</span></label>
          <input v-model="form.name" type="text" placeholder="请输入账号名" class="form-input" />
          <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
        </div>
        <div class="form-group">
          <label>邮箱 <span class="required">*</span></label>
          <input v-model="form.email" type="email" placeholder="请输入邮箱地址" class="form-input" />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>
        <div class="form-group">
          <label>角色 <span class="required">*</span></label>
          <select v-model="form.role" class="form-input">
            <option value="admin">管理员</option>
            <option value="editor">编辑者</option>
            <option value="viewer">观察者</option>
          </select>
        </div>
        <div class="form-group">
          <label>状态</label>
          <div class="radio-group">
            <label class="radio-item"><input type="radio" v-model="form.status" value="active" /><span>启用</span></label>
            <label class="radio-item"><input type="radio" v-model="form.status" value="disabled" /><span>禁用</span></label>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" @click="handleCancel">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">确认{{ isEdit ? '保存' : '创建' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({ visible: Boolean, account: { type: Object, default: null } })
const emit = defineEmits(['close', 'update:visible', 'submit'])

const isEdit = ref(false)
const form = reactive({ name: '', email: '', role: 'editor', status: 'active' })
const errors = reactive({ name: '', email: '' })

watch(() => props.visible, (val) => {
  if (!val) return
  isEdit.value = !!props.account
  if (props.account) {
    form.name = props.account.name
    form.email = props.account.email
    form.role = props.account.role
    form.status = props.account.status
  } else {
    form.name = ''; form.email = ''; form.role = 'editor'; form.status = 'active'
  }
  errors.name = ''; errors.email = ''
})

function validate() {
  let valid = true
  errors.name = ''; errors.email = ''
  if (!form.name.trim()) { errors.name = '请输入账号名'; valid = false }
  if (!form.email.trim()) { errors.email = '请输入邮箱地址'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = '邮箱格式不正确'; valid = false }
  return valid
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', { ...form })
  emit('update:visible', false)
}
function handleCancel() { emit('update:visible', false) }
</script>

<style scoped>
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog-panel { background: #fff; border-radius: 12px; width: 480px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.dialog-header h2 { font-size: 18px; font-weight: 600; color: #1a1a2e; }
.dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 22px; color: #999; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.dialog-close:hover { background: #f5f5f5; color: #333; }
.dialog-body { padding: 20px 24px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: #333; margin-bottom: 6px; }
.required { color: #e74c3c; }
.form-input { width: 100%; height: 42px; padding: 0 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color .2s; box-sizing: border-box; }
.form-input:focus { border-color: #4361ee; }
.form-error { font-size: 12px; color: #e74c3c; margin-top: 4px; }
.radio-group { display: flex; gap: 20px; padding-top: 4px; }
.radio-item { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: #333; }
.radio-item input[type="radio"] { accent-color: #4361ee; }
.dialog-footer { padding: 0 24px 20px; display: flex; justify-content: flex-end; gap: 12px; }
</style>
