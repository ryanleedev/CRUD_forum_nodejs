/*
    Name: Jeonghyeon Lee
    Date: Apr 3rd
    File: main.js
    Lab Objective: java script file for events
*/

let currentPage = 1;

// Load posts on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    loadPosts();
    
    // Write button event
    const btn_write = document.querySelector("#btn_write");
    if(btn_write){
        console.log('Write button found, adding event listener');
        btn_write.addEventListener("click", (e) => {
            e.preventDefault();
            console.log('Write button clicked, navigating to /create');
            window.location.href = '/create';
        });
    } else {
        console.error('Write button not found!');
    }
});

// Load posts from API
async function loadPosts(page = 1) {
    try {
        console.log('Loading posts for page:', page);
        const response = await fetch(`/api/posts?page=${page}&limit=10`);
        console.log('API response status:', response.status);
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (response.ok) {
            displayPosts(data.posts);
            displayPagination(data.currentPage, data.totalPages, data.total);
            currentPage = page;
        } else {
            console.error('Error loading posts:', data.error);
            document.getElementById('postsTableBody').innerHTML = 
                '<tr><td colspan="5" class="text-center text-danger">Error loading posts: ' + data.error + '</td></tr>';
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('postsTableBody').innerHTML = 
            '<tr><td colspan="5" class="text-center text-danger">Error loading posts: ' + error.message + '</td></tr>';
    }
}

// Display posts in table
function displayPosts(posts) {
    const tbody = document.getElementById('postsTableBody');
    tbody.innerHTML = '';
    
    if (posts && posts.length > 0) {
        posts.forEach(post => {
            const row = document.createElement('tr');
            row.className = 'view_detail';
            row.dataset.idx = post.idx;
            
            const date = new Date(post.rdate).toISOString().split('T')[0];
            
            row.innerHTML = `
                <td class="text-center">${post.idx}</td>
                <td>${post.subject}</td>
                <td class="text-center">${post.name}</td>
                <td class="text-center">${date}</td>
                <td class="text-center">${post.hit}</td>
            `;
            
            // Add click event
            row.addEventListener("click", () => {
                window.location.href = '/read/' + post.idx;
            });
            
            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No posts found</td></tr>';
    }
}

// Display pagination
function displayPagination(currentPage, totalPages, total) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    // Previous button
    if (currentPage > 1) {
        const prevLink = document.createElement('a');
        prevLink.href = '#';
        prevLink.textContent = 'Previous';
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadPosts(currentPage - 1);
        });
        pagination.appendChild(prevLink);
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        if (i === currentPage) {
            pageLink.className = 'active';
        }
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadPosts(i);
        });
        pagination.appendChild(pageLink);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextLink = document.createElement('a');
        nextLink.href = '#';
        nextLink.textContent = 'Next';
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadPosts(currentPage + 1);
        });
        pagination.appendChild(nextLink);
    }
    
    paginationDiv.appendChild(pagination);
} 