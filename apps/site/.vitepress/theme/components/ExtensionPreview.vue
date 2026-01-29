<script setup lang="ts">
import { ref } from 'vue'

const isAiLoading = ref(false)
const isAiCompleted = ref(false)
const comment = ref('')
const tags = ref('')

const simulateAi = () => {
  if (isAiLoading.value || isAiCompleted.value) return
  isAiLoading.value = true
  
  setTimeout(() => {
    comment.value = 'React 18의 새로운 기능과 성능 최적화 방법을 설명하는 공식 문서입니다. Concurrent Mode, Suspense, 자동 배칭 등 주요 업데이트를 다룹니다.'
    tags.value = 'React, 성능최적화, 프론트엔드, JavaScript'
    isAiLoading.value = false
    isAiCompleted.value = true
  }, 2000)
}
</script>

<template>
  <div class="extension-wrapper">
    <div class="extension-container">
      <!-- Header -->
      <header class="ext-header">
        <div class="ext-header-content">
          <div class="ext-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 11.0341C0 4.94016 4.94015 0 11.0341 0H24.2751C30.3691 0 35.3092 4.94015 35.3092 11.0341V24.2751C35.3092 30.3691 30.3691 35.3092 24.2751 35.3092H11.0341C4.94016 35.3092 0 30.3691 0 24.2751V11.0341Z" fill="#E0E7FF"/>
              <path d="M22.8032 24.275L17.6539 21.3326L12.5046 24.275V12.5053C12.5046 12.1151 12.6596 11.7409 12.9355 11.465C13.2115 11.1891 13.5857 11.0341 13.9759 11.0341H21.3319C21.7221 11.0341 22.0963 11.1891 22.3723 11.465C22.6482 11.7409 22.8032 12.1151 22.8032 12.5053V24.275Z" stroke="#4F39F6" stroke-width="1.47122" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="ext-header-text">
            <h1 class="ext-app-name">TeamStash</h1>
            <p class="ext-tagline">링크를 빠르게 저장하세요</p>
          </div>
        </div>
      </header>

      <!-- Page Info Card -->
      <div class="ext-page-card">
        <div class="ext-page-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#61DAFB"/>
            <text x="10" y="14" text-anchor="middle" fill="#20232a" font-size="10" font-weight="bold">R</text>
          </svg>
        </div>
        <div class="ext-page-details">
          <h2 class="ext-page-title">React 18 새로운 기능 소개 - 공식 문서</h2>
          <p class="ext-page-url">https://react.dev/blog/2022/03/29/react-v18</p>
        </div>
      </div>

      <!-- Form Section -->
      <div class="ext-form">
        <!-- Comment Field -->
        <div class="ext-input-group">
          <div class="ext-label-row">
            <label>코멘트 <span class="ext-char-count">({{ comment.length }}/200)</span></label>
            <button 
              class="ext-ai-btn" 
              :class="{ loading: isAiLoading, completed: isAiCompleted }"
              @click="simulateAi"
              :disabled="isAiCompleted"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.08104 1.55246C6.10468 1.4259 6.17184 1.31159 6.27088 1.22934C6.36992 1.14708 6.49462 1.10205 6.62337 1.10205C6.75212 1.10205 6.87681 1.14708 6.97585 1.22934C7.0749 1.31159 7.14206 1.4259 7.16569 1.55246L7.74554 4.61885C7.78672 4.83685 7.89267 5.03738 8.04954 5.19426C8.20642 5.35114 8.40695 5.45708 8.62496 5.49827L11.6913 6.07811C11.8179 6.10175 11.9322 6.16891 12.0145 6.26795C12.0967 6.367 12.1418 6.49169 12.1418 6.62044C12.1418 6.74919 12.0967 6.87388 12.0145 6.97292C11.9322 7.07197 11.8179 7.13913 11.6913 7.16276L8.62496 7.74261C8.40695 7.78379 8.20642 7.88974 8.04954 8.04662C7.89267 8.20349 7.78672 8.40402 7.74554 8.62203L7.16569 11.6884C7.14206 11.815 7.0749 11.9293 6.97585 12.0115C6.87681 12.0938 6.75212 12.1388 6.62337 12.1388C6.49462 12.1388 6.36992 12.0938 6.27088 12.0115C6.17184 11.9293 6.10468 11.815 6.08104 11.6884L5.5012 8.62203C5.46001 8.40402 5.35407 8.20349 5.19719 8.04662C5.04031 7.88974 4.83978 7.78379 4.62178 7.74261L1.55539 7.16276C1.42883 7.13913 1.31452 7.07197 1.23227 6.97292C1.15001 6.87388 1.10498 6.74919 1.10498 6.62044C1.10498 6.49169 1.15001 6.367 1.23227 6.26795C1.31452 6.16891 1.42883 6.10175 1.55539 6.07811L4.62178 5.49827C4.83978 5.45708 5.04031 5.35114 5.19719 5.19426C5.35407 5.03738 5.46001 4.83685 5.5012 4.61885L6.08104 1.55246Z" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11.0388 1.10327V3.3101" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.1414 2.20679H9.93457" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ isAiCompleted ? 'AI 생성 완료' : isAiLoading ? 'AI 생성 중...' : 'AI 생성' }}
            </button>
          </div>
          <textarea 
            v-model="comment"
            :class="{ loading: isAiLoading }"
            placeholder="URL에 대한 설명을 입력하세요."
            readonly
          />
        </div>

        <!-- Tag Field -->
        <div class="ext-input-group">
          <div class="ext-label-row">
            <label>태그 <span class="ext-tag-count">({{ tags ? tags.split(',').length : 0 }}/10)</span></label>
          </div>
          <input 
            type="text" 
            v-model="tags"
            :class="{ loading: isAiLoading }"
            placeholder="태그를 입력하세요. 콤마(,)로 구분됩니다."
            readonly
          />
        </div>

        <!-- Save Button -->
        <button class="ext-save-btn" :disabled="!comment || !tags">
          <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.4711 19.3097L11.0345 15.6317L4.5979 19.3097V4.59757C4.5979 4.10983 4.79165 3.64207 5.13654 3.29718C5.48142 2.9523 5.94918 2.75854 6.43692 2.75854H15.632C16.1198 2.75854 16.5875 2.9523 16.9324 3.29718C17.2773 3.64207 17.4711 4.10983 17.4711 4.59757V19.3097Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          스태시에 저장
        </button>
      </div>

      <!-- Footer -->
      <footer class="ext-footer">
        <a href="#" class="ext-dashboard-link">대시보드 열기 →</a>
      </footer>
    </div>

    <!-- Click prompt -->
    <p class="ext-prompt" v-if="!isAiCompleted && !isAiLoading">
      👆 AI 생성 버튼을 클릭해보세요!
    </p>
  </div>
</template>

<style scoped>
.extension-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 40px 0;
}

.ext-prompt {
  color: var(--vp-c-text-2);
  font-size: 14px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.extension-container {
  width: 360px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.ext-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.ext-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ext-header-text {
  display: flex;
  flex-direction: column;
}

.ext-app-name {
  font-size: 16px;
  font-weight: 600;
  color: #4f46e5;
  margin: 0;
}

.ext-tagline {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

/* Page Card */
.ext-page-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #ffffff;
}

.ext-page-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ext-page-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.ext-page-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.ext-page-url {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* Form */
.ext-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ext-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ext-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ext-label-row label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.ext-char-count, .ext-tag-count {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* AI Button */
.ext-ai-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #f3e8ff;
  color: #7c3aed;
  border: none;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ext-ai-btn:hover:not(:disabled) {
  background-color: #e9d5ff;
  transform: scale(1.02);
}

.ext-ai-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ext-ai-btn.completed {
  background-color: #d1fae5;
  color: #059669;
}

@keyframes passing-shine {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}

.ext-ai-btn.loading {
  background: linear-gradient(90deg, #f3e8ff 25%, #e9d5ff 50%, #f3e8ff 75%);
  background-size: 200% auto;
  animation: passing-shine 1.5s linear infinite;
}

/* Inputs */
.ext-form textarea,
.ext-form input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  outline: none;
  transition: all 0.2s;
  background: #ffffff;
}

.ext-form textarea {
  resize: none;
  height: 80px;
}

.ext-form textarea:focus,
.ext-form input[type="text"]:focus {
  border-color: #a78bfa;
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.1);
}

.ext-form textarea::placeholder,
.ext-form input[type="text"]::placeholder {
  color: #9ca3af;
}

.ext-form textarea.loading,
.ext-form input[type="text"].loading {
  background: linear-gradient(90deg, #ffffff 25%, #f3e8ff 50%, #ffffff 75%);
  background-size: 200% auto;
  animation: passing-shine 1.5s linear infinite;
}

/* Save Button */
.ext-save-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: #874fff;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.ext-save-btn:hover:not(:disabled) {
  background-color: #7c3aed;
  transform: translateY(-1px);
}

.ext-save-btn:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Footer */
.ext-footer {
  padding-top: 8px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.ext-dashboard-link {
  font-size: 13px;
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}

.ext-dashboard-link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 400px) {
  .extension-container {
    width: 100%;
    max-width: 360px;
  }
}
</style>
