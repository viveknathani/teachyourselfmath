// Get initial state from server-rendered data
let currentPage = parseInt(new URL(window.location).searchParams.get('page')) || 1;
let currentDifficulty = new URL(window.location).searchParams.get('difficulty') || 'ANY';
let currentTags = new URL(window.location).searchParams.get('tags') || '';
let currentBookmarked = new URL(window.location).searchParams.get('bookmarked') || 'ANY';

function updateProblemsList(problems) {
  const problemsList = document.getElementById('problems-list');
  problemsList.innerHTML = '';

  problems.forEach((problem) => {
    const problemDiv = document.createElement('div');
    problemDiv.className = 'problem';

    const titleLink = document.createElement('a');
    titleLink.href = `/problem/${problem.id}`;
    titleLink.className = 'problem-title';
    titleLink.innerText = `Problem #${problem.id}`;

    const content = document.createElement('div');
    content.className = 'problem-content';
    content.innerHTML = problem.description;

    const metadata = document.createElement('div');
    metadata.className = 'problem-metadata';

    const difficulty = document.createElement('div');
    difficulty.className = `difficulty ${problem.difficulty.toLowerCase()}`;
    difficulty.innerText = problem.difficulty;

    const tags = document.createElement('div');
    tags.className = 'tags';
    if (problem.tags) {
      problem.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = tag;
        tags.appendChild(span);
      });
    }

    if (problem.isBookmarked) {
      const bookmark = document.createElement('i');
      bookmark.className = 'fas fa-bookmark bookmark-icon';
      metadata.appendChild(bookmark);
    }

    metadata.appendChild(difficulty);
    metadata.appendChild(tags);

    problemDiv.appendChild(titleLink);
    problemDiv.appendChild(content);
    problemDiv.appendChild(metadata);
    problemsList.appendChild(problemDiv);
  });

  // Re-render MathJax for new content
  window.MathJax.typesetPromise();
}





function changePage(newPage) {
  currentPage = parseInt(newPage);
  const url = new URL(window.location);
  url.searchParams.set('page', currentPage);
  window.history.pushState({}, '', url);
  window.location.href = url.toString();
}

function updateFilters() {
  currentDifficulty = document.getElementById('difficulty-filter').value;
  currentTags = document.getElementById('tags-filter').value;
  currentBookmarked = document.getElementById('bookmark-filter').value;
  currentPage = 1;

  const url = new URL(window.location);
  url.searchParams.set('difficulty', currentDifficulty);
  url.searchParams.set('tags', currentTags);
  url.searchParams.set('bookmarked', currentBookmarked);
  url.searchParams.set('page', currentPage);
  window.location.href = url.toString();
}

function setupFilterListeners() {
  document.getElementById('difficulty-filter').addEventListener('change', updateFilters);
  document.getElementById('tags-filter').addEventListener('change', updateFilters);
  document.getElementById('bookmark-filter').addEventListener('change', updateFilters);
}

function setupTagsFilter() {
  fetch('/api/v1/tags')
    .then((res) => res.json())
    .then((res) => {
      if (res.status === 'success') {
        const tagsFilter = document.getElementById('tags-filter');
        tagsFilter.innerHTML = '<option value="">tags</option>';
        res.data.forEach((tag) => {
          const option = document.createElement('option');
          option.value = tag.name;
          option.innerText = tag.name;
          tagsFilter.appendChild(option);
        });
        tagsFilter.style.display = 'block';
      }
    });
}

function initializeFromUrl() {
  const url = new URL(window.location);
  currentPage = parseInt(url.searchParams.get('page')) || 1;
  currentDifficulty = url.searchParams.get('difficulty') || '';
  currentTags = url.searchParams.get('tags') || '';

  document.getElementById('difficulty-filter').value = currentDifficulty;
  document.getElementById('tags-filter').value = currentTags;
}

document.addEventListener('DOMContentLoaded', () => {
  setupFilterListeners();
  setupTagsFilter();
  initializeFromUrl();
});
