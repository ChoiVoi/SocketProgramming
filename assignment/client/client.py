"""
    Python 3
    Usage: python3 TCPClient3.py localhost 12000
    coding: utf-8
    
    Author: Jaywoo Choi
"""
from socket import *
import sys
import time
import shutil, os
from datetime import datetime

#Server would be running on the same host as Client
if len(sys.argv) != 4:
    print("\n===== Error usage, python3 TCPClient3.py SERVER_IP SERVER_PORT UDP_PORT ======\n")
    exit(0)
serverHost = sys.argv[1]
serverPort = int(sys.argv[2])
UDP_port = int(sys.argv[3])
serverAddress = (serverHost, serverPort)

# define a socket for the client side, it would be used to communicate with the server
clientSocket = socket(AF_INET, SOCK_STREAM)

# build connection with the server and send message to it
clientSocket.connect(serverAddress)

ip_address = gethostbyname(gethostname())

    
def client_login():
    client_login.successful = False
    while True:
        while True:
            client_login.username = input("User name: ")
            if client_login.username != '':
                break
            else: 
                print("User name is empty, try again")
        while True:
            password = input("Password: ")
            if password != '':
                break
            else:
                print("Password is empty, try again")
                
        # combine username and password so that the format is the same in credential.txt
        # which is easy to compare the username and password
        combination_id_and_password = client_login.username + " " + password
        clientSocket.sendall(combination_id_and_password.encode())
        data = clientSocket.recv(1024)
        receivedMsg = data.decode()
        if receivedMsg == 'Invalid':
            print("Invalid login")
            continue
        elif receivedMsg == 'Welcome':
            print("Welcome")
            client_login.successful = True
            edge_device_log()
            print("Enter one of the following commands (EDG, UED, SCS, DTE, AED, UVF, OUT)")
            commands()
            break
        elif receivedMsg == 'block':
            print("you failed to login, blocked for 10seconds")
            blocked_time = 10
            while (blocked_time != 0):
                blocked_time = blocked_time - 1
                time.sleep(1)
        break
# if client logins successfully, record the log
def edge_device_log():
    if client_login.successful:
        edge_device_name = client_login.username
        edge_device_log.log = edge_device_name + " " + str(ip_address) + " " + str(UDP_port)
        clientSocket.sendall(edge_device_log.log.encode())
    
def commands():
    while True:
        commands_list = input("Command: ")
        commands.command_input = commands_list.split()          
        clientSocket.sendall(commands.command_input[0].encode())

        data = clientSocket.recv(1024).decode()
        if commands.command_input[0] == "EDG":
            EDG_execution()
        elif data == "UED":
            UED_execution()
        elif data == "SCS":
            SCS_execution()
        elif data == "DTE":
            DTE_execution()
        elif data == "AED":
            AED_execution()
        elif data == "OUT":
            OUT_execution()
        
def EDG_execution():
    
    # check input arguments
    if len(commands.command_input) != 3:
        print("EDG command requires fileID and dataAmount as arguments.")
        
    # check input arguments are integer (except the command)
    elif not commands.command_input[1].isdigit() or not commands.command_input[2].isdigit():
        print("the fileID or dataAmount are not integers, you need to specify the parameter as integers")
    else:
        fileId = client_login.username + "-" + commands.command_input[1]
        EDG_execution.dataAmount = commands.command_input[2]
        f = open(fileId + ".txt", 'w')
        i = 0
        while i < int(EDG_execution.dataAmount):
            f.write(str(i) + "\n")
            i += 1
        f.close()
        file_created_time = datetime.now()
        file_made_msg = f'{fileId}.txt is created (data generation done)'
        print(file_made_msg)

def UED_execution():
    
    # check input arguments
    if len(commands.command_input) != 2:
        print("fileID is needed to upload the data")
    else:
        name = client_login.username + "-" + commands.command_input[1]
        print(name)
        fileName = f'{name}.txt'
        # check if the file exists
        if os.path.exists(fileName):
            f = open(fileName, "r")
            lines = f.read().splitlines()
            nums = []
            for line in lines:
                nums.append(line) 
                datas = len(nums)
            # copy the file to the server directory
            shutil.copy(fileName, "../server")
            log_username = client_login.username + "; "
            log_format = "; " + commands.command_input[1] + "; " + str(datas)
            clientSocket.sendall(log_username.encode())
            msg = clientSocket.recv(1024).decode()
            clientSocket.sendall(log_format.encode())
            msg = clientSocket.recv(1024).decode()
            print(msg)
        else:
            msg = clientSocket.recv(1024).decode()
            print(msg)
    
def SCS_execution():
    operations = ["SUM", "AVERAGE", "MIN", "MAX"]
    
    # check the input arguments and type
    if len(commands.command_input) != 3 or not commands.command_input[1].isdigit():
        print("fileID is missing or fileID should be an integer")
        
    # check if the operations are the correct operations
    elif not commands.command_input[2] in operations:
        print("wrong operation input")
    else: 
        file = client_login.username + "-" + commands.command_input[1]
        operation = commands.command_input[2]
        clientSocket.sendall(operation.encode())
        clientSocket.sendall(file.encode())
        msg = clientSocket.recv(1024).decode()
        print(msg)
    
def DTE_execution():
    file = client_login.username + "-" + commands.command_input[1]
    clientSocket.sendall(file.encode())
    fileName = f'{file}.txt'
    if not os.path.exists("../server/" + fileName):
        msg = clientSocket.recv(1024).decode()
    else:
        log = client_login.username + "; "
        fileId = commands.command_input[1]
        msg = clientSocket.recv(1024).decode()
        print(msg)
        clientSocket.sendall(log.encode())
        msg = clientSocket.recv(1024).decode()
        print(msg)
        clientSocket.sendall(fileId.encode())
        msg = clientSocket.recv(1024).decode()
    print(msg)
    
def OUT_execution():
    username = client_login.username
    clientSocket.sendall(username.encode())
    msg = clientSocket.recv(1024).decode()
    print(msg)
    exit(0)
    
def AED_execution():
    username = client_login.username
    clientSocket.sendall(username.encode())
    msg = clientSocket.recv(1024).decode()
    print(msg)
    with open("../server/other_active_devices.txt", "r") as f:
        lines = f.readlines()
        for line in lines:
            print(line)
        f.close()

while True:
    message = input("===== Please type any messsage you want to send to server: =====\n")
    clientSocket.sendall(message.encode())

    # receive response from the server
    # 1024 is a suggested packet size, you can specify it as 2048 or others
    data = clientSocket.recv(1024)
    receivedMessage = data.decode()

    # parse the message received from server and take corresponding actions
    if receivedMessage == "":
        print("[recv] Message from server is empty!")
    elif receivedMessage == "user credentials request":
        print("[recv] You need to provide username and password to login")
        client_login()
    elif receivedMessage == "download filename":
        print("[recv] You need to provide the file name you want to download")
    else:
        print("[recv] Message makes no sense")
        
    # ans = input('\nDo you want to continue(y/n) :')
    # if ans == 'y':
    #     continue
    # else:
    #     break

        
# close the socket
clientSocket.close()