<!--
    Name: Jeonghyeon Lee
    Date: Apr 3rd
    File: read.php
    Lab Objective: This is read php for detail of post
-->

<?php 
require_once('./dao/postDAO.php'); 
$idx = (isset($_GET['idx']) && $_GET['idx'] != '' && is_numeric($_GET['idx'])) ? $_GET['idx'] : '';

if($idx == ''){
    exit('wrong approach');
}

$postDAO = new postDAO();

$post = $postDAO->getPost($idx);

$postDAO->updateHit($idx);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View</title>

    <!-- bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-aFq/bzH65dt+w6FI2ooMVUpc+21e0SRygnTpmBvdBgSdnuTN7QbdgL+OapgHtvPp" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/js/bootstrap.bundle.min.js" integrity="sha384-qKXV1j0HvMUeCBQ+QVp7JcfGl760yU08IQ+GpUo5hlbpg51QRiuqHAJz8+BrxE/N"
        crossorigin="anonymous"></script>

    <!-- java script -->
    <script src="./main.js" defer></script>

    <!-- css -->
    <link href="./main.css" rel="stylesheet">
</head>
<body>

<div class="container mt-3 ">
    <h1 class="h1">Tech Fourm (Blog)</h1>
</div>
<div class="container my-3 border border-1 vstack">
    <div class="p-3">
        <span class="h3 fw-bolder"><?= $post->getSubject(); ?></span>
    </div>
    <div class="d-flex px-3 border border-top-0 border-start-0 border-end-0 border-bottom-1">
        <span>Author: <?= $post->getName(); ?></span>
        <span class="ms-5 me-auto">View: <?= $post->getHit(); ?></span>
        <span>Post Date: <?= $post->getRdate(); ?></span>
    </div>
    <div class="p-3" id="img_cont">
        <?= $post->getContent(); ?>
    </div>

    <div class="d-flex gap-2 p-3">
        <button class="btn btn-secondary me-auto" id="btn_index">List</button>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal" id="btn_edit">Edit</button>
        <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#modal" id="btn_delete">Delete</button>
    </div>
    

<!-- Modal -->
    <div class="modal" id="modal" tabindex="-1">
        <div class="modal-dialog">
            <form method="post" name="modal_form" action="./process.php">
                <input type="hidden" name="mode" value="">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modal_title">Modal title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="password" name="password" class="form-control" id="password" 
                            placeholder="Please Enter Password">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="btn_password_chk">Confirm</button>
                    </div>
                </div>
            </form>
        </div>
    </div>


    <script>
        var input = document.getElementById("password");

        input.addEventListener("keypress", function(event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("btn_password_chk").click();
        }
        });

        const btn_password_chk = document.querySelector("#btn_password_chk")
        btn_password_chk.addEventListener("click", () => {
            const password = document.querySelector("#password")
            if (password.value == '') {
                alert('Please Enter Password.')
                password.focus()
                return false
            }
            
            const xhr = new XMLHttpRequest() 
            xhr.open("POST", "./process.php", "true")
            const f1 = new FormData(document.modal_form) 
            f1.append("idx", <?= $idx; ?>) 
            xhr.send(f1)
            xhr.onload = () => {
                if(xhr.status == 200) {
                    const data = JSON.parse(xhr.responseText)
                    if (data.result == 'edit_success') {
                        self.location.href = './update.php?idx=' + <?= $idx; ?>
                    } else if (data.result == 'delete_success') {
                        alert('Post deleted.')
                        self.location.href = './index.php'
                    } else if (data.result == 'wrong_password') {
                        alert('wrong password.')
                        password.value = ''
                        password.focus()
                    }
                } else {
                    alert('Error! Try again!')
                }
            }
        })
    </script>


</body>
</html>