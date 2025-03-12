document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsList = document.getElementById('problems-list');
    const resultsInfo = document.getElementById('results-info');

    function getTimeAgo(date) {
        let seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;

        if (interval > 1) {
            return `${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'year' : 'years'} ago`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return `${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'month' : 'months'} ago`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return `${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'day' : 'days'} ago`;
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return `${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'hour' : 'hours'} ago`;
        }
        interval = seconds / 60;
        if (interval > 1) {
            return `${Math.floor(interval)} ${Math.floor(interval) === 1 ? 'minute' : 'minutes'} ago`;
        }
        return `${Math.floor(seconds)} ${Math.floor(seconds) === 1 ? 'second' : 'seconds'} ago`;
    }

    // Function to render a problem
    const renderProblem = (problem) => {
        const li = document.createElement('li');
        
        const contentDiv = document.createElement('div');
        contentDiv.style.width = '100%';
        
        const topDiv = document.createElement('div');
        topDiv.id = 'topDiv';
        topDiv.className = 'font-primary';
        
        const bottomDiv = document.createElement('div');
        bottomDiv.id = 'bottomDiv';
        bottomDiv.className = 'font-accent';
        
        const p1 = document.createElement('p');
        const p2 = document.createElement('p');
        
        const a = document.createElement('a');
        a.innerText = problem.title;
        a.href = `/problem?id=${problem.id}`;
        
        const commentText = `${problem.totalComments > 1 ? `${problem.totalComments} comments` : problem.totalComments === 1 ? '1 comment' : 'discuss'}`;
        const tags = problem.tags ? problem.tags.join(',') : '';
        
        p1.appendChild(a);
        p2.innerHTML = `<a href='/problem?id=${problem.id}'>${commentText}</a> | <a href='/?tags=${encodeURI(tags)}'>${tags}</a> | ${problem.difficulty.toLowerCase()}`;
        
        topDiv.appendChild(p1);
        bottomDiv.appendChild(p2);
        
        contentDiv.appendChild(topDiv);
        contentDiv.appendChild(bottomDiv);
        li.appendChild(contentDiv);
        
        return li;
    };

    // Function to perform search
    const performSearch = async (query) => {
        if (!query.trim()) {
            resultsInfo.textContent = 'Please enter a search term';
            resultsList.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/api/v1/problems/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                const { problems, count } = data.data;
                resultsInfo.textContent = `Found ${count} result${count !== 1 ? 's' : ''}`;
                
                resultsList.innerHTML = '';
                problems.forEach(problem => {
                    resultsList.appendChild(renderProblem(problem));
                });

                // Trigger MathJax to render any math content
                if (window.MathJax) {
                    MathJax.typesetPromise();
                }
            } else {
                resultsInfo.textContent = 'No results found';
                resultsList.innerHTML = '';
            }
        } catch (error) {
            console.error('Search error:', error);
            resultsInfo.textContent = 'An error occurred while searching';
            resultsList.innerHTML = '';
        }
    };

    // Handle search button click
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    // Handle Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    // Check for search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
        searchInput.value = queryParam;
        performSearch(queryParam);
    }
});
