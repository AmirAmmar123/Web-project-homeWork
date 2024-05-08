const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { MongoClient, ObjectId, Db } = require('mongodb');
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var path = require("path");
const fs = require('fs');
const PORT = 3000;  
const app = express();
app.use(express.static('client'))
app.use(cors());
app.use(bodyParser.json()); // Add this line to parse JSON bodies


let dbName  = "Registration"
let collectionName  = "login"
const connectionDb = `mongodb+srv://amirammarwork:ocvP3JZ2qIRFrpIk@cluster0.p3v3q2f.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
const clientDb = new MongoClient(connectionDb);

// Set up express-session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));


async function ConnectDb()
{
    try{
      await clientDb.connect();
      console.log("Connected Db...");
    }catch{
        await clientDb.close();
        console.log("Db connection Closed....");
    }
}



app.get('/register',(req, response) => {
    response.sendFile(path.join(__dirname,"client","RegisterUser.html")) 
});

app.get('/login',(req, response) => {
    response.sendFile(path.join(__dirname,"client","LoginUser.html")) 
});






app.post("/subreg",urlencodedParser,async (request,res) =>{
    // console.log("post Requested");
    // console.log(request.body); 
    // console.log(request.params); 
    const collection = clientDb.db(dbName).collection(collectionName);
    const items = await collection.find({}).toArray();
            let isValid = await Validate(request.body.Repeatpassword , request.body.password, request.body.email)
            if(isValid.valid){
                try {
                    const newuser = request.body;
                    newuser['todo'] = [];
                    await collection.insertOne(newuser);
                    // res.status(201).send('Successfully Registered')
                    res.redirect('/login')
                } catch (error) {
                    res.status(500).send(error.toString());
                }
            }else{
                                      // Read the contents of todos.html file
                      fs.readFile(path.join(__dirname, 'client', 'RegisterUser.html'), 'utf8', (err, data) => {
                        if (err) {
                            return res.status(500).send('Error reading todos.html file');
                        }
                        let htmlContent =""

                        if(isValid.err == 'email'){
                            // Inject session data into the HTML content
                            htmlContent = data.replace('<label for="email" class="form-label">Email <span class="text-danger">*</span></label>',
                            `<label style="color: red" for="email" class="form-label">This email already exists! <span class="text-danger">*</span></label>`)
                            .replace(`action="./subreg" `,
                        `action=""`);
                   
                        }else{
                                 // Inject session data into the HTML content
                           htmlContent = data.replace('<label for="password" class="form-label">Password <span class="text-danger">*</span></label>',
                                 `<label style="color: red;" for="password" class="form-label">Password must be longer than 8 characters or passwords do not match. <span class="text-danger">*</span></label>`)
                                 .replace(`action="./subreg" `,
                             `action=""`);
                        }
                
                  
                        // Send the modified HTML content with session data
                        res.send(htmlContent);
                    });
            
            }


})





app.get('/:id(err|[0-9]+)',async (request, response) => {
    if(request.params.id == "err"){
        fs.readFile(path.join(__dirname, 'client', 'LoginUser.html'), 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Error reading todos.html file');
            }
            let htmlContent =data.replace('<label for="email" class="form-label">Email <span class="text-danger">*</span></label>',
            '<label style="color: red;" for="email" class="form-label">one or more details you entered is incorrect<span class="text-danger">*</span></label>')
            .replace(`action="./submit/2" `,
            `action=""`)
            // Send the modified HTML content with session data
            response.send(htmlContent);
        });
    }else{
        const collection = clientDb.db(dbName).collection(collectionName);
        const items = await collection.find({}).toArray();
        
          // Read the contents of todos.html file
        fs.readFile(path.join(__dirname, 'client', 'todos.html'), 'utf8', (err, data) => {
                if (err) {
                    return res.status(500).send('Error reading todos.html file');
                }
        
                // Inject session data into the HTML content
                let htmlContent = data.replace('<!--EMAIL_DATA-->', `${items[request.params.id].email}`)
                .replace('<!--USER_DATA-->', `${items[request.params.id].username}`)
                .replace('<!--Content to hide-->',request.params.id);
        
                // Send the modified HTML content with session data
                response.send(htmlContent);
        });
    }

});





// 
app.post("/verify2",urlencodedParser,async (request,response) =>{
    const collection = clientDb.db(dbName).collection(collectionName);
    const items = await collection.find({}).toArray();
    valid = validate2(request.body.email,request.body.password,items);
    if(valid.email && valid.passMatch){
        response.status(200).send(valid.index.toString());
    }else{
        response.status(200).send("-1");
    }


})


async function Validate(psswd,repeated, email){
    if (psswd !== repeated || psswd.length < 8) return {valid:false, err:"psswd"};
    const collection = clientDb.db(dbName).collection(collectionName);
    const user = await collection.findOne({ email: email });
    return  {valid:user==null, err:"email"};
}


function validate2(email, password, data){
    let emailFound = false;
    let index = 0;

    for (; index < data.length; index++) {
        if (email === data[index].email) {
            emailFound = true;
            break;
        }
    }

    if (emailFound) {
        const passMatch = (password === data[index].password);
        return { email: true, passMatch: passMatch, index: index };
    } else {
        return { email: false, passMatch: false, index: index };
    }

}


// Route to handle AJAX request for fetching todo list data
app.post('/getTodos',urlencodedParser,async (req, res) => {
    const collection = clientDb.db(dbName).collection(collectionName);
    const items = await collection.find({}).toArray();
    res.json(items[req.body.hidden].todo);
});
  


// Route to handle saving the todo array
app.post('/saveTodo',urlencodedParser, async (req, res) => {
    // Access the todo array from the request body
    // Assuming you have a MongoDB collection set up to store todo data
    const collection = clientDb.db(dbName).collection(collectionName);
     const items = await collection.find({}).toArray();
    collection.updateOne(
        { "_id": items[req.body.hidden]._id }, // Specify the document's _id
        { $set: { "todo":  req.body.todo } } // Update the the new list in db
    );
    res.status(200).send('Data Saved Successfully'); // Corrected success message
});

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
    ConnectDb();

})


