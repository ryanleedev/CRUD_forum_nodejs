<?php
    // Name: Jeonghyeon Lee
    // Date: Apr 3rd
    // File: process.php
    // Lab Objective: This is process php for validating password
?>

<?php

// Include employeeDAO file
require_once('./dao/postDAO.php');

$mode = (isset($_POST['mode']) && $_POST['mode' ] != '') ? $_POST['mode'] : '';
$idx = (isset($_POST['idx' ]) && $_POST['idx' ] != '' && is_numeric($_POST['idx'])) ? $_POST['idx'] : '';
$password = (isset($_POST['password']) && $_POST['password'] != '') ? $_POST['password'] : '';

$postDAO = new postDAO();
$post = $postDAO->getPost($idx);

if (password_verify($password, $post->getPassword())) {
    if ($mode == 'delete') {
        $postDAO->deletePost($idx);

        $arr = ['result' => 'delete_success'];

    } else if ($mode == 'edit') {
        $arr = ['result' => 'edit_success'];
        
    } else {
        $arr = ['result' => 'wrong_mode'];
    }
    die(json_encode($arr));

} else {
    $arr = ['result' => 'wrong_password'];
    die(json_encode($arr)); // { "result": "wrong_password" }
}
?>