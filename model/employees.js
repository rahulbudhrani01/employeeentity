var mongoose = require("mongoose");
//var autoIncrement = require("mongodb-autoincrement");
var autoIncrement = require("mongoose-auto-increment");
mongoose.connect('mongodb://localhost:27017/EmployeeLayout');
var connection = mongoose.createConnection("mongodb://localhost:27017/myDatabase");

autoIncrement.initialize(connection);

// create schema
var employeeSchema  = new mongoose.Schema({
    //"employee_id": Number,
    "name" :{type: String,trim: true,required: true},
    "dateOfBirth": { type: Date, min:"1919-01-01",max:"2005-01-01",required: true,  },
    "salary": {type:Number, required: true, max: 1000000000000},
    "skills": {skill1:Boolean,skill2:Boolean,skill3:Boolean,skill4:Boolean,skill5:Boolean,skill6:Boolean,skill7:Boolean,skill8:Boolean,skill9:Boolean,skill10:Boolean},
    "photo": { data: Buffer, contentType: String}
});

employeeSchema.plugin(autoIncrement.plugin, 'employee');

// create model if not exists.

module.exports = mongoose.model('employee',employeeSchema);
