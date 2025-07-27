/*
    Name: Jeonghyeon Lee
    Date: Apr 3rd
    File: read.js
    Lab Objective: JavaScript file for read post page
*/

let currentPost = null;

document.addEventListener('DOMContentLoaded', function() {
    const postId = window.location.pathname.split('/').pop();
    loadPost(postId);
    
    // Back to list button
    if(document.querySelector("#btn_index")){
        const btn_index = document.querySelector("#btn_index") 
        btn_index.addEventListener("click", () => {
            window.location.href = '/';
        });
    }
    
    // Edit button
    if(document.querySelector("#btn_edit")) {
        const btn_edit = document.querySelector("#btn_edit")
        btn_edit.addEventListener("click", () => {
            if (currentPost) {
                document.getElementById('edit_post_id').value = currentPost.idx;
                document.getElementById('edit_subject').value = currentPost.subject;
                document.getElementById('edit_content').value = currentPost.content;
            }
        });
    }
    
    // Delete button
    if(document.querySelector("#btn_delete")) {
        const btn_delete = document.querySelector("#btn_delete")
        btn_delete.addEventListener("click", () => {
            // Modal will be shown automatically
        });
    }
    
    // Edit submit button
    if(document.querySelector("#btn_edit_submit")) {
        const btn_edit_submit = document.querySelector("#btn_edit_submit")
        btn_edit_submit.addEventListener("click", async () => {
            const postId = document.getElementById('edit_post_id').value;
            const subject = document.getElementById('edit_subject').value;
            const content = document.getElementById('edit_content').value;
            const password = document.getElementById('edit_password').value;
            
            if (!subject || !content || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        subject,
                        content,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Post updated successfully!');
                    location.reload();
                } else {
                    alert('Error updating post: ' + data.error);
                }
            } catch (error) {
                console.error('Error updating post:', error);
                alert('Error updating post. Please try again.');
            }
        });
    }
    
    // Delete submit button
    if(document.querySelector("#btn_delete_submit")) {
        const btn_delete_submit = document.querySelector("#btn_delete_submit")
        btn_delete_submit.addEventListener("click", async () => {
            const postId = window.location.pathname.split('/').pop();
            const password = document.getElementById('delete_password').value;
            
            if (!password) {
                alert('Please enter password');
                return;
            }
            
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Post deleted successfully!');
                    window.location.href = '/';
                } else {
                    alert('Error deleting post: ' + data.error);
                }
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Error deleting post. Please try again.');
            }
        });
    }
});

// Load post from API
async function loadPost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        const post = await response.json();
        
        if (response.ok) {
            currentPost = post;
            displayPost(post);
        } else {
            console.error('Error loading post:', post.error);
            document.getElementById('postContent').innerHTML = '<p class="text-danger">Post not found</p>';
        }
    } catch (error) {
        console.error('Error loading post:', error);
        document.getElementById('postContent').innerHTML = '<p class="text-danger">Error loading post</p>';
    }
}

// Display post content
function displayPost(post) {
    const postContent = document.getElementById('postContent');
    const date = new Date(post.rdate).toISOString().split('T')[0];
    
    let imageHtml = '';
    if (post.imglist) {
        imageHtml = `<img src="/uploads/${post.imglist}" class="img-fluid mb-3" alt="Post image">`;
    }
    
    postContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>${post.subject}</h2>
                <div class="text-muted">
                    <small>Author: ${post.name} | Date: ${date} | Views: ${post.hit}</small>
                </div>
            </div>
            <div class="card-body">
                ${imageHtml}
                <div id="img_cont">
                    ${post.content}
                </div>
            </div>
        </div>
    `;
} 