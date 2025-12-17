const isDev = false;
const BASE_URL = isDev ? 'http://localhost:5173' : 'https://link-repository.eupthere.uk';

document.addEventListener('DOMContentLoaded', async () => {
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
      try {
        const originalHTML = button.innerHTML;
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

        // 로딩 표시 등 UI 처리 필요시 추가

        const response = await chrome.runtime.sendMessage({
          action: 'summarize',
          content: pageContent.textContent,
          aiPassword
        });

        if (response && response.success) {
          const { summary, tags } = response.data;
          if (summary) commentInput.value = summary;
          if (tags && Array.isArray(tags)) tagsInput.value = tags.join(', ');
          checkFields(); // 저장 버튼 활성화 상태 업데이트
        } else {
          alert('AI 요약 실패: ' + (response?.error || '응답이 없습니다.'));
        }
        button.classList.remove('loading');
        button.disabled = false;
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
  tagsInput.addEventListener('input', checkFields);

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
      tags: tagsInput.value.split(',').map(v => v.trim()).filter(v => v !== ''),
      summary: commentInput.value,
    };

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
        checkFields();
      } else {
        throw new Error(response?.error || '저장 실패');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      saveButton.innerHTML = originalBtnText;
      checkFields();
    }
  });
});
