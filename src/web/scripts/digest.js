const searchParams = new URLSearchParams(window.location.search);
const digestId = searchParams.get('id');

function fetchDigest() {
    fetch(`/api/v1/configurations/digests/${digestId}`, {
        method: 'GET',
    }).then(res => res.json())
    .then(res => {
        if (res.data) {
            displayDigest(res.data);
        }
    });
}

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

function displayDigest(digest) {
    document.getElementById('user-name').innerText = `${digest.user.name}'s Digest`;
    const problemsListDiv = document.getElementById('problems-list');
    const list = document.getElementsByTagName('ol')[0];
    list.innerHTML = '';
    digest.problems.forEach(problem => {
        const li = document.createElement('li');
        const topDiv = document.createElement('div');
        topDiv.id = "topDiv";
        topDiv.className = "font-primary";
        const bottomDiv = document.createElement('div');
        bottomDiv.id = "bottomDiv";
        bottomDiv.className = "font-accent";
        const p1 = document.createElement('p');
        const p2 = document.createElement('p');
        const a = document.createElement('a');
        a.innerText = problem.title;
        a.href = `/problem?id=${problem.id}`;
        const commentText = `${
            problem.totalComments > 1 ? `${problem.totalComments} comments`
            : (problem.totalComments === 1 ? `1 comment` : `discuss`)}`;
        const timeAgo = getTimeAgo(problem.createdAt);
        p1.appendChild(a);
        p2.innerHTML = `${timeAgo} | <a href='/problem?id=${problem.id}'>${commentText}</a> | ${problem.difficulty.toLowerCase()}`;
        topDiv.appendChild(p1);
        bottomDiv.appendChild(p2);
        li.appendChild(topDiv);
        li.appendChild(bottomDiv);
        list.appendChild(li);
    });
    problemsListDiv.appendChild(list);
    window.MathJax.typeset();

}

document.addEventListener('DOMContentLoaded', function() {
    fetchDigest();
});
