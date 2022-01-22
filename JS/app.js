//firebase config.
var config = {
    apiKey: "AIzaSyAnbxo0tZjRo8wdFCWaKpohxYv0eP81EG8",
    authDomain: "train-schedule-d0570.firebaseapp.com",
    databaseURL: "https://train-schedule-d0570.firebaseio.com",
    projectId: "train-schedule-d0570",
    storageBucket: "",
    messagingSenderId: "806892094385"
  };
firebase.initializeApp(config);

//store firebase ref in database variable
var database = firebase.database();
var trainname = "";
var destination = "";
var firsttime = "";
var frequency = "";

//function to update firebase with input values
$("#submit").on("click", function(event){
    event.preventDefault();

    trainname = $("#name-input").val().trim();
    destination = $("#destination-input").val().trim();
    firsttime = $("#firsttime-input").val().trim();
    frequency = $("#frequency-input").val().trim();

    database.ref().push({
    trainname: trainname,
    destination: destination,
    firsttime: firsttime,
    frequency: frequency,
    dateadded: firebase.database.ServerValue.TIMESTAMP
    });

    database.ref().orderByChild(database.dateadded).limitToLast(1);
    
});

//Function to calculate train arrival times
function calculateRender(snapshot){
    //get train data from value path in firebase snapshot: 
    var trainInfo = snapshot.val();
    console.log("Variable trainInfo: ", trainInfo);
    //get current time
    var currentTime = moment();
    //get frequency of train arrival
    var frequencyInt = parseInt(trainInfo.frequency);
    //set back first train time by 1 year to make sure it is in the past
    var firstTimeConverted = moment(trainInfo.firsttime, "HH:mm").subtract(1, "years"); 
    //difference between current time and first train time
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    //remainder of the difference divided by train's frequency
    var timeRemainder = diffTime % frequencyInt;
    //remaining minutes until train arrives 
    var minutesTill = frequencyInt - timeRemainder;
    //next arrival time
    var nextArrival = ((moment().add(minutesTill, "minutes")).format("hh:mm"));

    //append new row and cells to table containing train info
    var row = $("<tr>");
    var newrow = $("#tablebody").append(row);
    row.append(("<td>" + trainInfo.trainname+ "</td>"));
    row.append(("<td>" + trainInfo.destination+ "</td>"));
    row.append(("<td>" + trainInfo.frequency+ "</td>"));
    row.append(("<td>" + nextArrival+ "</td>"));
    row.append(("<td>" + minutesTill+ "</td>"));
};
 
//Function to run calculateRender function on page load and whenever new train is entered
database.ref().on("child_added", function(snapshot){
   calculateRender(snapshot);   
  }, function(errorObject){
    console.log("The read failed: " + errorObject.code);});

//Global variables used in multiple funtions
var trainInfo = null;
var nextArrival = null;
var minutesTill = null;

//Function to update the train arrival info set to run every 60 seconds
function updateRender() {
    $("#tablebody tr").remove();
    database.ref().once("value").then(function(snapshot){
        console.log("snapshot in updateRender: " , snapshot.val());  
        snapshot.forEach(function (childSnapshot) {
            
            //For each train calculate the arrival time again
            trainInfo = childSnapshot.val();
            console.log(trainInfo);

            var currentTime = moment();
            console.log("Variable currentTime: " + currentTime);

            var frequencyInt = parseInt(trainInfo.frequency);
            console.log("Variable frequencyInt: " + frequencyInt);

            var firstTimeConverted = moment(trainInfo.firsttime, "HH:mm").subtract(1, "years"); 
            console.log("Variable firstTimeConverted: " + firstTimeConverted);
            console.log("Variable firsttime: " + firsttime);
            console.log("trainInfo.firsttime: "+ trainInfo.firsttime);

            var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
            console.log("Difference In Time: "+ diffTime);

            var timeRemainder = diffTime % frequencyInt;
            console.log("timeApart: "+ timeRemainder);
            
            minutesTill = frequencyInt - timeRemainder;
            console.log("minutesTill: " + minutesTill);

            nextArrival = ((moment().add(minutesTill, "minutes")).format("hh:mm"));
            console.log("nextArrival : "+ nextArrival);

            //Then append new rows with updated train info. 
            var row = $("<tr>");
            var newrow = $("#tablebody").append(row);
            
            row.append(("<td>" + trainInfo.trainname+ "</td>"));
            row.append(("<td>" + trainInfo.destination+ "</td>"));
            row.append(("<td>" + trainInfo.frequency+ "min"+ "</td>"));
            row.append(("<td>" + nextArrival+ "</td>"));
            row.append(("<td>" + minutesTill+ "</td>"));
       });
    });
};
//set updateRender function to run every 1 minute
var minuteFunction = setInterval(updateRender, 60000);