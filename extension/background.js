const isDev = true;
const BASE_URL = isDev ? 'http://localhost:3000' : 'https://link-repository.eupthere.com';
const POST_URL = BASE_URL + '/api/links';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveLink') {
    saveLink(request.data).then(sendResponse);
    // https://developer.chrome.com/docs/extensions/develop/concepts/messaging#responses
    return true; // Will respond asynchronously
  }
});

async function saveLink(formData) {
  try {
    const response = await fetch(POST_URL, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });

    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json };
    } else {
      return { success: false, error: '저장 실패' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 알람 설정: 1분마다 실행
chrome.alarms.create('pollLinks', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pollLinks') {
    checkNewLinks();
  }
});

async function checkNewLinks() {
  try {
    const { teamId, lastCheck, camperId } = await chrome.storage.sync.get(['teamId', 'lastCheck', 'camperId']);

    if (!teamId) return;

    const now = new Date();
    const formattedNow = now.toISOString();

    if (!lastCheck) {
      await chrome.storage.sync.set({ lastCheck: formattedNow });
      return;
    }

    const url = new URL(POST_URL);
    url.searchParams.append('teamId', teamId);
    url.searchParams.append('createdAfter', lastCheck);

    const response = await fetch(url.toString());
    if (response.ok) {
      const json = await response.json();
      const links = json.data || [];
      const newLinks = links.filter((link) => link.createdBy !== camperId);

      if (Array.isArray(newLinks) && newLinks.length > 0) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon-128.png',
          title: '[TeamStash] 새로운 링크 알림',
          message: `${newLinks.length}개의 새로운 링크가 등록되었습니다.`,
          priority: 2
        });
      }

      await chrome.storage.sync.set({ lastCheck: formattedNow });
    }
  } catch (error) {
    console.error('Error checking links:', error);
  }
}
