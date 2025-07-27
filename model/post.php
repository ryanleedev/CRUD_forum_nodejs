<?php
    // Name: Jeonghyeon Lee
    // Date: Apr 3rd
    // File: post.php
    // Lab Objective: This is for post model
?>

<?php
class post
{

	private $idx;
	private $subject;
	private $name;
	private $password;
	private $content;
	private $hit;
	private $imglist;
	private $rdate;
	private $ip;

	function __construct($idx, $subject, $name, $password, $content, $hit, $imglist, $rdate, $ip)
	{
		$this->setIdx($idx);
		$this->setSubject($subject);
		$this->setName($name);
		$this->setPassword($password);
		$this->setContent($content);
		$this->setHit($hit);
		$this->setImglist($imglist);
		$this->setRdate($rdate);
		$this->setIp($ip);
	}
	

	public function getIdx() {
		return $this->idx;
	}
	
	public function setIdx($idx) {
		$this->idx = $idx;
		return $this;
	}


	public function getSubject() {
		return $this->subject;
	}
	
	public function setSubject($subject) {
		$this->subject = $subject;
	}


	public function getName() {
		return $this->name;
	}

	public function setName($name)  {
		$this->name = $name;
	}


	public function getPassword() {
		return $this->password;
	}
	
	public function setPassword($password) {
		$this->password = $password;
	}

	
	public function getContent() {
		return $this->content;
	}

	public function setContent($content) {
		$this->content = $content;
	}


	public function getHit() {
		return $this->hit;
	}

	public function setHit($hit) {
		$this->hit = $hit;
	}


	public function getImglist() {
		return $this->imglist;
	}

	public function setImglist($imglist) {
		$this->imglist = $imglist;
	}


	public function getIp() {
		return $this->ip;
	}

	public function setIp($ip)  {
		$this->ip = $ip;
	}


	public function getRdate() {
		return $this->rdate;
	}
	
	public function setRdate($rdate) {
		$this->rdate = $rdate;
		return $this;
	}
}
?>