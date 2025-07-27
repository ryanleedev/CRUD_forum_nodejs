<?php
    // Name: Jeonghyeon Lee
    // Date: Apr 3rd
    // File: postDAO.php
    // Lab Objective: This is for data access object for posting
?>

<?php
require_once('abstractDAO.php');
require_once('./model/post.php');

class postDAO extends abstractDAO {
        
    function __construct() {
        try{
            parent::__construct();
        } catch(mysqli_sql_exception $e){
            throw $e;
        }
    }  
    
    public function getPost($idx){
        $query = 'SELECT * FROM mboard WHERE idx = ?';
        $stmt = $this->mysqli->prepare($query);
        $stmt->bind_param('i', $idx);
        $stmt->execute();
        $result = $stmt->get_result();
        if($result->num_rows == 1){
            $temp = $result->fetch_assoc();
            $post = new post($temp['idx'],$temp['subject'],$temp['name'], $temp['password'], $temp['content'], 
                        $temp['hit'], $temp['imglist'], $temp['rdate'], $temp['ip']);
            $result->free();
            return $post;
        }
        $result->free();
        return false;
    }

    public function getCnt(){
        //The query method returns a mysqli_result object
        $result = $this->mysqli->query('SELECT COUNT(*) cnt FROM mboard');
        if($result->num_rows == 1) {
            $row = $result->fetch_assoc();
            $total = $row['cnt'];
            // $result->free();
            return $total;
        }else {
            $error = $this->mysqli->errno . ' ' . $this->mysqli->error;
            echo $error; 
            return $error;
        }
    }

    // // ******OG
    // public function getPosts(){
    //     //The query method returns a mysqli_result object
    //     $result = $this->mysqli->query('SELECT * FROM mboard');
    //     $posts = Array();
        
    //     if($result->num_rows >= 1){
    //         while($row = $result->fetch_assoc()){
    //             //Create a new employee object, and add it to the array.
    //         $post = new post($row['idx'],$row['subject'],$row['name'], $row['password'], $row['content'], 
    //                     $row['hit'], $row['imglist'], $row['rdate'], $row['ip']);
    //             $posts[] = $post;
    //         }
    //         $result->free();
    //         return $posts;
    //     }
    //     $result->free();
    //     return false;
    // }

    public function getPosts($start, $limit){
        //The query method returns a mysqli_result object
        $query = 'SELECT * FROM mboard ORDER BY idx DESC LIMIT ?,?';
        $stmt = $this->mysqli->prepare($query);
        // $result = $this->mysqli->query('SELECT * FROM mboard LIMIT ?,?');
        $stmt->bind_param('ii', $start, $limit);
        $stmt->execute();
        $result = $stmt->get_result();

        $posts = Array();
        
        if($result->num_rows >= 1){
            while($row = $result->fetch_assoc()){
                //Create a new employee object, and add it to the array.
            $post = new post($row['idx'],$row['subject'],$row['name'], $row['password'], $row['content'], 
                        $row['hit'], $row['imglist'], $row['rdate'], $row['ip']);
                $posts[] = $post;
            }
            $result->free();
            return $posts;
        }
        $result->free();
        return false;
    }
    
    
    public function addPost($post){
        
        if(!$this->mysqli->connect_errno){
			$query = 'INSERT INTO mboard (subject, name, password, content, hit, imglist, rdate, ip) VALUES (?,?,?,?,?,?,NOW(),?)';
			$stmt = $this->mysqli->prepare($query);
            if($stmt){
                    $subject = $post->getSubject();
                    $name = $post->getName();
                    $password = $post->getPassword();
                    $content = $post->getContent();
                    $hit = $post->getHit();
                    $imglist = $post->getImglist();
			        $ip = $post->getIp();
                  
			        $stmt->bind_param('ssssiss',
                    $subject,
                    $name,
                    $password,
                    $content,
                    $hit,
                    $imglist,
                    $ip
			        );    
                    //Execute the statement
                    $stmt->execute();         
                    
                    if($stmt->error){
                        return $stmt->error;
                    } else {
                        return $post->getSubject() . ' added successfully!';
                    } 
			}
             else {
                $error = $this->mysqli->errno . ' ' . $this->mysqli->error;
                echo $error; 
                return $error;
            }
       
        }else {
            return 'Could not connect to Database.';
        }
    }   


    public function updateHit($idx){
        
        if(!$this->mysqli->connect_errno){
            $query = "UPDATE mboard SET hit=hit+1 WHERE idx=?";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param('i', $idx);    
            //Execute the statement
            $stmt->execute();         
                    
            if($stmt->error){
                return $stmt->error;
            }
        }
    }   





    public function updatePost($post){
        
        if(!$this->mysqli->connect_errno){
            $query = "UPDATE mboard SET subject=?, content=?, rdate=now() WHERE idx=?";
            $stmt = $this->mysqli->prepare($query);
            if($stmt){
                $subject = $post->getSubject();
                $content = $post->getContent();
                $idx = $post->getIdx();

			        $stmt->bind_param('ssi', 
                        $subject,
				        $content,
                        $idx
			        );    
                    //Execute the statement
                    $stmt->execute();         
                    
                    if($stmt->error){
                        return $stmt->error;
                    } else {
                        return 'updated successfully!';
                    } 
			}
             else {
                $error = $this->mysqli->errno . ' ' . $this->mysqli->error;
                echo $error; 
                return $error;
            }
       
        }else {
            return 'Could not connect to Database.';
        }
    }   

    public function deletePost($idx){
        if(!$this->mysqli->connect_errno){
            $query = 'DELETE FROM mboard WHERE idx = ?';
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param('i', $idx);
            $stmt->execute();
            if($stmt->error){
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}
?>