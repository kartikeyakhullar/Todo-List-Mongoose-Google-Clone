const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const  _ = require("lodash");


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

// Connecting to mongoose 

mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true});

// Designing the schema 

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = new mongoose.model("List", listSchema);

// Creating items

const C1 = new Item({
  name: "Adding databases to the todolist."
})

const C2 = new Item({
  name: "Building RESTful API."
});

const C3 = new Item({
  name: "Authentication and secuirity."
});

const C4 = new Item({
  name: "React finally!!"
});


// Inserting items

// Item.insertMany([C1,C2,C3,C4],function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Successfully inserted the items to the todolist.");
//   }
// });

// Finding the inserted items 




// Routing 

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err,foundList){
      if(err){
        console.log(err);
      }else{
        foundList.items.push(item);
        foundList.save();
      }
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.deleteOne({_id: checkedItem}, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item successfully deleted.");
      }
    })
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(err){
        console.log(err);
      }else{
        res.redirect("/"+listName);
      }
    })
  }




})

app.get("/", function(req, res){
  Item.find({},function(err,items){
    if(err){
      console.log(err);
    }else{
      if(items.length === 0){
        Item.insertMany([C1,C2,C3,C4],function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Successfully inserted the items to the todolist.");
          }
        });
        res.redirect("/");
      }
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);


  List.findOne({name: customListName}, function(err,foundList){
    if(err){
      console.log(err);
    }else{
      if(foundList){
        res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
      }else{
        const list = new List({
          name: customListName,
          items: [C1,C2,C3,C4]
        });
        list.save();
        res.redirect("/" + customListName);
      }
    }
  });
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
