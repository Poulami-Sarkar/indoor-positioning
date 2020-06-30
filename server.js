// Blutooth
const Noble = require("noble");
const BeaconScanner = require("node-beacon-scanner");

// Sockets
var express = require('express') 
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

// Email
var nodemailer = require('nodemailer');
// Node mailer
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'poulamirulz@gmail.com',
    pass: 'Rollercoaster47'
  }
});

// Bluetooth Scanning
var scanner = new BeaconScanner();
var beacons = {'ecfa759a7414':{'uuid':'','rssi':0,'dist':0},'ec2e90d0532c':{'uuid':'','rssi':0,'dist':0},'ecc0c898515d':{'uuid':'','rssi':567,'dist':0}};
var pos = 'My room';

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile('./public/index.html',{'root':__dirname});
});

// Establish socket connection

io.on('connection', (socket) => {
  console.log('a user connected');
});


// Submit to server
io.on('connect', socket => {
    let counter = 0;
    setInterval(() => {
      socket.emit('hello',pos );
      socket.emit('console',beacons);
    }, 1000);
  });

http.listen(8000, () => {
  console.log('listening on *:8000');
});

/*
* Email Service
*/
// Alert when user enters a restricted area
app.get('/data',function(req,resp){

  // Extract data from the query string
  msg = req.query.msg;
  email = req.query.email;

  // Responsr sent backt to main.js
  resp.send('GET request to the homepage '+msg);

  var mailOptions = {
    from: 'poulamisarkar101@gmail.com',
    to: email,
    subject: 'ALERT!',
    text: 'Movement detected in restricted area'
  };
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
});


/*
*
*/

function update_rssi(id,rssi){
   beacons[id]['rssi']=parseFloat(rssi);
   beacons[id]['dist']=10**((-71-parseFloat(rssi))/(10*2))
}

function position(){
    var A = beacons['ecfa759a7414']['dist'];
    var B = beacons['ec2e90d0532c']['dist'];
    var C = beacons['ecc0c898515d']['dist'];

    var small1 ;
    var small2;
    // Find the beacon user is closest to
    if (A<B){
    	if(A<C){
            small1 = 'A';
	    if(C<B)     small2='C'; else  small2='B';
	 }
	else{
	    small1 = 'C';
	    small2 = 'A';        
	}
    }
    else{
	if(B<C){
	    small1 = 'B';
	    if(C<A)	small2='C'; else	small2='A';
	}
	else{
            small1 = 'C';
            small2 = 'B';        
        }
    }

    console.log(small1, small2);
    console.log(A,B,C);   
    if(A==0 && B==0){
    	console.log('Room2');
	pos='Room2';
    }
    else if(A == 0){
        if (C<3){
            console.log('Room1');
	    pos = "Room1";
        }
        else{
            console.log('Room2');
            pos='Room2';
	}    
    }
    else if(C == 0){
        console.log('Sitting');
	pos = 'Sitting';    
    }
    
    else if(small1 =='A'){
    	console.log('Sitting',A);
        pos = 'Sitting';    
    }
    else if(small1 =='C'){
	if(C<3){
            console.log('Room1', C);
            pos = 'Room1';
	}
	else{
            console.log('Room2');
            pos = 'Room2';
        }    
    }
    else if(small1 == 'B'){
    	console.log('Dining',B);
        pos = 'Dining';
    }

   console.log(small1=='C')
/*
    else if (A<B && B<C || C<3){
        //if (A<2)
            console.log('Sitting');
    	pos = 'Sitting';
    }
    else if (B<A && B<C  || B<3){
        //if (B<2)
            console.log('Dining');
	pos = 'Dining';
    }
    else if (C<A && B<A && A<3 || A<3 ){
        //if(C<2)
            console.log('Room1');
    	pos = 'Room1'; 
    }
    else if (B>A && B>C){
        console.log('Utility')
    	pos = 'Utility';
    }
    if (C<A && B<A && A>=3){
        console.log('Room2');
	pos = 'Room2';
    }*/
    // Case for Kitchen
}

/*
* Scan for beacons that are being advertised
*/
scanner.onadvertisement = (advertisement) => {
    var beacon = advertisement["iBeacon"];
    beacon.rssi = advertisement["rssi"];
    //console.log(JSON.stringify(beacon, null, "    "))
    update_rssi(advertisement['id'],advertisement['rssi'])
    console.log(beacons);
    position();
    //console.log(JSON.stringify(advertisement, null, "    "))
};


scanner.startScan().then(() => {
    console.log("Scanning for BLE devices...")  ;
}).catch((error) => {
    console.error(error);
});
