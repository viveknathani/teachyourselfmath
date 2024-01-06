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
        problem.totalComments > 1 ? `${problem.totalComments} comments`
        : (problem.totalComments === 1 ? `1 comment` : `discuss`)}`;
    const tags = problem.tags.join(',');
    const timeAgo = getTimeAgo(problem.createdAt);
    document.getElementById('problem-title').innerText = problem.title;
    document.getElementById('problem-meta').innerText = `${timeAgo} | ${commentText} | ${tags}`;
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
        commentMeta.className = 'comment-meta';
        const timeAgo = getTimeAgo(comment.createdAt);
        const author = comment.author;
        commentMeta.innerText = `${timeAgo} | ${author}`;
        commentDiv.appendChild(commentMeta);

        const commentContent = document.createElement('p');
        commentContent.innerText = comment.content;
        commentDiv.appendChild(commentContent);

        const replyButton = document.createElement('button');
        replyButton.innerText = 'reply';
        replyButton.onclick = () => {
            showReplyArea(comment.id);
        };
        commentDiv.appendChild(replyButton);

        if (comment.replyCount > 0) {
            const showRepliesButton = document.createElement('button');
            showRepliesButton.innerText = 'show replies';
            showRepliesButton.onclick = () => {
                fetchReplies(comment.id);
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
        } else {
            document.getElementById('add-comment-message').innerText = 'something went wrong!';
        }
    });
}

function showReplyArea(commentId) {
    const commentDiv = document.getElementById(`comment-${commentId}`);
    const textarea = document.createElement('textarea');
    const replyButton = document.createElement('button');
    replyButton.innerText = 'add reply';
    replyButton.onclick = () => {
        addReply(commentId);
    }
    textarea.id = `reply-for-${commentId}`;
    commentDiv.prepend(replyButton);
    commentDiv.prepend(textarea);
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

function fetchReplies(commentId) {
    fetch(`/api/v1/comments/problem/${problemId}/parent/${commentId}`, {
        method: 'GET',
    }).then(res => res.json())
    .then(res => {
        if (res.data) {
            displayReplies(commentId, res.data);
        }
    });
}

function displayReplies(commentId, replies) {
    const commentDiv = document.getElementById(`comment-${commentId}`);
    for (const reply of replies) {
        const replyDiv = document.createElement('div');
        commentDiv.className = 'reply';
        commentDiv.id = `reply-${reply.id}`;

        const replyMeta = document.createElement('p');
        replyMeta.className = 'reply-meta';
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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-comment-button').addEventListener('click', addComment);
    fetchProblem();
    fetchComments();
});