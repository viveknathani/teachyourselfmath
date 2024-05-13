function getFormData(formId) {
  const result = {};
  const form = document.getElementById(formId);
  const data = new FormData(form);
  data.forEach((value, key) => result[key] = value);
  return result;
}

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

function updatePassword() {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    window.location.href= '/auth';
    return;
  }
  const { currentPassword, newPassword } = getFormData('update-password-form-element');
  fetch('/api/v1/users/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  }).then((res) => res.json())
  .then((res) => {
    if (res.status == 'error') {
      document.getElementById('update-password-message').innerText = res.message;
    } else {
      document.getElementById('update-password-message').innerText = 'Yay! Redirecting you to login again now.';
      localStorage.removeItem('authToken');
      setTimeout(() => {
        window.location.href= '/auth';
      }, 3000);
    }
  }).catch((err) => {
    console.log('oops!', err);
  });;
}

document.addEventListener('DOMContentLoaded', function() {
  fetchProfile();
  document.getElementById('update-name-button').addEventListener('click', updateProfile);
  document.getElementById('update-password-button').addEventListener('click', updatePassword);
});