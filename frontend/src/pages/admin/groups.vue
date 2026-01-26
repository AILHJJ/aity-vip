<template>
  <view class="groups-container">
    <view class="header">
      <text class="title">分组管理</text>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        添加分组
      </button>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="groups.length === 0" class="empty-state">
      <text class="empty-state-icon">📁</text>
      <text class="empty-state-text">暂无分组</text>
    </view>
    
    <view v-else class="groups-list">
      <view 
        v-for="group in groups" 
        :key="group.id"
        class="group-item"
      >
        <view class="group-header">
          <text class="group-name">{{ group.name }}</text>
          <view class="group-actions">
            <button 
              class="btn btn-small btn-primary"
              @click="handleEdit(group)"
            >
              编辑
            </button>
            <button 
              class="btn btn-small btn-danger"
              @click="handleDelete(group)"
            >
              删除
            </button>
          </view>
        </view>
        
        <view class="group-meta">
          <text class="meta-item">用户数：{{ group.user_count || 0 }}</text>
          <text class="meta-item">消息数：{{ group.message_count || 0 }}</text>
          <text class="meta-item">创建时间：{{ formatTime(group.created_at) }}</text>
        </view>
      </view>
    </view>
    
    <view v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加分组</text>
          <text class="dialog-close" @click="showCreateDialog = false">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">分组名称</text>
            <input 
              v-model="groupForm.name" 
              class="form-input" 
              placeholder="请输入分组名称"
            />
          </view>
          <view class="form-item">
            <text class="form-label">分组描述</text>
            <textarea 
              v-model="groupForm.description" 
              class="form-textarea" 
              placeholder="请输入分组描述"
              rows="4"
            ></textarea>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-secondary" @click="showCreateDialog = false">
            取消
          </button>
          <button 
            class="btn btn-primary" 
            :disabled="saving"
            @click="handleCreateGroup"
          >
            {{ saving ? '保存中...' : '确定' }}
          </button>
        </view>
      </view>
    </view>
    
    <view v-if="showEditDialog" class="dialog-overlay" @click="showEditDialog = false">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">编辑分组</text>
          <text class="dialog-close" @click="showEditDialog = false">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">分组名称</text>
            <input 
              v-model="editForm.name" 
              class="form-input" 
              placeholder="请输入分组名称"
            />
          </view>
          <view class="form-item">
            <text class="form-label">分组描述</text>
            <textarea 
              v-model="editForm.description" 
              class="form-textarea" 
              placeholder="请输入分组描述"
              rows="4"
            ></textarea>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-secondary" @click="showEditDialog = false">
            取消
          </button>
          <button 
            class="btn btn-primary" 
            :disabled="saving"
            @click="handleUpdateGroup"
          >
            {{ saving ? '保存中...' : '确定' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getGroups, createGroup, updateGroup, deleteGroup } from '../../api/group'
import { formatRelativeTime } from '../../utils/time'

const groups = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const saving = ref(false)
const currentGroup = ref(null)

const groupForm = reactive({
  name: '',
  description: ''
})

const editForm = reactive({
  name: '',
  description: ''
})

async function fetchGroups() {
  try {
    loading.value = true
    const response = await getGroups()
    groups.value = response.data.list || response.data
  } catch (error) {
    console.error('获取分组列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleEdit(group) {
  currentGroup.value = group
  editForm.name = group.name
  editForm.description = group.description || ''
  showEditDialog.value = true
}

async function handleCreateGroup() {
  if (!groupForm.name) {
    console.error('请输入分组名称')
    return
  }
  
  try {
    saving.value = true
    await createGroup(groupForm)
    showCreateDialog.value = false
    resetGroupForm()
    await fetchGroups()
  } catch (error) {
    console.error('创建分组失败:', error)
  } finally {
    saving.value = false
  }
}

async function handleUpdateGroup() {
  if (!editForm.name) {
    console.error('请输入分组名称')
    return
  }
  
  try {
    saving.value = true
    await updateGroup(currentGroup.value.id, editForm)
    showEditDialog.value = false
    await fetchGroups()
  } catch (error) {
    console.error('更新分组失败:', error)
  } finally {
    saving.value = false
  }
}

async function handleDelete(group) {
  try {
    await deleteGroup(group.id)
    await fetchGroups()
  } catch (error) {
    console.error('删除分组失败:', error)
  }
}

function resetGroupForm() {
  groupForm.name = ''
  groupForm.description = ''
}

function formatTime(time) {
  return formatRelativeTime(time)
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.groups-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state-text {
  font-size: 16px;
  color: #999;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.group-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.group-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.meta-item {
  font-size: 14px;
  color: #666;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
}

.btn-danger:hover {
  background-color: #ff7875;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  width: 90%;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.dialog-body {
  padding: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 14px;
  color: #666;
}

.form-input {
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.form-textarea {
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  min-height: 100px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e8e8e8;
}

.dialog-footer .btn {
  flex: 1;
}

@media screen and (max-width: 750rpx) {
  .groups-container {
    padding: 20rpx;
  }
  
  .title {
    font-size: 48rpx;
  }
  
  .btn {
    padding: 16rpx 32rpx;
    font-size: 28rpx;
  }
}
</style>