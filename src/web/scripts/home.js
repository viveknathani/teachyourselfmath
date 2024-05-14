let selectedDifficultyList = [];
let selectedTagsList = [];
let bookmarkList = [];

function isBookmarked() {
    return bookmarkList.length !== 0 && bookmarkList[0] === "true";
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


function displayProblems(problems, paginationConfig) {
    const list = document.getElementsByTagName('ol')[0];
    list.innerHTML = '';
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
        p2.innerHTML = `${timeAgo} | <a href='/problem?id=${problem.id}'>${commentText}</a> |  <a href='/?tags=${encodeURI(tags)}'>${tags}</a>  | ${problem.difficulty.toLowerCase()}`;
        topDiv.appendChild(p1);
        bottomDiv.appendChild(p2);
        li.appendChild(topDiv);
        li.appendChild(bottomDiv);
        list.appendChild(li);
    });
    const pagination = document.getElementById('pagination');
    const searchParams = new URLSearchParams(window.location.search);
    pagination.innerHTML = '';
    const params = new URLSearchParams({
        tags: searchParams.get('tags') || '',
        difficulty: selectedDifficultyList.join(','),
    });

    if (paginationConfig.hasPreviousPage) {
        const prevLink = document.createElement('a');
        prevLink.href = `/?page=${paginationConfig.currentPage - 1}&${params.toString()}`;
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
        nextLink.href = `/?page=${paginationConfig.currentPage + 1}&${params.toString()}`;
        nextLink.innerText = 'next';
        pagination.appendChild(nextLink);
    }
    window.MathJax.typeset();
}

function fillFilterListFromSearchParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const difficultyParam = searchParams.get('difficulty');
    const tagsParam = searchParams.get('tags');
    selectedDifficultyList = (difficultyParam !== '' && difficultyParam?.split(',')) || [];
    selectedTagsList = (tagsParam !== '' && tagsParam?.split(',')) || [];
}

function fetchProblems() {
    const searchParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams({
        page: searchParams.get('page') || 1,
        tags: selectedTagsList.join(','),
        difficulty: selectedDifficultyList.join(','),
    });
    if (isBookmarked()) {
        params.set('bookmarked', "true");
    } else {
        params.delete('bookmarked');
    }
    searchParams.set('page', params.page);
    searchParams.set('tags', params.tags);
    searchParams.set('difficulty', params.difficulty);
    const url = new URL(window.location);
    const paramsObject = Object.fromEntries(params);
    url.searchParams.set('page', paramsObject.page);
    url.searchParams.set('tags', paramsObject.tags);
    url.searchParams.set('difficulty', paramsObject.difficulty);
    if (isBookmarked()) {
        url.searchParams.set('bookmarked', "true");
    } else {
        url.searchParams.delete('bookmarked');
    }
    window.history.pushState(null, '', url.toString());
    fetch(`/api/v1/problems?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
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
} else {
    document.getElementById('profile-link').style.display = 'none';
}

function fillSelectedFiltersFromUrl(listToCheckWith, searchQuery) {
    if (listToCheckWith.length === 0) {
        listToCheckWith = searchQuery.split(',');
    }
    return listToCheckWith;
}

function toTitleCase(str) {
    if (!str) return "";
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return word.toLowerCase();
      })
      .replace(/\s+/g, " ");
  }

function renderSelectedDifficultyList() {
   const difficultyListDiv = document.getElementById('difficulty-list');
   difficultyListDiv.innerHTML = '';
   for (difficulty of selectedDifficultyList) {
        const button = document.createElement('button');
        button.className = 'closeButton';
        button.innerHTML = `${toTitleCase(difficulty)}  <i class="fa fa-minus-circle" aria-hidden="true"></i>`;
        button.onclick = () => {
            selectedDifficultyList = selectedDifficultyList.filter(item => item !== difficulty);
            renderSelectedDifficultyList();
            fetchProblems();
        }
        difficultyListDiv.appendChild(button);
   }
}

function renderSelectedTagsList() {
   const tagsListDiv = document.getElementById('tags-list');
   tagsListDiv.innerHTML = '';
   for (const tag of selectedTagsList) {
        const button = document.createElement('button');
        button.className = 'closeButton';
        button.innerHTML = `${toTitleCase(tag)}  <i class="fa fa-minus-circle" aria-hidden="true"></i>`;
        button.onclick = () => {
            selectedTagsList = selectedTagsList.filter(item => item !== tag);
            renderSelectedTagsList();
            fetchProblems();
        }
        tagsListDiv.appendChild(button);
   }
}

function renderBookmarkList() {
    const bookmarkListDiv = document.getElementById('bookmark-list');
    bookmarkListDiv.innerHTML = '';
    for (const bookmark of bookmarkList) {
        const button = document.createElement('button');
        button.className = 'closeButton';
        button.innerHTML = `${toTitleCase(bookmark === 'true' ? 'bookmarked' : '')}  <i class="fa fa-minus-circle" aria-hidden="true"></i>`;
        button.onclick = () => {
            bookmarkList = bookmarkList.filter(item => item !== bookmark);
            renderBookmarkList();
            fetchProblems();
        }
        bookmarkListDiv.appendChild(button);
    }
}

function listenToFilterChanges() {
    const difficultySelect = document.getElementById('difficulty-filter');
    difficultySelect.addEventListener('change', function() {
        const selectedDifficulty = this.value;
        if (selectedDifficulty === 'ANY') {
            selectedDifficultyList = [];
        } else {
            selectedDifficultyList.push(selectedDifficulty);
            selectedDifficultyList = Array.from(new Set(selectedDifficultyList));
        }
        difficultySelect.selectedIndex = 0;
        renderSelectedDifficultyList();
        fetchProblems();
    });
    const tagsSelect = document.getElementById('tags-filter');
    tagsSelect.addEventListener('change', function() {
        const selectedTag = this.value;
        if (selectedTag === 'ANY') {
            selectedTagsList = [];
        } else {
            selectedTagsList.push(selectedTag);
            selectedTagsList = Array.from(new Set(selectedTagsList));
        }
        tagsSelect.selectedIndex = 0;
        renderSelectedTagsList();
        fetchProblems();
    });
    const bookmarkSelect = document.getElementById('bookmark-filter');
    bookmarkSelect.addEventListener('change', function() {
        const bookmark = this.value;
        bookmarkList.push(bookmark);
        bookmarkList = Array.from(new Set(bookmarkList));
        bookmarkSelect.selectedIndex = 0;
        renderBookmarkList();
        fetchProblems();
    });
}

function fetchTags() {
    fetch('/api/v1/tags')
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            const allTags = Object.keys(res.data);
            allTags.unshift('ANY');
            const tagsDropdown = document.getElementById('tags-filter');
            allTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                if (tag === 'ANY') {
                    option.innerText = 'category';
                } else {
                    option.innerText = tag;
                }
                tagsDropdown.appendChild(option);
            });
            tagsDropdown.style.display = 'block';
        }
    });
}

function checkProfileSteps() {
    if (localStorage.getItem('authToken')) {
        document.getElementById('bookmark-filter').style.display = 'block';
    } else {
        bookmarkList = [];
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkProfileSteps();
    fillFilterListFromSearchParams();
    renderSelectedDifficultyList();
    renderSelectedTagsList();
    renderBookmarkList();
    fetchProblems();
    fetchTags();
    listenToFilterChanges();
});