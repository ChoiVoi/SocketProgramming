# SocketProgramming

The Internet of Things, or IoT, refers to the billions of physical devices around the world that are now 
connected to the Internet, all collecting and sharing data for improving people’s quality of life. For 
example, the smartwatches which are very popular nowadays, can collect data from the wearer and 
share data with its central sever for monitoring the health of the wearer. you will 
have the opportunity to implement your own version of a data collection and sharing network based 
on the idea of IoT. Your application is based on the client-server architecture consisting of one server 
and multiple clients (i.e., the edge IoT devices) communicating concurrently. Your application will support a range of functions that are typically found from the existing 
edge networks including authentication (between edge devices and the central server), data generation 
at the side of edge devices, and data sharing between edge devices and the central server, and between 
one edge device and another edge device. 

# Authentication

When a client requests a connection to the server, e.g., for joining an edge network, the server should 
prompt the client to input the edge device name and password and authenticate the edge device. The 
valid edge device name and password combinations will be stored in a file called credentials.txt which 
will be in the same directory as the server program. An example credentials.txt file is provided on the 
assignment page. Edge device names and passwords are case-sensitive, and you can assume that 
the edge device name is unique for the context of this assignment. We may use a different file for 
testing  so  DO  NOT  hardcode  this  information  in  your  program.  You  may  assume  that  each  edge 
device name and password will be on a separate line and that there will be one white space between 
the two. Device names and passwords will not contain any white space. If the credentials are correct, 
the  edge  device  is  considered  to  be  successfully  authenticated  and  joined  the  edge  network  and  a 
welcome message is displayed. 

On  entering  invalid  credentials,  the  client  is  prompted  to  retry.  After  several  consecutive  failed 
attempts, this edge device is blocked for 10 seconds (the number is an integer command-line argument 
supplied to the server and the valid value of the number should be between 1 and 5) and cannot join the 
network during this 10-second duration (even from another IP address).  If an invalid number value 
(e.g.,  a floating-point value, 0 or 6) is supplied to the server, the server prints out a message such as 
“Invalid number of allowed failed consecutive attempts: number. The valid value of argument number 
is an integer between 1 and 5”.

After an edge device has joined the network successfully, the edge device (i.e., 
the client) should next send the server the UDP port number on which it will listen for P2P connections. 
The server should record a timestamp of the edge device joining, the edge device name, its IP address, 
and its UDP port number, in the active edge device log file (edge-device-log.txt): 
 
Active edge device sequence number; timestamp; edge device name; edge 
device IP address; edge device UDP server port number 
 
1; 30 September 2022 10:31:13; supersmartwatch; 129.64.31.13; 5432

