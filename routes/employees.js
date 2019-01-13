var fs = require('fs');
var multer = require('multer');
var util = require("util");
var storage = multer.memoryStorage()
var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

    router.use(bodyParser.urlencoded({ extended: true }))
    router.use(multer({storage: storage,fileSize: 1024}).single('photo'));

    router.use(methodOverride(function(req, res){
          if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method
            delete req.body._method
            return method
          }
    }))



//this will be accessible from http://127.0.0.1:3000/employees
router.route('/')

    //POST a new employee
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        console.log(req.file.buffer)
        if (req.file) {

            if (req.file.size === 0) {
		            console.log("File size cannot be emoty?");
		        }

	        }
        var name = req.body.name;
        var dateOfBirth = req.body.dateOfBirth;

        var skill1 = req.body.skill1=="on"?1:0;
        var skill2 = req.body.skill2=="on"?1:0;
        var skill3 = req.body.skill3=="on"?1:0;
        var skill4 = req.body.skill4=="on"?1:0;
        var skill5 = req.body.skill5=="on"?1:0;
        var skill6 = req.body.skill6=="on"?1:0;
        var skill7 = req.body.skill7=="on"?1:0;
        var skill8 = req.body.skill8=="on"?1:0;
        var skill9 = req.body.skill9=="on"?1:0;
        var skill10 = req.body.skill10=="on"?1:0;

        var salary = req.body.salary;
        var photo = req.file.buffer;
        if (!(skill1||skill2||skill3||skill4||skill5||skill6||skill7||skill8||skill9||skill10))
        {
          res.status(400);
          res.send("You need to select at least 1 skill.");
          return;
        }
        if(photo == "")
        {
          res.status(400);
          res.send("Photo cannot be blank");
          return;
        }
        if(!((req.file.mimetype == "image/jpeg")|| (req.file.mimetype == "image/jpg") || (req.file.mimetype == "image/png")))
        {
          res.status(400);
          res.send("Unsupported format!");
          return;

        }
        //call the create function for our database
        mongoose.model('employee').create({
          //"employee_id" : counter('employees'),

          "name" : name,
          "dateOfBirth": dateOfBirth,
          "salary": salary,

          "skills": {skill1,skill2,skill3,skill4,skill5,skill6,skill7,skill8,skill9,skill10},



          "photo": {'data':req.file.buffer,'contentType' : req.file.mimetype}

        }, function (err, employee) {
              if (err) {
                console.log(err)
                  res.send("There was a problem adding the information to the database."+ err);
              }
               else {
                  //employee has been created
                  console.log('POST creating new employee: ' + employee);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("employees");
                        // And forward to success page
                        res.redirect("/employees/view/1");
                    },
                    //JSON response will show the newly created employee
                    json: function(){
                        res.json(employee);
                    }
                });
              }
        })
    });
    /* GET New Employee page. */
router.get('/add/new', function(req, res) {
    res.render('employees/new', { title: 'Add New Employee' });
});
router.get('/view/:page',function(req, res, next) {
  var perPage = 2

  var page = req.params.page || 1

    //retrieve all employees from Monogo
    mongoose.model('employee').find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, employees) {
      if (err) {
          return console.error(err);
      } else {
        mongoose.model('employee').count().exec(function(err, count) {
          if (err) {
              return console.error(err);
          } else {
              //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header

              res.format({
                  //HTML response will render the index.jade file in the views/employees folder. We are also setting "employees" to be an accessible variable in our jade view
                html: function(){
                    res.render('employees/index', {
                          title: 'Employees',
                          "employees" : employees,
                          current: page,
                          pages: Math.ceil(count / perPage)

                      });
                },
                //JSON response will show all employees in JSON format
                json: function(){
                    res.json(employees);
                }
            });
          }

        })
      }
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('employee').findById(req.params.id, function (err, employee) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        if(employee ==null){
          res.status(404)
          res.send("No object with this id.");
          return;
        }
        console.log('GET Retrieving ID: ' + employee._id);
        var employeedob = employee.dateOfBirth.toISOString();
        employeedob = employeedob.substring(0, employeedob.indexOf('T'));
        var photo = ""
        if(employee.photo.data){
          photo = new Buffer(employee.photo.data.buffer).toString('base64');
        }

        res.format({
          html: function(){
              res.render('employees/show', {
                "employeedob" : employeedob,
                "employee" : employee,
                "photo" : photo
              });
          },
          json: function(){
              res.json(employee);
          }
        });
      }
    });
  });


  //GET the individual employee by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the employee within Mongo
    mongoose.model('employee').findById(req.params.id, function (err, employee) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the employee
            if(employee ==null){
              res.status(404)
              res.send("No object with this id.");
              return;

            }
            console.log('GET Retrieving ID: ' + employee._id);
            //format the date properly for the value to show correctly in our edit form

          var employeedob = employee.dateOfBirth.toISOString();
          var photo = ""
          if(employee.photo.data){
            photo = new Buffer(employee.photo.data.buffer).toString('base64');
          }
          employeedob = employeedob.substring(0, employeedob.indexOf('T'))
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('employees/edit', {
                          title: 'Employee' + employee._id,
                        "employeedob" : employeedob,
                          "employee" : employee,
                          "photo": photo
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(employee);
                 }
            });
        }
    });
});



//PUT to update a employee by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var dateOfBirth = req.body.dateOfBirth;

    var skill1 = req.body.skill1=="on"?1:0;
    var skill2 = req.body.skill2=="on"?1:0;
    var skill3 = req.body.skill3=="on"?1:0;
    var skill4 = req.body.skill4=="on"?1:0;
    var skill5 = req.body.skill5=="on"?1:0;
    var skill6 = req.body.skill6=="on"?1:0;
    var skill7 = req.body.skill7=="on"?1:0;
    var skill8 = req.body.skill8=="on"?1:0;
    var skill9 = req.body.skill9=="on"?1:0;
    var skill10 = req.body.skill10=="on"?1:0;
    var salary = req.body.salary;
    var photo = req.body.photo

    if (!(skill1||skill2||skill3||skill4||skill5||skill6||skill7||skill8||skill9||skill10))
    {
      res.status(400)
      res.send("You need to select at least 1 skill.");
      return;
    }

   //find the document by ID
        mongoose.model('employee').findById(req.params.id, function (err, employee) {
            //update it
            employee.update({
                name : name,
                skills : {skill1,skill2,skill3,skill4,skill5,skill6,skill7,skill8,skill9,skill10},
                dateOfBirth : dateOfBirth,
                salary : salary,
                //photo : photo
            }, function (err, employeeID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              }
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/employees/" + employee._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(employee);
                         }
                      });
               }
            })
        });
});



//DELETE a Employee by ID
router.delete('/:id/edit', function (req, res){
    //find employee by ID

    mongoose.model('employee').findById(req.params.id, function (err, employee) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo

            employee.remove(function (err, employee) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + employee._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/employees/view/1");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : employee
                               });
                         }
                      });
                }
            });
        }
    });
});



module.exports = router;
