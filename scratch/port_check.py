import socket
for port in [8000, 8003, 8004, 8005]:
    s = socket.socket()
    res = s.connect_ex(('127.0.0.1', port))
    print(f'Port {port}: {"OPEN" if res == 0 else "CLOSED (" + str(res) + ")"}')
