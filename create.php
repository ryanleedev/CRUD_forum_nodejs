<!--
    Author: Jeonghyeon Lee
    Date: Apr 3rd
    File: create.php
    Lab Objective: This is for create page
-->

<?php

// Include employeeDAO file
require_once('./dao/postDAO.php');

// Define variables and initialize with empty values
$author = $pwd = $subject = $text = $imglist = $ip = $idx = $hit = $rdate = "";
$author_err = $pwd_err = $subject_err = $text_err = "";

// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){

    // Validate name
    $input_author = trim($_POST["author"]);
    if(empty($input_author)){
        $author_err = "Please enter an author.";
    } elseif(!filter_var($input_author, FILTER_VALIDATE_REGEXP, array("options"=>array("regexp"=>"/^[a-zA-Z0-9_.-]*$/")))){
        $author_err = "Please enter a valid author name.";
    } elseif(strlen($input_author) > 13){
        $author_err = "Author name should be less than 13 characters";
    } else{
        $author = $input_author;
    }
    
    // Validate password
    $input_pwd = trim($_POST["pwd"]);
    if(empty($input_pwd)){
        $pwd_err = "Please enter a password.";     
    } elseif(!filter_var($input_pwd, FILTER_VALIDATE_REGEXP, array("options"=>array("regexp"=>"/^.*[0-9a-zA-Z]+.*/"))) | strlen($input_pwd) < 4){
        $pwd_err = "Password should contain character/number, and longer than 4 characters";
    } else{
        //password encoding(security)
        $pwd_hash = password_hash($input_pwd, PASSWORD_BCRYPT);
        $pwd = $pwd_hash;
    }
    
    // Validate subject
    $input_subject = trim($_POST["subject"]);
    if(empty($input_subject)){
        $subject_err = "Please enter the subject.";     
    } else{
        $subject = $input_subject;
    }

    // Validate text
    $input_text = trim($_POST["formdata"]);
    if(empty($input_text)){
    // if($input_text == ''){
        $text_err = "Please enter text.";     
    } else{
        $text = $input_text;
    }


    //RegExp for extracting src from img
    preg_match_all("/<img[^>]*src=[\"']?([^>\"']+)[\"']?[^>]*>/i", $text, $matches);

    $img_array = [];
    foreach($matches[1] AS $key => $val) {
        // data:image/png;base64,AAAFBfj42Pj4kskskjivl image/jpeg
        list($type, $data) = explode(';', $val);
        // $type : data:image/png
        // $data : base64,AAAFBfj42Pj4kskskjivl
        list(, $ext) = explode('/', $type);
        $ext = ($ext == 'jpeg') ? 'jpg' : $ext;
        date_default_timezone_set('America/Toronto');
        $filename = date('YmdHis') .'_'. $key .'.'. $ext; // 20230401(180511)(hour,min,sec)_0.png
        
        list(,$base64_decode_data) = explode(',', $data);
        
        $rs_code = base64_decode($base64_decode_data);
        file_put_contents("upload/". $filename, $rs_code);

        $img_array[] = "upload/". $filename;
        // decode base64 encoded image inside of content
        $text = str_replace($val, "upload/". $filename, $text);
    }
    $imglist = implode('|', $img_array);

    // user IP
    $ip = $_SERVER['REMOTE_ADDR'];

    echo "<script>console.log('$ip');</script>";
    
    // Check input errors before inserting in database
    if(empty($author_err) && empty($pwd_err) && empty($subject_err) && empty($text_err)){
        $postDAO = new postDAO();    
        $post = new post($idx, $subject, $author, $pwd, $text, $hit, $imglist, $rdate, $ip);
        $addResult = $postDAO->addPost($post);
        header( "refresh:2; url=index.php" );
		echo '<br><h6 style="text-align:center">' . $addResult . '</h6>';
        // Close connection
        $postDAO->getMysqli()->close();
        }
}


?>




<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post</title>

    <!-- bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-aFq/bzH65dt+w6FI2ooMVUpc+21e0SRygnTpmBvdBgSdnuTN7QbdgL+OapgHtvPp" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-qKXV1j0HvMUeCBQ+QVp7JcfGl760yU08IQ+GpUo5hlbpg51QRiuqHAJz8+BrxE/N"
        crossorigin="anonymous"></script>

    <!-- summernote -->
    <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
        integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n"
        crossorigin="anonymous"></script>
    <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js"></script>

    <!-- css -->
    <link href="./main.css" rel="stylesheet">
</head>

<body>
<!--the following form action, will send the submitted form data to the page itself 
($_SERVER["PHP_SELF"]), instead of jumping to a different page.-->
    <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
        <div class="container">

            <div class="mt-4 mb-3">
                <h2>Forum</h2>
            </div>

            <div class="mb-2 d-flex gap-2 form-group">
                <input
                    type="text"
                    name="author"
                    class="form-control w-25 <?php echo (!empty($author_err)) ? 'is-invalid' : ''; ?>"
                    value="<?php echo $author; ?>"
                    placeholder="Author">
                <input
                    type="password"
                    name="pwd"
                    class="form-control w-25 <?php echo (!empty($pwd_err)) ? 'is-invalid' : ''; ?>"
                    value="<?php echo $pwd; ?>"
                    placeholder="Password">
                <span class="invalid-feedback w-25"><?php echo $author_err;?></span>
                <span class="invalid-feedback w-25"><?php echo $pwd_err;?></span>
            </div>
            <div class="form-group">
                <input
                    type="text"
                    name="subject"
                    class="form-control mb-2 <?php echo (!empty($subject_err)) ? 'is-invalid' : ''; ?>"
                    value="<?php echo $subject; ?>"
                    placeholder="Subject">
                <span class="invalid-feedback"><?php echo $subject_err;?></span>
            </div>
            <div>
                <textarea id="summernote" name="formdata"></textarea>
                <span class="invalid_fb"><?php echo $text_err;?></span>
            </div>
            <div class="mt-2 mb-2 d-flex gap-2 justify-content-end">
                <input type="submit" class="btn btn-primary" value="Submit">
                <a href="index.php" class="btn btn-secondary ml-2">Cancel</a>
            </div>

        </div>
    </form>




    <!-- summernote -->
    <script>
        $('#summernote').summernote({
            placeholder: 'Please, write text here!',
            tabsize: 2,
            height: 300,
            code:"d;aklndas;v",
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ]
        });
        let text = '<?= $text?>';
        $("#summernote").summernote("code", text);
        // $(".summernote").summernote("code", "your text");
    </script>
</body>

</html>