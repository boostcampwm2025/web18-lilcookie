// Initialize PostHog
try {
  PostHogUtils.initPostHog();
} catch (error) {
  console.error('PostHog initialization failed:', error);
}

// 설정을 chrome.storage에 저징
const saveOptions = () => {
  const camperId = document.getElementById('camperId').value;
  const teamId = document.getElementById('teamId').value;
  const aiPassword = document.getElementById('aiPassword').value;

  chrome.storage.sync.set(
    { camperId, teamId, aiPassword },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      const saveBtn = document.getElementById('saveBtn');
      
      status.textContent = '설정이 저장되었습니다.';
      saveBtn.disabled = true;

      // Track settings saved and identify user
      PostHogUtils.trackEvent('extension_settings_saved', {
        has_camper_id: !!camperId,
        has_team_id: !!teamId,
        has_ai_password: !!aiPassword,
        team_id: teamId,
      });

      // Identify user with camperId
      if (camperId) {
        PostHogUtils.identifyUser(camperId, {
          team_id: teamId,
        });
      }

      setTimeout(() => {
        status.textContent = '';
        saveBtn.disabled = false;
      }, 1000);
    }
  );
};

// 저장된 설정 표시
const restoreOptions = () => {
  // Track options page opened
  PostHogUtils.trackEvent('extension_settings_page_opened');
  
  chrome.storage.sync.get(
    { camperId: '', teamId: '', aiPassword: '' },
    (items) => {
      document.getElementById('camperId').value = items.camperId;
      document.getElementById('teamId').value = items.teamId;
      document.getElementById('aiPassword').value = items.aiPassword;
      
      // Identify user if camperId exists
      if (items.camperId) {
        PostHogUtils.identifyUser(items.camperId, {
          team_id: items.teamId,
        });
      }
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);