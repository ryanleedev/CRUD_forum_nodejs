/*
    Name: Jeonghyeon Lee
    Date: Apr 3rd
    File: create.js
    Lab Objective: JavaScript file for create post page
*/

document.addEventListener('DOMContentLoaded', function() {
    const createForm = document.getElementById('createForm');
    const cancelBtn = document.getElementById('btn_cancel');
    
    // Cancel button event
    if(cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            window.location.href = '/';
        });
    }
    
    // Form submit event
    if(createForm) {
        createForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const formData = new FormData(createForm);
            const postData = {
                subject: formData.get('subject'),
                name: formData.get('name'),
                password: formData.get('password'),
                content: formData.get('content')
            };
            
            try {
                const response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Post created successfully!');
                    window.location.href = '/';
                } else {
                    console.error('Server error:', data);
                    alert('Error creating post: ' + (data.details || data.error));
                }
            } catch (error) {
                console.error('Error creating post:', error);
                alert('Error creating post. Please try again.');
            }
        });
    }
}); 