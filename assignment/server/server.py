"""
    Sample code for Multi-Threaded Server
    Python 3
    Usage: python3 TCPserver3.py localhost 12000
    coding: utf-8
    
    Author: Jaywoo Choi
"""
from socket import *
from threading import Thread
import sys, select, os
from datetime import datetime

# acquire server host and port from command line parameter
if len(sys.argv) != 3:
    print("\n===== Error usage, python3 TCPServer3.py SERVER_PORT LOGIN_FAILED_ATTEMPTS ======\n")
    exit(0)
serverHost = gethostbyname(gethostname())
serverPort = int(sys.argv[1])
num_of_chance_login = int(sys.argv[2])
commands_array = ["UED", "SCS", "DTE", "AED", "OUT"]

if num_of_chance_login > 6 or num_of_chance_login < 1:
    print(f'Invalid number of allowed failed consecutive attempts: {num_of_chance_login}')
    exit(0)
    
serverAddress = (serverHost, serverPort)

# define socket for the server side and bind address
serverSocket = socket(AF_INET, SOCK_STREAM)
serverSocket.bind(serverAddress)

"""
    Define multi-thread class for client
    This class would be used to define the instance for each connection from each client
    For example, client-1 makes a connection request to the server, the server will call
    class (ClientThread) to define a thread for client-1, and when client-2 make a connection
    request to the server, the server will call class (ClientThread) again and create a thread
    for client-2. Each client will be runing in a separate therad, which is the multi-threading
"""
class ClientThread(Thread):
    def __init__(self, clientAddress, clientSocket):
        Thread.__init__(self)
        self.clientAddress = clientAddress
        self.clientSocket = clientSocket
        self.clientAlive = False
        
        print("===== New connection created for: ", clientAddress)
        self.clientAlive = True
    
    # checking if username and password are in credential
    def check_credential(self, data):
        f = open("credentials.txt", "r")
        for combination in f:
            if combination.rstrip("\n") == data.rstrip("\n"):
                return True
        f.close()
        return False

    def process_login(self):
        message = 'user credentials request'
        global login_time
        login_attempts = 1
        print('[send] ' + message)
        self.clientSocket.send(message.encode())
        login_try_num = 0
        while(1):
            data = self.clientSocket.recv(1024).decode()
            if login_attempts == num_of_chance_login and not self.check_credential(data):
                msg = "block"
                self.clientSocket.send(msg.encode())
                break
            if not self.check_credential(data):
                print("Invalid login")
                login_attempts = login_attempts + 1
                msg = 'Invalid'
                self.clientSocket.send(msg.encode())
            else:
                print("Welcome")
                msg = 'Welcome'
                login_time = datetime.now()
                print(f'login time: {login_time}')
                self.clientSocket.send(msg.encode())    
                break  
        
    # open and read the cse_edge_device_log.txt and append the login log
    def edge_device_log(self):
            line = 0
            data = self.clientSocket.recv(1024).decode()
            with open("edge-device-log.txt", "r") as fp:
                line = len(fp.readlines()) + 1
            EDLOG = str(line) + "; " + str(login_time) + " " + data
            f = open("edge-device-log.txt", "a")
            f.write(EDLOG)
            f.write("\n")
            f.close()
    
    # calculate SUM or AVERAGE or MAX or MIN
    def calculate(self, operation, file):
        f = open(file + ".txt", "r")
        lines = f.read().splitlines()
        nums = []
        sum_data = 0
        avg_data = 0
        
        for line in lines:
            nums.append(line)
        
        max_data = nums[0]
        min_data = nums[0]
        
        for a in range(0, len(nums)):
            sum_data += int(nums[a])
            avg_data = sum_data / len(nums)
            
        for b in range(0, len(nums)):
            if b > int(max_data):
                max_data = b
        
        for c in range(0, len(nums)):
            if c < int(min_data):
                min_data = b
        
        if operation == "SUM":
            return sum_data
        elif operation == "AVERAGE":
            return avg_data
        elif operation == "MAX":
            return max_data
        elif operation == "MIN":
            return min_data
        
    def commands(self, command):
        if command == "UED":
            print("[recv] UED")
            message = 'UED'
            print("[send] " + message)
            self.clientSocket.send(message.encode())
            log_username = self.clientSocket.recv(1024).decode()
            msg = f"username is {log_username}"
            self.clientSocket.send(msg.encode())
            log_format = self.clientSocket.recv(1024).decode()
            f = open("upload-log.txt", "a")
            log_time = str(datetime.now())
            log = log_username + log_time + log_format
            f.write(log + "\n")
            f.close()
            msg = "successfully moved to server"
            self.clientSocket.send(msg.encode())
            
        elif command == "SCS":
            print("[recv] SCS")
            message = 'SCS'
            print("[send] " + message)
            self.clientSocket.send(message.encode())
            operation = self.clientSocket.recv(1024).decode()
            file = self.clientSocket.recv(1024).decode() 
            fileName = f'{file}.txt'
            if not os.path.exists(fileName):
                msg = 'file does not exist'
                print(msg)
            else:
                result = self.calculate(operation, file)
                msg = f'result of {operation} in file {file}.txt is {result}'
            self.clientSocket.send(msg.encode())
            
        elif command == "DTE":
            print("[recv] DTE")
            message = 'DTE'
            print("[send] " + message)
            self.clientSocket.send(message.encode())
            file = self.clientSocket.recv(1024).decode()
            fileName = f'{file}.txt'
            
            # check if the file exists
            if not os.path.exists(fileName):
                msg = 'file does not exist'
            else:
                msg = f"file name is {file}.txt"
                self.clientSocket.send(msg.encode())
                log_username = self.clientSocket.recv(1024).decode()
                msg = f"log info {log_username}"
                self.clientSocket.send(msg.encode())
                fileId = self.clientSocket.recv(1024).decode()
                
                # Data amount in the file
                f = open(file + ".txt", "r")
                lines = f.read().splitlines()
                nums = []
                for line in lines:
                    nums.append(line) 
                    dataAmount = len(nums)
                
                # delete the file
                os.remove(file + ".txt")
                time_deleted = datetime.now()
                msg = "File removed"
                f = open("deletion-log.txt", "a")
                f.write(log_username + str(time_deleted) + "; " + fileId + "; " + str(dataAmount) + "\n")
                f.close()
                msg = "File removed"
                print(msg)
            self.clientSocket.send(msg.encode())
            
        elif command == "AED":
            print("[recv] AED")
            message = 'AED'
            print("[send]" + message)
            self.clientSocket.send(message.encode())
            username = self.clientSocket.recv(1024).decode()
            devices = []
            timestamps = []
            ip_adresses = []
            UDP_ports = []
            msg = "no other active edge devices"
            with open("edge-device-log.txt", "r") as f:
                lines = f.readlines()
                for line in lines:
                    data = line.split(' ')
                    timestamp = data[1] + ' ' + data[2]
                    ip_address = data[4]
                    UDP_port = data[5]
                    if data[3] != username:
                        devices.append(data[3])
                        timestamps.append(timestamp)
                        ip_adresses.append(ip_address)
                        UDP_ports.append(UDP_port)
                        msg = "There is/are other device(s) active"
            # record the active edge devices info in
            # the file called other_active_devices.txt
            # and the client simply reads the file
            with open("other_active_devices.txt", "w") as f:
                for x in range(len(devices)):
                    f.write(f"device: {devices[x]} / timestamp: {timestamps[x]} / ip_address: {ip_adresses[x]} / UDP_port: {UDP_ports[x]}\n ")
            self.clientSocket.send(msg.encode())
            
        elif command == "OUT":
            print("[recv] OUT")
            message = 'OUT'
            print("[send] " + message)
            self.clientSocket.send(message.encode())
            username = self.clientSocket.recv(1024).decode()
            with open("edge-device-log.txt", "r") as f:
                lines = f.readlines()
            with open("edge-device-log.txt", "w") as f:
                i = 1
                for line in lines:
                    username_in_log = line.split(' ')
                    if username_in_log[3] != username:
                        # replace the first word which is
                        # the sequnce number to new sequence number
                        line = line.replace(line[:1], str(i))
                        f.write(line)
                        i += 1
                f.close()
            msg = "removed log"
            self.clientSocket.send(msg.encode())
            
    def run(self):
        message = ''
        
        while self.clientAlive:
            # use recv() to receive message from the client
            data = self.clientSocket.recv(1024)
            message = data.decode()
            
            # if the message from client is empty, the client would be off-line then set the client as offline (alive=Flase)
            if message == '':
                self.clientAlive = False
                print("===== the user disconnected - ", clientAddress)
                break
            
            # handle message from the client
            if message == 'login':
                print("[recv] New login request")
                self.process_login()
                self.edge_device_log()
            elif message == 'download':
                print("[recv] Download request")
                message = 'download filename'
                print("[send] " + message)
                self.clientSocket.send(message.encode())
            elif message in commands_array:
                self.commands(message)
            else:
                print("[recv] " + message)
                print("[send] Cannot understand this message")
                message = 'Cannot understand this message'
                self.clientSocket.send(message.encode())
    
    """
        You can create more customized APIs here, e.g., logic for processing user authentication
        Each api can be used to handle one specific function, for example:
        def process_login(self):
            message = 'user credentials request'
            self.clientSocket.send(message.encode())
    """

        


print("\n===== Server is running =====")
print("IP address is " + serverHost)
print("===== Waiting for connection request from clients...=====")


while True:
    serverSocket.listen()
    clientSockt, clientAddress = serverSocket.accept()
    clientThread = ClientThread(clientAddress, clientSockt)
    clientThread.start()