/*
    Name: Jeonghyeon Lee
    Date: Apr 3rd
    File: main.js
    Lab Objective: java script file for events
*/

// index.php page
if(document.querySelector("#btn_write")){
    const btn_write = document.querySelector("#btn_write") 
    btn_write.addEventListener("click", () => {
        self.location.href='./create.php';
    })
}

if(document.querySelectorAll(".view_detail")){
    const view_detail = document.querySelectorAll(".view_detail")
    view_detail.forEach( (row) => {
        row.addEventListener("click", () => {
            self.location.href='./read.php?idx=' + row.dataset.idx; // row.dataset.idx => get data-idx from tag
        })
    })
}



// read.php page
if(document.querySelector("#btn_index")){
const btn_index = document.querySelector("#btn_index") 
btn_index.addEventListener("click", () => {
    self.location.href='./index.php'
    })
}

if(document.querySelector("#btn_edit")) {
    const btn_edit = document.querySelector("#btn_edit")
    btn_edit.addEventListener("click", () => {
        const modal_title = document.querySelector("#modal_title");
        modal_title.textContent = "Edit";
        document.modal_form.mode.value = "edit";
    })
}

if(document.querySelector("#btn_delete")) {
    const btn_delete = document.querySelector("#btn_delete")
    btn_delete.addEventListener("click", () => {
        const modal_title = document.querySelector("#modal_title");
        modal_title.textContent = "Delete";
        document.modal_form.mode.value = "delete";
    })
}



