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
