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


function displayProblems(problems, paginationConfig) {
    const list = document.getElementsByTagName('ol')[0];
    list.start = paginationConfig.startingNumberForList;
    problems.forEach(problem => {
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
        const tags = problem.tags.join(',');
        const timeAgo = getTimeAgo(problem.createdAt);
        p1.appendChild(a);
        p2.innerHTML = `${timeAgo} | <a href='/problem?id=${problem.id}'>${commentText}</a> |  <a href='/?tags=${encodeURI(tags)}'>${tags}</a>`;
        topDiv.appendChild(p1);
        bottomDiv.appendChild(p2);
        li.appendChild(topDiv);
        li.appendChild(bottomDiv);
        list.appendChild(li);
    });
    const pagination = document.getElementById('pagination');
    const searchParams = new URLSearchParams(window.location.search);

    if (paginationConfig.hasPreviousPage) {
        const prevLink = document.createElement('a');
        prevLink.href = `/?page=${paginationConfig.currentPage - 1}&tags=${searchParams.get('tags') || ''}`;
        prevLink.innerText = 'prev';
        pagination.appendChild(prevLink);
    }
    if (paginationConfig.hasPreviousPage && paginationConfig.hasNextPage) {
        const divider = document.createElement('p');
        divider.innerHTML = '&nbsp;/&nbsp;';
        pagination.appendChild(divider);
    }
    if (paginationConfig.hasNextPage) {
        const nextLink = document.createElement('a');
        nextLink.href = `/?page=${paginationConfig.currentPage + 1}&tags=${searchParams.get('tags') || ''}`;
        nextLink.innerText = 'next';
        pagination.appendChild(nextLink);
    }
    window.MathJax.typeset();
}


function fetchProblems() {
    const searchParams = new URLSearchParams(window.location.search);
    fetch(`/api/v1/problems?page=${searchParams.get('page') || 1}&tags=${searchParams.get('tags') || ''}`, {
        method: 'GET',
    }).then(res => res.json())
    .then(res => {
        if (res.data) {
            const paginationConfig = {
                currentPage: res.data.currentPage,
                hasPreviousPage: res.data.currentPage !== 1,
                hasNextPage: res.data.currentPage < res.data.totalPages,
                startingNumberForList: (res.data.currentPage - 1) * res.data.pageSize + 1,
            };
            displayProblems(res.data.problems, paginationConfig);
        }
    })
    .catch(err => {
        console.log(err);
    });
}

if (localStorage.getItem('authToken')) {
    document.getElementById('login-link').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    fetchProblems();
});