var kit;
var b1;
var b2;

// Canvas variables
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Rooms

var rooms = {
    'Sitting':{'fenced':false, 'dims':[10,150,345,630],'alert':false},
    'Dining':{'fenced':false, 'dims':[345+10,420,455,345],'alert':false},
    'Kitchen': {'fenced':false,'dims':[360+10,150,305,270],'alert':false},
    'Room1':{'fenced':false, 'dims':[665+10,0,335,420],'alert':false},
    'Room2':{'fenced':false, 'dims':[1000+10,0,360,610],'alert':false},
    'Utility':{'fenced':false, 'dims':[360+10,0,305,150],'alert':false}
};

var last_pos = "Room1";
var email;

/*
* Email Alert
*/

$('.btn-submit').click(function(){
    email = $('input').val();
});

// Alter message
function send_alert(str){
    var http = new XMLHttpRequest();
    var url = '/data?&msg='+str+'&email='+email;
    http.open('GET', url, true);
    
    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            //alert(http.responseText);
            result=http.responseText;
        }
    }
    console.log("query returning");
    http.send()   ;  
}



// Position the beacons and obtain initial location 
redraw();

/* 
* Draw a shapes in a canvas
*/

// Point - for beacons
function point(x, y, radius, color ,canvas){
    canvas.beginPath();
    canvas.arc(x, y, radius, 0, 2 * Math.PI, true);
    canvas.fillStyle = color;
    canvas.fill();
  }

function draw_rect(x,y,w,h,col){
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.strokeStyle = col;
    ctx.lineWidth = 5;
    ctx.stroke();
}

function clear(x,y,w,h){
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(x, y, w, h);
}



// Place the beacons
function redraw(){
    point(10,182.45,10,"red",ctx);
    point(690,182.45,10,"red",ctx);
    point(345,770,10,"red",ctx);
    for(room in rooms){
        if(rooms[room]['fenced'] == true){
            var dims = rooms[room]['dims'];
            draw_rect(dims[0],dims[1],dims[2],dims[3],"#FF0000");
        }
    }
    var dims = rooms[last_pos]['dims']; 
    point(dims[0]+dims[2]/2,dims[1]+dims[3]/2,15,"black",ctx);
}

/*
* Fencing
* The clicked region is fenced
*/

function check_fencing(x,y){
    for( room in rooms){
        dims = rooms[room]['dims'];
        if(x>=dims[0] && x<= dims[0]+dims[2])
            if(y>=dims[1] && y <= dims[1]+dims[3])
                return room;
    }
}

function getMousePosition(canvas, event) { 
    let rect = canvas.getBoundingClientRect(); 
    let x = event.clientX - rect.left; 
    let y = event.clientY - rect.top; 
    console.log("Coordinate x: " + x,  
                "Coordinate y: " + y); 
    var region = check_fencing(x,y) ;
    if (!region)
        return;
    if(rooms[region]['fenced'] == false){
        result = confirm("Do you want to fence " + region);
        rooms[region]['fenced'] = result;
        if(result == true){
            var dims = rooms[region]['dims'];
            draw_rect(dims[0],dims[1],dims[2],dims[3],"#FF0000");
            }    
        }
    else{
        result = confirm("Do you want to remove fence from " + region);
        rooms[region]['fenced'] = !result;
        if(result == true){
            var dims = rooms[region]['dims'];
            clear(dims[0]-5,dims[1]-5,dims[2]+10,dims[3]+10);    
	    rooms[region]['alert'] = false;
        }
    }
} 

let canvasElem = document.querySelector("canvas"); 
  
canvasElem.addEventListener("contextmenu", function(e) 
{ 
    getMousePosition(canvasElem, e); 
    redraw();
}); 


/*
* Listen for changes and place the dot
*/

var socket = io();

socket.on('connect', () => {
    console.log(('connect'));
  });
  
socket.on('hello', (pos) => {
    console.log(pos);
    console.log(rooms['Room1'])

    // Fencing and Alert
    if (rooms[pos]['fenced']){
	if(rooms[pos]['alert'] == false){
            rooms[last_pos]['alert'] = true;
	    rooms[pos]['alert'] = true;
            if(email)
		send_alert('You have entered a fenced region'); 
	    alert('You have entered a fenced region');
    
	}
    }
    else{
    	rooms[last_pos]['alert'] = false;
    }
    

    // Positioning
    dims = rooms[last_pos]['dims'];
    clear(dims[0],dims[1],dims[2],dims[3]);
    last_pos = pos;
    redraw();
    
});



socket.on('console', (con) => {
	//console.log(con);
	str = $('.console-card').html();
	str += "</br>"+ JSON.stringify(con)
	$('.console-card').html(str);

});
