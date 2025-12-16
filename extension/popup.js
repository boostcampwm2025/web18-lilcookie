const isDev = true;
const BASE_URL = isDev ? 'http://localhost:3000' : 'https://link-repository.eupthere.com';
const POST_URL = BASE_URL + '/api/links';

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

  if (tab) {
    pageTitle.textContent = tab.title;
    pageUrl.textContent = tab.url;
    pageUrl.href = tab.url;
    if (tab.favIconUrl) {
      pageFavicon.src = tab.favIconUrl;
    } else {
      pageFavicon.style.display = 'none';
    }
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
      alert('설정에서 캠퍼 ID와 팀 ID를 먼저 설정해주세요.');
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

      const response = await fetch(POST_URL, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });

      if (response.ok) {
        const json = await response.json();
        console.log('저장 성공:', json);
        form.reset();
        checkFields();
      } else {
        throw new Error('저장 실패');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      saveButton.innerHTML = originalBtnText;
      checkFields();
    }
  });
});
