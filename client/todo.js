// grab all elements 
const form = document.querySelector("[data-form]");//By Attribute
const lists = document.querySelector("[data-lists]");
const input = document.querySelector("[data-input]");

// Get references to the buttons by their IDs
const saveBtn = document.getElementById('savebtn');
const logoutBtn = document.getElementById('logoutbtn');

// Get the hidden div element
const hiddenDiv = document.getElementById("hiddenDiv");

const searchParams = new URLSearchParams(window.location.search);
console.log(window.location.search);
//--keep array Global fo UI variable fo UI Display
let todoArr = [];

// Get the text content of the hidden div
const HIDDENVAL = hiddenDiv.textContent.trim();


//once the browser is loaded
window.addEventListener("DOMContentLoaded", async () => {

    //-When Page Loaded Get All Items from Local Storage 
     todoArr = await Storage.getStorage() ;
    //--Display Data According Loaded Array
    UI.displayData();
    //register remove from the dom
    UI.registerRemoveTodo();
});


// Add event listeners to the buttons
saveBtn.addEventListener('click', async function() {
        // Make a fetch request to the server to save the todo array
        const newArray = todoArr.map(element => {
            return {todo:element.todo, id:element.id}
        });
        
       return await fetch('/saveTodo', {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({todo:newArray,hidden:HIDDENVAL}), // body data type must match "Content-Type" header
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle the response from the server
            console.log('Todo array saved successfully');
        })
        .catch(error => {
            console.error('Error saving todo array:', error);
            // Handle errors that occur during the save operation
        });
});

logoutBtn.addEventListener('click', function() {
      window.location.href = '/login'
      sessionStorage.clear();
   
});

///--ToDo Class: Each Visual Element Should be 
//--related to ToDO Object
class Todo {
    constructor(id, todo){
        this.id = id;
        this.todo = todo;
    }
}




//--Class To handle Storage Operations
//-- Of todo array
class Storage
{

    //Get From Storage By Key
    static async getStorage(){

           let storage = []
           await fetch('/getTodos',{
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({hidden:HIDDENVAL}), // body data type must match "Content-Type" header
        })
            .then(response => response.json())
            .then(data => {
            // Handle the todo list data here
            console.log(data)
            storage = data;
            })
            .catch(error => console.error('Error fetching todo list:', error));

            
        return storage
    }

}


//Submit
form.addEventListener("submit", (e) => {
     //Disble continue sumit processing...
    e.preventDefault();
    //Create New Object By User Input
    let id = Math.random() * 1000000;
    const todo = new Todo(id, input.value);
   // todoArr.push(todo);
    todoArr = [...todoArr,todo];
  
    UI.displayData();
    UI.clearInput();
    //add to storage


});

//Handle UI Operation 
class UI{

    //--Go Over All Array Elements 
    //--And Generate HTML Items Dynamically
    static displayData(){
        
        //-Generate Html
        //-each Delete Icon Injected with 
        //--data-id = {id of the object}
        let displayData = todoArr.map((item) => {
            return `
                <div class="todo">
                <p>${item.todo}</p>
                <span class="remove" data-id = ${item.id}>🗑️</span>
                </div>
            `
        });
        //--Put generated html in a container
        lists.innerHTML = (displayData).join(" ");
    }
   
    //--Clear Input Element
    static clearInput(){
       
        input.value = "";
    }

    //--Remove Element When Clicked
    static registerRemoveTodo(){
        //--Register Click  For Deleting a toto row
        //--The Click is on the List Div Container

        lists.addEventListener("click", (e) => {
            console.log(e.target.outerHTML);//Inner Clicked 
            console.log(e.currentTarget.outerHTML);//Registered Clicked

            if(e.target.classList.contains("remove")){
                //Get Id of clicked delete
                let btnId = e.target.dataset.id;
                //--Remove Element From HTML DOM
                
                //remove from array.
                UI.removeArrayTodo(btnId, e.target);

            }
        
        });
    }
   
   //Remove Element From UI And Update LocalStorage
    static removeArrayTodo(id,elementClicked){
        
        elementClicked.parentElement.remove();
        todoArr = todoArr.filter((item) => item.id !== +id);
    
    }
}




