// Import PostHog bundle
importScripts('scripts/posthog-bundle.js');

const isDev = false;
const BASE_URL = isDev ? 'http://localhost:3000' : 'https://link-repository.eupthere.uk';
const FE_BASE_URL = isDev ? 'http://localhost:5173' : 'https://link-repository.eupthere.uk';
const POST_URL = BASE_URL + '/api/links';

const MAX_AI_INPUT_CHARACTER_COUNT = 300;

// Initialize PostHog on service worker startup
try {
  PostHogUtils.initPostHog();
} catch (error) {
  console.error('PostHog initialization failed:', error);
}

// Track extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Track first installation
    PostHogUtils.trackEvent('extension_installed', {
      version: chrome.runtime.getManifest().version,
    });
  } else if (details.reason === 'update') {
    // Track extension update
    PostHogUtils.trackEvent('extension_updated', {
      previous_version: details.previousVersion,
      current_version: chrome.runtime.getManifest().version,
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveLink') {
    saveLink(request.data).then(sendResponse);
    // https://developer.chrome.com/docs/extensions/develop/concepts/messaging#responses
    return true; // Will respond asynchronously
  } else if (request.action === 'summarize') {
    summarizeContent(request.content, request.aiPassword)
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function summarizeContent(content, aiPassword) {
  try {
    // Track AI summarize start
    PostHogUtils.trackEvent('extension_ai_summarize_started', {
      content_length: content.slice(0, MAX_AI_INPUT_CHARACTER_COUNT).length,
    });

    const response = await fetch(BASE_URL + '/api/ai/summary', {
      method: 'POST',
      body: JSON.stringify({ content: content.slice(0, MAX_AI_INPUT_CHARACTER_COUNT), aiPassword }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });

    if (response.ok) {
      const json = await response.json();
      
      // Track successful summarization
      PostHogUtils.trackEvent('extension_ai_summarize_success', {
        tags_count: json.data?.tags?.length || 0,
      });
      
      return { success: true, data: json.data };
    } else {
      const errorJson = await response.json().catch(() => ({}));
      
      // Track summarization failure
      PostHogUtils.trackEvent('extension_ai_summarize_failed', {
        error: errorJson.message || '요약 실패',
      });
      
      return { success: false, error: errorJson.message || '요약 실패' };
    }
  } catch (error) {
    // Track summarization error
    PostHogUtils.trackEvent('extension_ai_summarize_error', {
      error: error.message,
    });
    
    return { success: false, error: error.message };
  }
}

async function saveLink(formData) {
  try {
    // Track link save attempt
    PostHogUtils.trackEvent('extension_link_save_started', {
      tags_count: formData.tags?.length || 0,
      has_summary: !!formData.summary,
      team_id: formData.teamId,
    });

    const response = await fetch(POST_URL, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });

    if (response.ok) {
      const json = await response.json();
      
      // Track successful link save
      PostHogUtils.trackEvent('extension_link_save_success', {
        tags_count: formData.tags?.length || 0,
        has_summary: !!formData.summary,
        team_id: formData.teamId,
      });
      
      return { success: true, data: json };
    } else {
      // Track link save failure
      PostHogUtils.trackEvent('extension_link_save_failed', {
        error: '저장 실패',
      });
      
      return { success: false, error: '저장 실패' };
    }
  } catch (error) {
    // Track link save error
    PostHogUtils.trackEvent('extension_link_save_error', {
      error: error.message,
    });
    
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

// Notification click handler: open dashboard
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId === 'teamstash-new-links') {
    const { teamId } = await chrome.storage.sync.get('teamId');
    if (teamId) {
      // Track notification click
      PostHogUtils.trackEvent('extension_notification_clicked', {
        notification_type: 'new_links',
        team_id: teamId,
      });
      
      chrome.tabs.create({ url: `${FE_BASE_URL}/${teamId.toLowerCase()}` });
    }
    chrome.notifications.clear(notificationId);
    await chrome.storage.local.set({ unseenLinkCount: 0 });
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
        const { unseenLinkCount } = await chrome.storage.local.get(['unseenLinkCount']);
        const totalNewLinks = (unseenLinkCount || 0) + newLinks.length;

        // Track new links notification
        PostHogUtils.trackEvent('extension_new_links_notification', {
          new_links_count: newLinks.length,
          total_unseen: totalNewLinks,
          team_id: teamId,
        });

        const notificationId = 'teamstash-new-links';
        chrome.notifications.create(notificationId, {
          type: 'basic',
          iconUrl: 'images/icon-128.png',
          title: '[TeamStash] 새로운 링크 알림',
          message: `${totalNewLinks}개의 새로운 링크가 등록되었습니다.`,
          priority: 2
        });

        chrome.storage.local.set({
          unseenLinkCount: totalNewLinks
        });
      }

      await chrome.storage.sync.set({ lastCheck: formattedNow });
    }
  } catch (error) {
    console.error('Error checking links:', error);
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('activated');
  showSummary(activeInfo.tabId);
  checkDashboardVisit(activeInfo.tabId);
});
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('change complete');
    showSummary(tabId);
    checkDashboardVisit(tabId);
  }
});

async function checkDashboardVisit(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    const { teamId } = await chrome.storage.sync.get('teamId');
    if (!teamId) return;

    const dashboardUrl = `${FE_BASE_URL}/${teamId.toLowerCase()}`;

    if (tab.url.startsWith(dashboardUrl)) {
      // Track dashboard visit
      PostHogUtils.trackEvent('extension_dashboard_visited', {
        team_id: teamId,
      });
      
      await chrome.storage.local.set({ unseenLinkCount: 0 });
      chrome.notifications.clear('teamstash-new-links');
    }
  } catch (error) {
    console.debug('Error checking dashboard visit:', error);
  }
}

async function showSummary(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url?.startsWith('http')) {
      chrome.storage.session.set({ pageContent: null });
      return;
    }
    const injection = await chrome.scripting.executeScript({
      target: { tabId },
      files: ['scripts/extract-content.js']
    });

    const result = injection?.[0]?.result;
    chrome.storage.session.set({ pageContent: result || null });

  } catch (error) {
    console.debug('Summary extraction skipped:', error.message);
    chrome.storage.session.set({ pageContent: null });
  }
}