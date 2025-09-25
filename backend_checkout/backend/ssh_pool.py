import paramiko
from queue import Queue
import threading
import time

class SSHConnectionPool:
    def __init__(self, hostname, username, password=None, key_filename=None, port=22, max_connections=5, 
                 jump_hostname=None, jump_username=None, jump_password=None, jump_port=22):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.key_filename = key_filename
        self.port = port
        self.max_connections = max_connections
        self.jump_hostname = jump_hostname
        self.jump_username = jump_username
        self.jump_password = jump_password
        self.jump_port = jump_port
        self.pool = Queue(maxsize=max_connections)
        self.lock = threading.Lock()
        
        # 初始化连接池
        for _ in range(max_connections):
            self._create_connection()
    
    def _create_connection(self):
        """创建新的SSH连接"""
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            if self.jump_hostname:
                # 创建跳转主机连接
                jump_client = paramiko.SSHClient()
                jump_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                jump_client.connect(
                    hostname=self.jump_hostname,
                    username=self.jump_username,
                    password=self.jump_password,
                    key_filename=self.key_filename,
                    port=self.jump_port
                )
                
                # 通过跳转主机创建隧道
                jump_transport = jump_client.get_transport()
                dest_addr = (self.hostname, self.port)
                local_addr = ('127.0.0.1', 0)
                channel = jump_transport.open_channel("direct-tcpip", dest_addr, local_addr)
                
                # 通过隧道连接目标主机
                client.connect(
                    hostname=self.hostname,
                    username=self.username,
                    password=self.password,
                    key_filename=self.key_filename,
                    port=self.port,
                    sock=channel
                )
                
                # 保存跳转客户端引用以便后续清理
                client._jump_client = jump_client
            else:
                # 直接连接
                client.connect(
                    hostname=self.hostname,
                    username=self.username,
                    password=self.password,
                    key_filename=self.key_filename,
                    port=self.port
                )
            
            self.pool.put(client)
        except Exception as e:
            print(f"创建SSH连接失败: {str(e)}")
    
    def get_connection(self):
        """从连接池获取一个连接"""
        try:
            client = self.pool.get(timeout=5)
            if not self._is_connection_alive(client):
                client.close()
                with self.lock:
                    self._create_connection()
                client = self.pool.get(timeout=5)
            return client
        except Exception as e:
            print(f"获取SSH连接失败: {str(e)}")
            return None
    
    def return_connection(self, client):
        """将连接返回池中"""
        if client and self._is_connection_alive(client):
            self.pool.put(client)
        else:
            with self.lock:
                self._create_connection()
    
    def _is_connection_alive(self, client):
        """检查连接是否仍然有效"""
        try:
            client.exec_command('echo "test"', timeout=1)
            return True
        except:
            return False
    
    def close_all(self):
        """关闭所有连接"""
        while not self.pool.empty():
            try:
                client = self.pool.get_nowait()
                # 如果有跳转客户端，也要关闭
                if hasattr(client, '_jump_client'):
                    client._jump_client.close()
                client.close()
            except:
                pass

# 使用示例
"""
# 创建连接池
pool = SSHConnectionPool(
    hostname='your_host',
    username='your_username',
    password='your_password',  # 或者使用 key_filename
    max_connections=5
)

# 使用连接
try:
    client = pool.get_connection()
    stdin, stdout, stderr = client.exec_command('your_command')
    result = stdout.read().decode()
    print(result)
finally:
    pool.return_connection(client)

# 程序结束时关闭所有连接
pool.close_all()
""" 

if __name__ == "__main__":
    print("start ssh test")
    KEY_PATH = '/Users/jiminj/.ssh/id_rsa_hust_server'
    pool86 = SSHConnectionPool(
        hostname='192.168.165.232',
        username='jinjm',
        key_filename=KEY_PATH,
        port=22222,
        max_connections=5
    )
    client = pool86.get_connection()
    stdin, stdout, stderr = client.exec_command('ls')
    print(stdout.read().decode())