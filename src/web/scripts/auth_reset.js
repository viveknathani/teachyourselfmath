
let the_email = "";

async function sendResetRequest() {
  the_email = document.getElementById('password-reset-email').value;
  const resetResponse = await fetch('/api/v1/users/password/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stage: "SEND_REQUEST",
      data: { email: the_email }
    })
  });
  const resetData = await resetResponse.json();
  if (resetData.status === 'success') {
    document.getElementById("stage1").style.display = "none";
    document.getElementById("stage2").style.display = "block";
    alert('sent!');
  }
}

async function enterCode() {
  const email = the_email;
  const code = document.getElementById("code").value;
  const response = await fetch('/api/v1/users/password/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stage: "ENTER_CODE",
      data: { email, code }
    })
  });
  const data = await response.json();
  if (data.status === 'success') {
    document.getElementById("stage2").style.display = "none";
    document.getElementById("stage3").style.display = "block";
  } else {
    alert(data.message);
  }
}

async function updatePassword() {
  const email = the_email;
  const code = document.getElementById("code").value;
  const newPassword = document.getElementById("newPassword").value;
  const response = await fetch('/api/v1/users/password/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stage: "UPDATE_PASSWORD",
      data: { email, code, newPassword }
    })
  });
  const data = await response.json();
  if (data.status === 'success') {
    localStorage.removeItem('authToken');
    alert("Password updated successfully!");
    window.location.href = '/auth';
  } else {
    alert(data.message);
  }
}
