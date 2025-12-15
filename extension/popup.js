document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stashForm');
  const commentInput = document.getElementById('comment');
  const tagsInput = document.getElementById('tags');
  const saveButton = document.getElementById('saveButton');

  const POST_URL = 'https://link-repository.eupthere.com/api/link'

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

    const formData = {
      summary: commentInput.value,
      tags: tagsInput.value.split(',').map(v => v.trim()).filter(v => v !== '')
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
