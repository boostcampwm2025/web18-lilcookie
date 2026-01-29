<script setup lang="ts">
import { ref } from 'vue'

const selectedTag = ref<string | null>(null)
const searchQuery = ref('')

const links = [
  {
    id: 1,
    title: 'React 18 새로운 기능 소개',
    summary: 'Concurrent Mode, Suspense, 자동 배칭 등 React 18의 주요 업데이트를 설명합니다.',
    tags: ['React', '프론트엔드', 'JavaScript'],
    author: '박준호',
    isNew: true
  },
  {
    id: 2,
    title: 'TypeScript 5.0 릴리즈 노트',
    summary: 'Decorators 정식 지원, const 타입 파라미터 등 TypeScript 5.0의 새로운 기능들.',
    tags: ['TypeScript', '프론트엔드', '개발'],
    author: '이수진',
    isNew: true
  },
  {
    id: 3,
    title: 'Tailwind CSS v3.4 업데이트',
    summary: '새로운 유틸리티 클래스와 성능 개선 사항을 포함한 Tailwind CSS 최신 버전 안내.',
    tags: ['CSS', 'Tailwind', '디자인'],
    author: '이윤표',
    isNew: false
  },
  {
    id: 4,
    title: 'Next.js 14 App Router 가이드',
    summary: 'Server Components와 새로운 라우팅 시스템을 활용한 Next.js 애플리케이션 구축 방법.',
    tags: ['Next.js', 'React', 'SSR'],
    author: '정아현',
    isNew: false
  }
]

const filteredLinks = () => {
  return links.filter(link => {
    const matchesTag = !selectedTag.value || link.tags.includes(selectedTag.value)
    const matchesSearch = !searchQuery.value || 
      link.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      link.summary.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTag && matchesSearch
  })
}

const toggleTag = (tag: string) => {
  selectedTag.value = selectedTag.value === tag ? null : tag
}
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="dash-sidebar">
        <div class="dash-logo">
          <div class="dash-logo-icon">TS</div>
          <span class="dash-logo-text">TeamStash</span>
        </div>
        
        <nav class="dash-nav">
          <button class="dash-nav-item active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            내 팀
          </button>
          
          <div class="dash-team">
            <div class="dash-team-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              프론트엔드팀
            </div>
            <div class="dash-folders">
              <button class="dash-folder active">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                기본 폴더
              </button>
              <button class="dash-folder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                참고자료
              </button>
            </div>
          </div>
        </nav>

        <button class="dash-create-btn">+ 팀 만들기</button>
      </aside>

      <!-- Main Content -->
      <main class="dash-main">
        <!-- Header -->
        <header class="dash-header">
          <div class="dash-user">
            <span>박준호</span>
            <button class="dash-logout">로그아웃</button>
          </div>
        </header>

        <!-- Content -->
        <div class="dash-content">
          <h1 class="dash-title">프론트엔드팀 > 기본 폴더</h1>
          <p class="dash-count">{{ filteredLinks().length }}개의 링크</p>

          <!-- Search -->
          <div class="dash-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="제목, 요약, 태그로 검색..."
            />
          </div>

          <!-- Tag Filter -->
          <div class="dash-tags" v-if="selectedTag">
            <span class="dash-filter-label">필터:</span>
            <span class="dash-active-tag">
              #{{ selectedTag }}
              <button @click="selectedTag = null">×</button>
            </span>
          </div>

          <!-- Link Grid -->
          <div class="dash-grid">
            <div 
              v-for="link in filteredLinks()" 
              :key="link.id" 
              class="dash-card"
            >
              <div class="dash-card-badge" v-if="link.isNew">NEW</div>
              <div class="dash-card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="1.5">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div class="dash-card-content">
                <h3 class="dash-card-title">{{ link.title }}</h3>
                <p class="dash-card-summary">{{ link.summary }}</p>
                <div class="dash-card-tags">
                  <span 
                    v-for="tag in link.tags" 
                    :key="tag"
                    class="dash-card-tag"
                    @click.stop="toggleTag(tag)"
                  >
                    #{{ tag }}
                  </span>
                </div>
                <div class="dash-card-author">
                  <div class="dash-avatar">{{ link.author.charAt(0) }}</div>
                  <span>{{ link.author }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  margin: 40px 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.dashboard-container {
  width: 100%;
  max-width: 1000px;
  height: 600px;
  background: #f9fafb;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Sidebar */
.dash-sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.dash-logo {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.dash-logo-icon {
  width: 32px;
  height: 32px;
  background: #2563eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.dash-logo-text {
  font-weight: bold;
  font-size: 16px;
  color: #111827;
}

.dash-nav {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.dash-nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.dash-nav-item:hover {
  background: #f3f4f6;
}

.dash-nav-item.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.dash-team {
  margin-top: 8px;
  margin-left: 8px;
}

.dash-team-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 8px;
  cursor: pointer;
}

.dash-folders {
  margin-top: 4px;
  margin-left: 20px;
}

.dash-folder {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.dash-folder:hover {
  background: #f3f4f6;
}

.dash-folder.active {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 500;
}

.dash-create-btn {
  margin: 12px;
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.dash-create-btn:hover {
  background: #1d4ed8;
}

/* Main */
.dash-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dash-header {
  height: 56px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.dash-user {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #374151;
}

.dash-logout {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
}

.dash-logout:hover {
  background: #f3f4f6;
}

.dash-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.dash-title {
  font-size: 20px;
  font-weight: bold;
  color: #111827;
  margin: 0 0 4px 0;
}

.dash-count {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.dash-search {
  position: relative;
  margin-bottom: 16px;
}

.dash-search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.dash-search input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.15s;
}

.dash-search input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.dash-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.dash-filter-label {
  font-size: 13px;
  color: #6b7280;
}

.dash-active-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 16px;
  font-size: 13px;
}

.dash-active-tag button {
  background: none;
  border: none;
  color: #1d4ed8;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  line-height: 1;
}

/* Grid */
.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.dash-card {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.dash-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.dash-card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 8px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid #bfdbfe;
}

.dash-card-icon {
  height: 100px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dash-card-content {
  padding: 16px;
}

.dash-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-card-summary {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dash-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.dash-card-tag {
  padding: 2px 8px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 12px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.dash-card-tag:hover {
  background: #eff6ff;
  color: #2563eb;
}

.dash-card-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.dash-avatar {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
    height: auto;
  }
  
  .dash-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .dash-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .dash-team {
    margin: 0;
  }
  
  .dash-folders {
    display: flex;
    gap: 4px;
    margin: 0;
  }
  
  .dash-create-btn {
    display: none;
  }
  
  .dash-grid {
    grid-template-columns: 1fr;
  }
}
</style>
