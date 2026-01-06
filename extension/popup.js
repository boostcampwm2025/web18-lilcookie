const isDev = false;
const BASE_URL = isDev ? 'http://localhost:5173' : 'https://link-repository.eupthere.uk';

const MAX_TAG_COUNT = 10;
const MAX_CHARACTER_COUNT = 200;

// Initialize PostHog
try {
  PostHogUtils.initPostHog();
} catch (error) {
  console.error('PostHog 초기화 오류:', error);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Track popup opened
  PostHogUtils.trackEvent('extension_popup_opened');

  // 정보 입력 및 제출할 폼 부분
  const form = document.getElementById('stashForm');
  const commentInput = document.getElementById('comment');
  const tagsInput = document.getElementById('tags');
  const saveButton = document.getElementById('saveButton');

  // 페이지 정보 표시 부분
  const pageFavicon = document.getElementById('pageFavicon');
  const pageTitle = document.getElementById('pageTitle');
  const pageUrl = document.getElementById('pageUrl');

  // 설정 링크 이벤트 핸들러
  const settingsLink = document.getElementById('settingsLink');
  if (settingsLink) {
    settingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    });
  }

  // 현재 탭 페이지 정보 가져오기
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const aiButton = document.getElementById('aiGen');

  if (tab) {
    pageTitle.textContent = tab.title;
    pageUrl.textContent = tab.url;
    if (tab.favIconUrl) {
      pageFavicon.src = tab.favIconUrl;
    } else {
      pageFavicon.style.display = 'none';
    }

    // 페이지 내용이 없으면 AI 버튼 비활성화
    chrome.storage.session.get('pageContent', ({ pageContent }) => {
      const isReaderable = pageContent?.textContent;

      if (aiButton) {
        aiButton.disabled = !isReaderable;
        aiButton.title = isReaderable ? 'AI로 요약 생성' : '이 페이지는 요약할 수 없습니다';
      }
    });

    // AI 버튼 이벤트 리스너
    const handleAiClick = async (button) => {
      const originalHTML = button.innerHTML;
      try {
        // Track AI button clicked
        PostHogUtils.trackEvent('extension_ai_button_clicked');
        
        // button.textContent = 'AI 생성 중...'; // 텍스트 변경 대신
        button.classList.add('loading'); // 로딩 클래스 추가
        button.disabled = true;
        commentInput.disabled = true;
        tagsInput.disabled = true;
        commentInput.classList.add('loading');
        tagsInput.classList.add('loading');

        const { pageContent } = await chrome.storage.session.get('pageContent');
        if (!pageContent || !pageContent.textContent) {
          button.classList.remove('loading');
          button.disabled = false;
          commentInput.disabled = false;
          tagsInput.disabled = false;
          commentInput.classList.remove('loading');
          tagsInput.classList.remove('loading');
          return;
        }

        const { aiPassword } = await chrome.storage.sync.get('aiPassword');
        if (!aiPassword) {
          if (confirm('AI 기능을 사용하려면 설정에서 비밀번호를 입력해야 합니다. 설정 페이지로 이동하시겠습니까?')) {
            if (chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage();
            } else {
              window.open(chrome.runtime.getURL('options.html'));
            }
          }
          button.classList.remove('loading');
          button.disabled = false;
          commentInput.disabled = false;
          tagsInput.disabled = false;
          commentInput.classList.remove('loading');
          tagsInput.classList.remove('loading');
          return;
        }

        const response = await chrome.runtime.sendMessage({
          action: 'summarize',
          content: pageContent.textContent,
          aiPassword
        });

        if (response && response.success) {
          const { summary, tags } = response.data;
          if (summary) {
            commentInput.value = String(summary).slice(0, MAX_CHARACTER_COUNT);
            if (typeof updateCommentCount === 'function') updateCommentCount();
          }
          if (tags && Array.isArray(tags)) {
            tagsInput.value = tags.slice(0, MAX_TAG_COUNT).join(', ');
            updateTagCount();
          }
          checkFields(); // 저장 버튼 활성화 상태 업데이트

          // 버튼에 "AI 생성 완료" 표시 및 비활성화
          const svg = button.querySelector('svg');
          button.innerHTML = svg.outerHTML + 'AI 생성 완료';

          button.disabled = true;
        } else {
          button.classList.remove('loading');
          const svg = button.querySelector('svg');
          button.innerHTML = svg.outerHTML + 'AI 생성 실패';
          await new Promise(resolve => setTimeout(resolve, 2000));
          button.innerHTML = originalHTML;
          button.disabled = false;
        }

        button.classList.remove('loading');
        commentInput.disabled = false;
        tagsInput.disabled = false;
        commentInput.classList.remove('loading');
        tagsInput.classList.remove('loading');
      } catch (error) {
        console.error('AI Error:', error);
        alert('오류가 발생했습니다: ' + error.message);
        button.classList.remove('loading');
        button.disabled = false;
        commentInput.disabled = false;
        tagsInput.disabled = false;
        commentInput.classList.remove('loading');
        tagsInput.classList.remove('loading');
      }
    };

    if (aiButton) aiButton.addEventListener('click', (e) => handleAiClick(e.currentTarget));
  }

  // 대시보드 링크 설정
  const dashboardLink = document.getElementById('dashboardLink');
  const dashboardNotice = document.getElementById('dashboardNotice');

  if (dashboardLink) {
    chrome.storage.sync.get('teamId', ({ teamId }) => {
      if (teamId) {
        dashboardLink.href = `${BASE_URL}/${teamId.toLowerCase()}`;
        dashboardLink.classList.remove('disabled');
        if (dashboardNotice) dashboardNotice.style.display = 'none';
      } else {
        dashboardLink.removeAttribute('href');
        dashboardLink.classList.add('disabled');
        if (dashboardNotice) dashboardNotice.style.display = 'block';
      }
    });

    dashboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (dashboardLink.href && !dashboardLink.classList.contains('disabled')) {
        // Track dashboard link clicked
        PostHogUtils.trackEvent('extension_dashboard_link_clicked', {
          from: 'popup',
        });
        
        chrome.tabs.create({ url: dashboardLink.href });
      }
    });
  }

  // 저장 버튼 활성화: 인풋 모두 채워지면 activate
  function checkFields() {
    const commentValue = commentInput.value.trim();
    const tagsValue = tagsInput.value.trim();

    if (commentValue && tagsValue) {
      saveButton.disabled = false;
    } else {
      saveButton.disabled = true;
    }
  }

  // 인풋에 이벤트 리스너 등록
  commentInput.addEventListener('input', checkFields);

  const tagCount = document.getElementById('tagCount');
  const commentCount = document.getElementById('commentCount');

  function updateCommentCount() {
    const val = commentInput.value || '';
    const len = val.length; // whitespace counts
    if (commentCount) commentCount.textContent = `(${Math.min(len, MAX_CHARACTER_COUNT)}/${MAX_CHARACTER_COUNT})`;
  }

  // keep comment counter updated while typing
  commentInput.addEventListener('input', (e) => {
    checkFields();
    updateCommentCount();
  });

  // initialize comment counter
  updateCommentCount();

  // Prevent typing beyond max (handles selection replacement)
  commentInput.addEventListener('keydown', (e) => {
    const key = e.key;
    const allowedControls = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
    if (allowedControls.includes(key)) return;

    const selStart = commentInput.selectionStart;
    const selEnd = commentInput.selectionEnd;
    const selectionLength = Math.max(0, selEnd - selStart);
    const currentLength = commentInput.value.length;

    // treat Enter as a single character
    const charLength = (key === 'Enter') ? 1 : (key.length === 1 ? 1 : 0);
    if (charLength === 0) return;

    const newLength = currentLength - selectionLength + charLength;
    if (newLength > MAX_CHARACTER_COUNT) {
      e.preventDefault();
    }
  });

  // Handle paste: truncate pasted content to fit
  commentInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
    const selStart = commentInput.selectionStart;
    const selEnd = commentInput.selectionEnd;
    const selectionLength = Math.abs(selEnd - selStart);
    const currentLength = commentInput.value.length;
    const allowed = MAX_CHARACTER_COUNT - (currentLength - selectionLength);
    if (allowed <= 0) {
      // nothing to paste
      return;
    }
    const toInsert = paste.slice(0, allowed);
    const before = commentInput.value.slice(0, selStart);
    const after = commentInput.value.slice(selEnd);
    commentInput.value = before + toInsert + after;
    const newCursor = before.length + toInsert.length;
    commentInput.setSelectionRange(newCursor, newCursor);
    updateCommentCount();
    checkFields();
  });

  function updateTagCount() {
    const raw = tagsInput.value || '';
    const count = raw
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== '').length;
    if (tagCount) tagCount.textContent = `(${Math.min(count, MAX_TAG_COUNT)}/${MAX_TAG_COUNT})`;

    // Show error state if over limit
    if (count > MAX_TAG_COUNT) {
      // Limit reached
    } else {
      // Limit not reached
    }
  }

  // keep counter updated while typing
  tagsInput.addEventListener('input', (e) => {
    checkFields();
    updateTagCount();
  });

  // initialize counter
  updateTagCount();

  tagsInput.addEventListener('keydown', (e) => {
    if (e.key === ',') {
      // 1. Check max tags
      const commaCount = (tagsInput.value.match(/,/g) || []).length;
      if (commaCount >= MAX_TAG_COUNT - 1) {
        e.preventDefault();
        return;
      }

      // 2. Check for empty tags (prevent ,, or , , or leading ,)
      const cursor = tagsInput.selectionStart;
      const val = tagsInput.value;
      const before = val.slice(0, cursor);
      const after = val.slice(cursor);

      // Check left side
      const trimmedBefore = before.trim();

      // 1. Is there at least one valid tag on left? (non whitespace character)
      if (trimmedBefore.length === 0) {
        e.preventDefault();
        return;
      }

      // 2. Is there already comma on the left? (ignoring whitespace)
      if (trimmedBefore.endsWith(',')) {
        e.preventDefault();
        return;
      }

      // Check right side: if the segment after cursor starts with comma (ignoring whitespace)
      if (after.trim().startsWith(',')) {
        e.preventDefault();
        return;
      }
    }
  });

  // 폼 제출 처리
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { camperId, teamId } = await chrome.storage.sync.get(['camperId', 'teamId']);

    if (!camperId || !teamId) {
      alert('사용자 설정에서 캠퍼 ID와 팀 ID를 입력해주세요.');
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
      return;
    }

    const formData = {
      userId: camperId,
      teamId: teamId,
      url: tab.url,
      title: tab.title,
      tags: tagsInput.value.split(',').map(v => v.trim()).filter(v => v !== '').slice(0, MAX_TAG_COUNT),
      summary: commentInput.value.slice(0, MAX_CHARACTER_COUNT),
    };

    // Track form submission attempt
    PostHogUtils.trackEvent('extension_link_form_submitted', {
      tags_count: formData.tags.length,
      has_summary: !!formData.summary,
      summary_length: formData.summary?.length || 0,
    });

    let originalBtnText;

    try {
      // 버튼에 로딩 표시
      originalBtnText = saveButton.innerHTML;
      saveButton.textContent = '저장 중...';
      saveButton.disabled = true;

      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'saveLink', data: formData }, resolve);
      });

      if (response && response.success) {
        console.log('저장 성공:', response.data);
        
        form.reset();
        // show success text on the button for 1 second
        saveButton.textContent = '저장 성공!';
        // keep button disabled while showing success
        saveButton.disabled = true;
        commentInput.disabled = true;
        commentInput.placeholder = '';
        tagsInput.disabled = true;
        tagsInput.placeholder = '';
        aiButton.disabled = true;
        tagCount.textContent = '';
        commentCount.textContent = '';
      } else {
        saveButton.textContent = '저장 실패';
        await new Promise(resolve => setTimeout(resolve, 2000));
        saveButton.innerHTML = originalBtnText;
        checkFields();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});
