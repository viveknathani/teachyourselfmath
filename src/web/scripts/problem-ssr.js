const searchParams = new URLSearchParams(window.location.search);
const problemId = searchParams.get('id');
const simplemde = new SimpleMDE({
  element: document.getElementById('user-comment'),
  spellChecker: false,
});

function combinedNumericAndStringPart(interval, text) {
  if (interval === 1) {
    return `${interval} ${text.slice(0, -1)} ago`;
  }
  return `${interval} ${text} ago`;
}

function getTimeAgo(date) {
  let seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return combinedNumericAndStringPart(Math.floor(interval), 'years');
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return combinedNumericAndStringPart(Math.floor(interval), 'months');
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return combinedNumericAndStringPart(Math.floor(interval), 'days');
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return combinedNumericAndStringPart(Math.floor(interval), 'hours');
  }
  interval = seconds / 60;
  if (interval > 1) {
    return combinedNumericAndStringPart(Math.floor(interval), 'minutes');
  }
  return combinedNumericAndStringPart(Math.floor(seconds), 'seconds');
}

function showReplyArea(commentId) {
  const commentDiv = document.getElementById(`comment-${commentId}`);
  const textarea = document.createElement('textarea');
  textarea.cols = 50;
  textarea.rows = 10;
  const replyButton = document.createElement('button');
  replyButton.innerText = 'add reply';
  replyButton.classList.add('reply-buttons');
  replyButton.onclick = () => {
    addReply(commentId);
  };
  textarea.id = `reply-for-${commentId}`;
  commentDiv.appendChild(textarea);
  commentDiv.appendChild(replyButton);
}

function addReply(commentId) {
  const content = document.getElementById(`reply-for-${commentId}`).value;
  fetch('/api/v1/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({
      problemId,
      content,
      parentId: Number(commentId),
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === 'success') {
        window.location.reload();
      } else {
        document.getElementById('add-comment-message').innerText =
          'something went wrong!';
      }
    });
}

function fetchReplies(commentId, element) {
  fetch(`/api/v1/comments/problem/${problemId}/parent/${commentId}`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.data) {
        displayReplies(commentId, res.data);
        element.innerText = '';
      }
    });
}

function displayReplies(commentId, replies) {
  const commentDiv = document.getElementById(`comment-${commentId}`);
  const repliesDiv = document.createElement('div');
  repliesDiv.className = 'replies';
  replies.forEach((reply) => {
    const replyDiv = document.createElement('div');
    replyDiv.className = 'reply';
    const replyMeta = document.createElement('p');
    const timeAgo = getTimeAgo(reply.createdAt);
    replyMeta.innerText = `${timeAgo} | ${reply.author}`;
    replyMeta.classList.add('font-accent', 'comment-meta');
    replyDiv.appendChild(replyMeta);
    const replyContent = document.createElement('p');
    replyContent.innerHTML = marked.parse(reply.content);
    replyDiv.appendChild(replyContent);
    repliesDiv.appendChild(replyDiv);
  });
  commentDiv.appendChild(repliesDiv);
  runMathJaxAfterMarkdown();
}

function addComment() {
  const content = simplemde.value();
  fetch('/api/v1/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({
      problemId,
      content,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === 'success') {
        document.getElementById('add-comment-message').innerText =
          'added comment!';
        window.location.reload();
      } else if (res.message && res.message === 'Unauthorized!') {
        document.getElementById('add-comment-message').innerText =
          'you need to login first.';
      } else {
        document.getElementById('add-comment-message').innerText =
          'something went wrong!';
      }
    });
}

function toggleBookmark() {
  fetch(`/api/v1/problems/${problemId}/bookmark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === 'success') {
        const bookmarkButton = document.getElementById('problem-bookmark');
        if (res.data.isBookmarked) {
          bookmarkButton.innerText = 'unbookmark';
        } else {
          bookmarkButton.innerText = 'bookmark';
        }
      }
    });
}

function fetchAndDisplayBookmarkStatus() {
  fetch(`/api/v1/problems/${problemId}/bookmark`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === 'success') {
        const bookmarkButton = document.getElementById('problem-bookmark');
        bookmarkButton.style.display = 'block';
        if (res.data.isBookmarked) {
          bookmarkButton.innerText = 'unbookmark';
        } else {
          bookmarkButton.innerText = 'bookmark';
        }
        bookmarkButton.onclick = toggleBookmark;
      }
    });
}

function runMathJaxAfterMarkdown() {
  const mathElements = document.querySelectorAll('.comment p, .reply p');
  mathElements.forEach((element) => {
    const text = element.textContent;
    if (
      text.includes('$') ||
      text.includes('\\(') ||
      text.includes('\\[') ||
      text.includes('\\begin')
    ) {
      window.MathJax.typesetPromise([element]);
    }
  });
}

function askForLoginOrSetAddCommentListener() {
  const button = document.getElementById('add-comment-button');
  if (localStorage.getItem('authToken')) {
    button.addEventListener('click', addComment);
  } else {
    button.addEventListener('click', () => {
      location.href = '/auth';
    });
    button.innerText = 'login to comment';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  askForLoginOrSetAddCommentListener();
  if (localStorage.getItem('authToken')) {
    fetchAndDisplayBookmarkStatus();
  }
  runMathJaxAfterMarkdown();
});
