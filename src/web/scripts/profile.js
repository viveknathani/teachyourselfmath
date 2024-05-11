function fetchProfile() {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    window.location.href= '/auth';
    return;
  }
  fetch('/api/v1/users/profile', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  })
  .then((res) => res.json())
  .then((res) => {
    if (res.data) {
      const nameText = document.getElementById("current-name");
      nameText.innerText = res.data.name;
    }
  }).catch(() => {
    window.location.href= '/auth';
  });
}

function updateProfile() {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    window.location.href= '/auth';
    return;
  }
  const input = document.getElementById("update-name-form-input-element");
  fetch('/api/v1/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      name: input.value,
    })
  })
  .then((res) => res.json())
  .then((res) => {
    fetchProfile();
  }).catch(() => {
    window.location.href= '/auth';
  });
}

document.addEventListener('DOMContentLoaded', function() {
  fetchProfile();
  document.getElementById('update-name-button').addEventListener('click', updateProfile);
});