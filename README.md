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

# commands

After the edge device has successfully joined the edge network, the client needs to display a message 
informing  all  available  commands  and  prompting  it  to  select  one  command.  In  the  context  of  this 
assignment,  the  following  commands  are  available:  EDG:  Edge  Data  Generation  which  means  the 
client side helps to generate data to simulate the data collection function in the real edge device,  UED: 
Upload Edge Data, it allows the edge device to upload a particular edge data file to the central server, 
SCS: Server Computation Service, the edge device can practice this command to request the server to 
do some basic computations on a particular data file,  DTE: Delete the data file (server side), AED: 
Active Edge Devices, request and display the active edge devices, OUT: exit this edge network. All available commands should 
be displayed in the first instance after the edge device has joined the network. Subsequent prompts for 
actions  should  include  this  same  message.  If  an  invalid  command  is  selected,  an  appropriate  error 
message should be displayed, and they should be prompted to select one of the available commands. 
 
In the following, the implementation of each command is explained in detail. The expected usage of 
each  command  (i.e.,  syntax)  is  included.  Note  that,  all  commands  should  be  upper-case  (EDG, 
UED, etc.). All arguments (if any) are separated by a single white space and will be one word long 
(except messages which can contain white spaces and timestamps that have a fixed format of dd mm 
yyyy  hh:mm:ss  such  as 30  September  2022  10:31:13).  You  may  assume  that  the 
communication data files only contain numbers (i.e., integers). 

EDG: Edge Data Generation 
 
EDG fileID dataAmount 
 
The fileID and dataAmount should be included as arguments, the fileID is an integer which is used 
to uniquely identify the file which will be utilised to store the generated data, the name  of the file 
should be edge device name-fileID and the file type should be txt (e.g., supersmartwatch-1.txt). The 
dataAmount  argument  is  used  to  indicate  the  number  the  data  samples  to  be  generated.  You  can 
randomly  generate  the  data  samples,  there  is  no  strict  requirements  for  the  data  generation,  for 
example, if dataAmount is specified as 10, then you can generate any 10 integers (e.g., from 1 to 10, 
from 20 to 30, or any other 10 integers) and store them into the data file. In addition, when you store 
the  data  samples  into  the  file,  you  should  follow the rule of “one line one number”,  an  example 
(supersmartwatch-1.txt)  is  provided.  Note  that,  if  the  file  already  exists  in  the  subsequent  EDG 
command calls, you should directly overwrite the existing data samples with the new generated data 
samples.  If  the  fileID  or  dataAmount  argument  are  missing  from  the  EDG  command,  you  should 
prompt  a  proper  error  message, for example, “EDG command requires fileID and dataAmount as 
arguments.”, and if  the  provided  fileID  and  dataAmount  parameters  are  not  integers,  you  should 
prompt a proper error message, for example, “the fileID or dataAmount are not integers, you need to 
specify the parameter as integers”.  
 
After the edge device successfully generates the data samples and stores them into the file, you should 
prompt  a  proper  message  (e.g.,  “data  generation  done”)  to  indicate  this  command  has  been 
successfully processed by the edge device.  
 
UED: Upload Edge Data 
 
UED fileID 
 
The fileID of the particular file the edge device is going to upload is included as the argument.  Upon 
receiving this command the edge device (i.e., the client) is expected to read the data samples from the 
corresponding file and transfer the data samples to the central server using TCP. The client needs to 
check if the fileID argument is provided or not, you should prompt a message for example “fileID is 
needed to upload the data” if the fileID is missed. The client also needs to check if the corresponding 
file exists or not, you should prompt a message e.g., “the file to be uploaded does not exist” if the file 
does not exist at the edge device side. After the central server successfully receives the file, the server 
should send a message to the edge device to inform that the server has successfully received the file, 
and  the  client  also  should  prompt  a  proper  message  to  indicate  that  the  file  uploading  is  done 
successfully. In addition, the central sever should maintain an uploading log file named as upload-
log.txt.  If  everything is good, the server should  append  an uploading log  message in the following 
format: 
 
edgeDeviceName; timestamp; fileID; dataAmount 
 
supersmartwatch; 30 September 2022 10:31:13; 1; 10 
 
 
SCS: Server Computation Service 
 
SCS fileID computationOperation 
 
This command is designed to request the powerful central server to do various computations, because 
in  reality  the  edge  devices  normally  have  very  limited  computation  resources.  The  fileID  and 
computationOperation are included as two arguments. The fileID is used to indicate the 
corresponding data file used for the computation purpose. If the fileID is not provided or the fileID 
is  not  an  integer  the  client  should  prompt  a  proper  error message e.g., “fileID is missing or fileID 
should be an integer”. The server also needs to check if the corresponding file exists or not, if the file 
does not exist the server should respond to the client with a message informing the client that the file 
does not exist, and the client should prompt a proper message indicating the file does not exist at the 
server side. For simplicity, we define a total of four computation operations for this assignment: SUM, 
AVERAGE,  MAX,  MIN.  SUM  –  calculate  the  sum  of  the  data  samples  in  the  corresponding  file, 
AVERAGE – get the average of the data samples in the corresponding file, MAX – get the maximum 
value  among  the  data  samples,  and  MIN  –  get  the  minimum  value  among  the  data  samples.  If  the 
provided computation operation argument is not one of these four, the client should display a proper 
error message. If everything is good, the server should send the computation result to the edge device 
(i.e., the client) and it should display the result properly at the terminal.  
 
 
DTE: Delete the data file 
 
DTE fileID 
 
The fileID of the particular file the edge device is going to delete at the central server side is included 
as the argument, upon receiving this command the edge device (i.e., the client) is expected to send a 
message to the central server to  request the server to delete the corresponding file with that fileID 
provided in the argument. The server needs to first check if the file exists or not, if the file does not 
exist the server should make a response to inform the client the file to be deleted does not exist and 
the client should display a proper error message at the terminal, for example, “the file does not exist 
at the server side”. If everything is good, the server should remove the file from its folder completely.  
In  addition,  the  central  sever  should  maintain  a  log  file  named  as  deletion-log.txt.  If  everything  is 
good, the server should append a delete operation log message in the following format: 
 
edgeDeviceName; timestamp; fileID; dataAmount 
 
supersmartwatch; 30 September 2022 10:33:13; 1; 10 
 
After that, the central server should respond to the client with a message to inform the client the file 
has been successfully deleted and the client should display a successful message (e.g., “file with ID of 
fileID has been successfully removed from the central server”). 
 
 
AED: Active Edge Devices 
 
AED 
 
There  should  be  no  arguments  for  this  command.  The  central  server  should  check  if  there  are  any 
other active edge devices apart from the edge device that sends the AED command. If so, the server 
should  send  the  edge  device  names,  and  timestamps  since  the  edge  devices  joined,  (and  their  IP 
addresses and Port Numbers, CSE Students only) from the active edge device log file to the client 
(the server should exclude the information of the client, who sends the AED command to the server). 
The client should display all the information of all received edge devices at the terminal. If there are 
no other active edge devices, a notification message of “no other active edge devices” should be sent 
to the client and displayed. The client should next prompt to select one of the available commands.  
 
 
OUT: Exit edge network  
 
OUT 
 
There should be no arguments for this command. The client should close the TCP connection, and 
exit with a goodbye message displayed at the terminal. The server should update its state information 
about currently active edge devices and the active edge device log file. Namely, based on the message 
(with the edge device name information) from the client, the server should delete this edge device, 
which  entails  deleting  the  line  containing  this  edge  device  in  the  active  edge  device  log  file  (all 
subsequent active edge devices in the file should be moved up by one line and their active edge device 
sequence numbers should be updated appropriately) and confirmation should be sent to the client and 
displayed at the terminal. Note that all the data files and messages uploaded by this edge device must 
NOT be deleted. For simplicity, we won’t test the cases where an edge device forgets to exit or exit 
is unsuccessful. 

# run server
The server should accept the following two arguments: 
 
• server_port: this is the port number that the server will use to communicate with the edge 
devices (i.e., clients). Recall that a TCP socket is NOT uniquely identified by the server port 
number.  So,  it  is  possible  for  multiple  TCP  connections  to  use  the  same  server-side  port 
number. 

• number_of_consecutive_failed_attempts: this is the number of consecutive 
unsuccessful authentication attempts before an edge device should be blocked for 10 seconds. 
It should be an integer between 1 and 5.

`python server.py server_port number_of_consecutive_failed_attempts`

Note that all references to python in this specification may be replaced by python3 if you use Python 
3 rather than Python 2. 
The client should accept the following three arguments: 
 
• server_IP: this is the IP address of the machine on which the server is running. 
• server_port: this is the port number being used by the server. This argument should be the 
same as the first argument of the server. 
• client_udp_port: this is the port number which the client will listen to/wait for the UDP 
traffic from the other clients

# run client
Note that, you do not have to specify the TCP port to be used by the client. You should allow the OS 
to pick a random available port. Similarly, you should allow the OS to pick a randomly available UDP 
source port for the UDP client. Each client should be initiated in a separate terminal as follows:

`python client.py server_IP server_port client_udp_server_port`

you  can  run  the  server  and  multiple  clients  on  the  same
machine on separate terminals. In this case, use 127.0.0.1 (local host) as the server IP address. 