<template>
  <main class="auth-page">
    <section class="auth-box">
      <div class="brand">故事生成器</div>
      <el-tabs v-model="mode" stretch>
        <el-tab-pane label="登录" name="login" />
        <el-tab-pane label="注册" name="register" />
      </el-tabs>

      <el-form class="auth-form" label-position="top" size="large" @submit.prevent>
        <el-form-item label="用户名">
          <el-input
            v-model.trim="form.username"
            autocomplete="username"
            placeholder="1-8 位中文、英文或数字"
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            autocomplete="current-password"
            placeholder="至少 6 位"
            show-password
            type="password"
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-button class="auth-submit" type="primary" size="large" :loading="loading" @click="submit">
          {{ mode === 'login' ? '登录' : '注册并登录' }}
        </el-button>
      </el-form>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore.js'

const emit = defineEmits(['authenticated'])
const auth = useAuthStore()

const mode = ref('login')
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
})

function validateForm() {
  if (!form.username) {
    ElMessage.warning('请填写用户名')
    return false
  }

  if (!/^[\u4e00-\u9fa5a-z0-9]{1,8}$/i.test(form.username)) {
    ElMessage.warning('用户名需为 1-8 位中文、英文或数字')
    return false
  }

  if (!form.password) {
    ElMessage.warning('请填写密码')
    return false
  }

  if (form.password.length < 6) {
    ElMessage.warning('密码至少需要 6 位')
    return false
  }

  return true
}

async function submit() {
  if (!validateForm()) return

  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.login({ username: form.username, password: form.password })
    } else {
      await auth.register({ username: form.username, password: form.password })
    }

    ElMessage.success('登录成功')
    emit('authenticated')
  } catch (error) {
    const message =
      mode.value === 'login' && error.message?.includes('Invalid username or password')
        ? '当前用户未注册，请检查用户名和密码'
        : error.message || '登录失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(192, 120, 88, 0.12), rgba(90, 141, 106, 0.12)),
    var(--bg);
}

.auth-box {
  width: min(420px, 100%);
  padding: 28px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 14px 40px rgba(70, 48, 36, 0.12);
}

.brand {
  margin-bottom: 18px;
  text-align: center;
  font-family: "Ma Shan Zheng", cursive;
  font-size: 30px;
  letter-spacing: 4px;
  color: var(--accent);
}

.auth-form {
  margin-top: 10px;
}

.auth-submit {
  width: 100%;
  margin-top: 4px;
}

.auth-hint {
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--ink-2);
  text-align: center;
}

@media (max-width: 520px) {
  .auth-page {
    padding: 16px;
  }

  .auth-box {
    padding: 20px;
  }
}
</style>
