async function fetchTree() {
    const res = await fetch('scan.php');
    const data = await res.json();
    window.fileTreeData = data; // Store data globally for search
    renderTree(document.getElementById('file-tree'), data);
    
    // Initialize folders to be open by default
    document.querySelectorAll('.folder').forEach(folder => {
        folder.innerHTML = folder.innerHTML.replace('📁', '📂');
    });
    
    // Setup search functionality
    setupSearch();
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm.length < 2) {
            // Reset the tree if search term is too short
            renderTree(document.getElementById('file-tree'), window.fileTreeData);
            document.querySelectorAll('.folder').forEach(folder => {
                folder.innerHTML = folder.innerHTML.replace('📁', '📂');
            });
            return;
        }
        
        // Search and highlight results
        searchFiles(searchTerm);
    });
}

function searchFiles(searchTerm) {
    const fileTree = document.getElementById('file-tree');
    fileTree.innerHTML = '';
    
    // Create a flattened list of files that match the search term
    const matchingFiles = [];
    
    function findMatchingFiles(items, path = '') {
        items.forEach(item => {
            const currentPath = path ? `${path}/${item.name}` : item.name;
            
            if (item.type === 'folder') {
                findMatchingFiles(item.children, currentPath);
            } else if (item.name.toLowerCase().includes(searchTerm) && item.name.endsWith('.json')) {
                matchingFiles.push({
                    name: item.name,
                    path: item.path,
                    folderPath: path
                });
            }
        });
    }
    
    findMatchingFiles(window.fileTreeData);
    
    // Display matching files
    matchingFiles.forEach(file => {
        const li = document.createElement('li');
        const fileName = file.name;
        const highlightedName = fileName.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
        li.innerHTML = highlightedName;
        li.onclick = () => loadJSON(file.path);
        fileTree.appendChild(li);
    });
    
    if (matchingFiles.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No matching files found';
        li.style.fontStyle = 'italic';
        li.style.color = '#888';
        fileTree.appendChild(li);
    }
}

function renderTree(container, items) {
    container.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        if (item.type === 'folder') {
            const folderSpan = document.createElement('span');
            folderSpan.className = 'folder';
            folderSpan.innerHTML = `<strong>📁 ${item.name}</strong>`;
            folderSpan.onclick = (e) => {
                e.stopPropagation();
                const ul = li.querySelector('ul');
                if (ul) {
                    ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
                    folderSpan.innerHTML = `<strong>${ul.style.display === 'none' ? '📁' : '📂'} ${item.name}</strong>`;
                }
            };
            li.appendChild(folderSpan);
            
            const ul = document.createElement('ul');
            renderTree(ul, item.children);
            li.appendChild(ul);
        } else if (item.name.endsWith('.json')) {
            li.textContent = item.name;
            li.onclick = () => loadJSON(item.path);
        }
        container.appendChild(li);
    });
}
async function loadJSON(path) {
    const res = await fetch(path + '?t=' + new Date().getTime());
    const text = await res.text();

    const titleElem = document.getElementById('yaml-title');
    // Get just the filename from the path (without folders)
    const fileName = path.split('/').pop();
    titleElem.textContent = fileName;

    // Parse JSON to JavaScript object
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        alert('Error reading JSON: ' + e.message);
        return;
    }

    const container = document.getElementById('yaml-display');
    container.innerHTML = '';


    // دالة لعرض الكائن بشكل هرمي
    function renderObject(obj, parent) {
        const ul = document.createElement('ul');

        if (Array.isArray(obj)) {
            obj.forEach(item => {
                const li = document.createElement('li');
                if (typeof item === 'object' && item !== null) {
                    renderObject(item, li);
                } else {
                    li.textContent = item;

                    // زر نسخ للقيمة النصية في المصفوفة
                    const copyBtn = document.createElement('button');
                    copyBtn.textContent = '📋';
                    copyBtn.className = 'copy-btn';
                    copyBtn.onclick = () => copyText(copyBtn, item);
                    li.appendChild(copyBtn);
                }
                ul.appendChild(li);
            });
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                const li = document.createElement('li');

                // span المفتاح
                const keySpan = document.createElement('span');
                keySpan.classList.add('key');
                keySpan.textContent = key + ': ';
                li.appendChild(keySpan);

                // زر نسخ المفتاح
                const copyKeyBtn = document.createElement('button');
                copyKeyBtn.textContent = '🔑';
                copyKeyBtn.className = 'copy-btn';
                copyKeyBtn.onclick = () => copyText(copyKeyBtn, key);
                li.appendChild(copyKeyBtn);

                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    renderObject(obj[key], li);
                } else {
                    // span القيمة
                    const valueSpan = document.createElement('span');
                    valueSpan.classList.add('value');
                    valueSpan.textContent = obj[key];
                    li.appendChild(valueSpan);

                    // زر نسخ القيمة
                    const copyValueBtn = document.createElement('button');
                    copyValueBtn.textContent = '📋';
                    copyValueBtn.className = 'copy-btn';
                    copyValueBtn.onclick = () => copyText(copyValueBtn, obj[key]);
                    li.appendChild(copyValueBtn);
                }
                ul.appendChild(li);
            }
        } else {
            const li = document.createElement('li');
            li.textContent = obj;

            // زر نسخ النص
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋';
            copyBtn.className = 'copy-btn';
            copyBtn.onclick = () => copyText(copyBtn, obj);
            li.appendChild(copyBtn);

            ul.appendChild(li);
        }

        parent.appendChild(ul);
    }


    renderObject(data, container);
}


function escapeJS(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function copyText(button, text) {
    navigator.clipboard.writeText(text).then(() => {
        const original = button.textContent;
        button.textContent = '✓';
        setTimeout(() => {
            button.textContent = original;
        }, 1000);
    });
}


fetchTree();
