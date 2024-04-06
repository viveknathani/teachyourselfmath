const searchParams = new URLSearchParams(window.location.search);
const problemId = searchParams.get('id');

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
        return combinedNumericAndStringPart(Math.floor(interval), "years");
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return combinedNumericAndStringPart(Math.floor(interval), "months");
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return combinedNumericAndStringPart(Math.floor(interval), "days");
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return combinedNumericAndStringPart(Math.floor(interval), "hours");
    }
    interval = seconds / 60;
    if (interval > 1) {
        return combinedNumericAndStringPart(Math.floor(interval), "minutes");
    }
    return combinedNumericAndStringPart(Math.floor(seconds), "seconds");
}

function fetchProblem() { 
    fetch(`/api/v1/problems/${problemId}`, {
        method: 'GET',
    }).then(res => res.json())
    .then(res => {
        if (res.data) {
            displayProblem(res.data);
        }
    });
}

function fetchComments() {
    fetch(`/api/v1/comments/problem/${problemId}`, {
        method: 'GET',
    }).then(res => res.json())
    .then(res => {
        if (res.data) {
            displayComments(res.data);
        }
    });
}

function displayProblem(problem) {
    const commentText = `${
        problem.totalComments !== 1
            ? `${problem.totalComments} comments`
            : '1 comment'
        }`;
    const tags = problem.tags.join(',');
    const timeAgo = getTimeAgo(problem.createdAt);
    document.getElementById('problem-title').innerText = `Problem #${problem.id}`;
    document.getElementById('problem-meta').innerText = `${timeAgo} | ${commentText} | ${tags} | ${problem.difficulty.toLowerCase()}`;
    document.getElementById('problem-meta').className = 'font-accent';
    document.getElementById('problem-description').innerText = problem.description;
    window.MathJax.typeset();
}

function displayComments(comments) {
    const commentsDiv = document.getElementById('comments');
    for (const comment of comments) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.id = `comment-${comment.id}`;

        const commentMeta = document.createElement('p');
        const timeAgo = getTimeAgo(comment.createdAt);
        const author = comment.author;
        commentMeta.innerText = `${timeAgo} | ${author}`;
        commentMeta.classList.add('font-accent', 'comment-meta');
        commentDiv.appendChild(commentMeta);

        const commentContent = document.createElement('p');
        commentContent.innerText = comment.content;
        commentDiv.appendChild(commentContent);

        const replyButton = document.createElement('button');
        replyButton.innerText = 'reply';
        replyButton.classList.add('comment-action-buttons')
        replyButton.onclick = () => {
            showReplyArea(comment.id);
        };
        commentDiv.appendChild(replyButton);

        if (comment.replyCount > 0) {
            const showRepliesButton = document.createElement('button');
            showRepliesButton.innerText = 'show replies';
            showRepliesButton.classList.add('comment-action-buttons');
            showRepliesButton.onclick = () => {
                fetchReplies(comment.id, showRepliesButton);
            }
            commentDiv.appendChild(showRepliesButton);
        }

        commentsDiv.appendChild(commentDiv);
    }
}

function addComment() {
    const content = document.getElementById('user-comment').value;
    fetch('/api/v1/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
            problemId,
            content,
        }),
    }).then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            document.getElementById('add-comment-message').innerText = 'added comment!';
            window.location.reload();
        } else if (res.message && res.message === 'Unauthorized!') {
            document.getElementById('add-comment-message').innerText = 'you need to login first.';
        } else {
            document.getElementById('add-comment-message').innerText = 'something went wrong!';
        }
    });
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
    }
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
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
            problemId,
            content,
            parentId: Number(commentId),
        }),
    }).then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            window.location.reload();
        } else {
            document.getElementById('add-comment-message').innerText = 'something went wrong!';
        }
    });
}

function fetchReplies(commentId, element) {
    fetch(`/api/v1/comments/problem/${problemId}/parent/${commentId}`, {
        method: 'GET',
    }).then(res => res.json())
    .then(res => {
        if (res.data) {
            displayReplies(commentId, res.data);
            element.innerText = '';
        }
    });
}

function displayReplies(commentId, replies) {
    const commentDiv = document.getElementById(`comment-${commentId}`);
    for (const reply of replies) {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'reply';
        replyDiv.id = `reply-${reply.id}`;

        const replyMeta = document.createElement('p');
        replyMeta.classList.add('font-accent', 'reply-meta');
        const timeAgo = getTimeAgo(reply.createdAt);
        const author = reply.author;
        replyMeta.innerText = `${timeAgo} | ${author}`;
        replyDiv.appendChild(replyMeta);

        const replyContent = document.createElement('p');
        replyContent.innerText = reply.content;
        replyDiv.appendChild(replyContent);

        commentDiv.appendChild(replyDiv);
    }
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

function toggleBookmark() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        return;
    }
    const bookmarkButton = document.getElementById('problem-bookmark');
    const isBookmarked = bookmarkButton.innerText === 'Bookmarked';
    fetch(`/api/v1/problems/${problemId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${authToken}`
        },
    }).then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            fetchAndDisplayBookmarkStatus();
        } else {
            console.error('Failed to toggle bookmark:', res.message);
        }
    }).catch(err => {
        console.error('Error toggling bookmark:', err);
    });
}


function fetchAndDisplayBookmarkStatus() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        return;
    }
    fetch(`/api/v1/problems/${problemId}/is-bookmarked`, {
        method: 'GET',
        headers: {
            'authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
    }).then(res => res.json())
    .then(res => {
        const bookmarkButton = document.getElementById('problem-bookmark');
        bookmarkButton.style.display = 'block';
        if (res.data.isBookmarked) {
            bookmarkButton.innerText = 'Bookmarked';
            bookmarkButton.classList.add('bookmarked');
        } else {
            bookmarkButton.innerText = 'Bookmark';
            bookmarkButton.classList.remove('bookmarked');
        }
        bookmarkButton.onclick = toggleBookmark;
    }).catch(err => {
        console.error('Failed to fetch bookmark status:', err);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    askForLoginOrSetAddCommentListener();
    fetchProblem();
    fetchComments();
    fetchAndDisplayBookmarkStatus();
});