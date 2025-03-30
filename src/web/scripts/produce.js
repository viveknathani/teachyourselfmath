let availableTags = [];

// Fetch tags when page loads
async function fetchTags() {
    try {
        const response = await fetch('/api/v1/tags');
        const data = await response.json();
        if (data.status === 'success') {
            availableTags = Object.keys(data.data);
            // Add initial problem request after tags are loaded
            addProblemRequest();
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}

function createProblemRequestEntry() {
    const div = document.createElement('div');
    div.className = 'problem-request';
    
    const subjectSelect = document.createElement('select');
    subjectSelect.name = 'subject';
    
    availableTags.forEach(tag => {
        const option = document.createElement('option');
        option.innerText = tag;
        option.value = tag;
        subjectSelect.appendChild(option);
    });

    const difficultySelect = document.createElement('select');
    difficultySelect.name = 'difficulty';
    ['easy', 'medium', 'hard'].forEach(difficulty => {
        const option = document.createElement('option');
        option.value = difficulty;
        option.textContent = difficulty;
        difficultySelect.appendChild(option);
    });

    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.name = 'count';
    countInput.value = '1';
    countInput.min = '1';
    countInput.max = '30';



    div.appendChild(subjectSelect);
    div.appendChild(difficultySelect);
    div.appendChild(countInput);

    
    return div;
}

function addProblemRequest() {
    const container = document.getElementById('problemRequests');
    container.appendChild(createProblemRequestEntry());
}

async function generateProblemSet() {
    const requests = Array.from(document.getElementById('problemRequests').children).map(div => ({
        subject: div.querySelector('[name="subject"]').value,
        difficulty: div.querySelector('[name="difficulty"]').value,
        count: parseInt(div.querySelector('[name="count"]').value)
    }));

    const maxProblems = 30;

    try {
        const response = await fetch('/api/v1/problems/produce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                problems: requests,
                maxProblems
            })
        });

        if (response.status === 429) {
            alert('You can only produce 3 problem sets per minute');
            return;
        }

        const data = await response.json();
        if (data.status === 'error') {
            alert(data.message);
            return;
        }

        const { problems } = data.data;

        const resultDiv = document.getElementById('problemSetResult');
        resultDiv.innerHTML = '<ol id="problems-list"></ol>';
        const problemsList = document.getElementById('problems-list');

        problems.forEach((problem, i) => {
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

            p1.className = 'font-primary';
            p2.className = 'font-accent';       

            const title = document.createElement('a');
            title.innerText = problem.description;
            title.href = `/problem?id=${problem.id}`;
            
            p1.appendChild(title);
            p2.innerHTML = `${problem.difficulty.toLowerCase()} | ${problem.tagsList ? problem.tagsList.split(',').map(tag => `<a href='/?tags=${encodeURI(tag.trim())}'>${tag.trim()}</a>`).join(', ') : ''}`;
            
            topDiv.appendChild(p1);
            bottomDiv.appendChild(p2);
            
            contentDiv.appendChild(topDiv);
            contentDiv.appendChild(bottomDiv);
            
            li.appendChild(contentDiv);
            problemsList.appendChild(li);
        });
        resultDiv.classList.remove('hidden');

        // Trigger MathJax to render any math content
        if (window.MathJax) {
            MathJax.typesetPromise().catch(err => {
                console.error('MathJax error:', err);
            });
        }
    } catch (error) {
        console.log(error);
        alert('error: ' + error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchTags();

    // Add event listeners
    document.getElementById('add-request').addEventListener('click', addProblemRequest);
    document.getElementById('generate-button').addEventListener('click', generateProblemSet);
});
