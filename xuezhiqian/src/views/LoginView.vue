<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo">
        <h1>薛之谦粉丝应援站</h1>
        <p>欢迎回家，谦友</p>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            placeholder="请输入用户名"
            required
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            placeholder="请输入密码"
            required
            autocomplete="current-password"
          />
        </div>
        
        <div class="form-group captcha-group">
          <label for="captcha">验证码</label>
          <div class="captcha-input">
            <input
              type="text"
              id="captcha"
              v-model="form.captcha"
              placeholder="请输入验证码"
              required
              maxlength="4"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              {{ captchaText }}
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
        
        <div class="form-footer">
          <p class="tips">测试账号：admin 密码：123456</p>
          <p class="welcome-text">愿世界和平，我们一直都在 ❤️</p>
        </div>
      </form>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/index';
import { login, mockData } from '../api/index';

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(false);
    const error = ref('');
    const captchaText = ref('');
    
    const form = reactive({
      username: '',
      password: '',
      captcha: ''
    });
    
    // 生成验证码
    const generateCaptcha = () => {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    // 刷新验证码
    const refreshCaptcha = () => {
      captchaText.value = generateCaptcha();
    };
    
    // 处理登录
    const handleLogin = async () => {
      if (!form.username || !form.password || !form.captcha) {
        error.value = '请填写完整信息';
        return;
      }
      
      // 验证码校验（忽略大小写）
      if (form.captcha.toUpperCase() !== captchaText.value) {
        error.value = '验证码错误';
        refreshCaptcha();
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      try {
        // 在模拟环境中，我们直接使用mock数据
        // 真实环境中应该调用login接口
        // const response = await login(form.username, form.password, form.captcha);
        
        // 模拟登录成功
        const response = mockData.loginSuccess();
        
        if (response.code === 200) {
          const { token, userInfo } = response.data;
          userStore.setToken(token);
          userStore.setUserInfo(userInfo);
          
          // 登录成功后跳转到主页
          router.push('/home');
        } else {
          error.value = response.message || '登录失败';
          refreshCaptcha();
        }
      } catch (err) {
        error.value = '登录失败，请稍后重试';
        refreshCaptcha();
        console.error('Login error:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // 组件挂载时生成验证码
    onMounted(() => {
      refreshCaptcha();
    });
    
    return {
      form,
      loading,
      error,
      captchaText,
      refreshCaptcha,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.logo {
  text-align: center;
  margin-bottom: 2rem;
}

.logo h1 {
  color: #e63946;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.logo p {
  color: #6c757d;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #e63946;
  box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.2);
}

.captcha-group .captcha-input {
  display: flex;
  gap: 0.5rem;
}

.captcha-image {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  min-width: 100px;
  text-align: center;
  user-select: none;
  transition: transform 0.2s ease;
}

.captcha-image:hover {
  transform: scale(1.02);
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #e63946;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  background: #c1121f;
}

.login-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.tips {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.welcome-text {
  color: #e63946;
  font-size: 0.875rem;
  font-style: italic;
}

.error-message {
  background: #fee;
  color: #e63946;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  text-align: center;
}

@media (max-width: 480px) {
  .login-form {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>