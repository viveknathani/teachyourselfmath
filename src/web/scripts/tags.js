function getAndSetTags() {
    fetch('/api/v1/tags')
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            const allTags = Object.keys(res.data);
            const ol = document.getElementById('tags-list');
            allTags.forEach(tag => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `/?tags=${tag}`;
                a.innerText = tag;
                li.appendChild(a);
                ol.appendChild(li);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    getAndSetTags();
});