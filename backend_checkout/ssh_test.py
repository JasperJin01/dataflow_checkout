#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import paramiko
import time
import sys

def test_ssh_command():
    """
    测试SSH远程命令执行
    """
    # SSH连接参数 - 使用与views.py中相同的配置
    hostname = '192.168.165.231'
    port = 22222
    username = 'qch'
    key_filename = '/Users/jiminj/.ssh/id_rsa_qch'
    
    # 要执行的命令
    command = 'source /tools/Xilinx/Vitis/2023.2/settings64.sh;source /opt/xilinx/xrt/setup.sh;cd /home/qch/se_src/src && ./se50MHz se50.xclbin sc_20171128_174550 0.0001'
    
    print(f"开始测试SSH连接到 {hostname}...")
    print(f"执行命令: {command}")
    print("-" * 80)
    
    try:
        # 创建SSH客户端
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # 连接到远程服务器
        print("正在连接...")
        ssh.connect(hostname=hostname, port=port, username=username, key_filename=key_filename, timeout=30)
        print("SSH连接成功！")
        
        # 执行命令
        print("\n开始执行命令...")
        stdin, stdout, stderr = ssh.exec_command(command, timeout=300)  # 5分钟超时
        
        # 实时读取输出
        print("\n=== 命令输出 ===")
        output_lines = []
        error_lines = []
        
        # 读取标准输出
        while True:
            line = stdout.readline()
            if not line:
                break
            line = line.strip()
            if line:
                print(f"STDOUT: {line}")
                output_lines.append(line)
        
        # 读取错误输出
        while True:
            line = stderr.readline()
            if not line:
                break
            line = line.strip()
            if line:
                print(f"STDERR: {line}")
                error_lines.append(line)
        
        # 获取退出状态
        exit_status = stdout.channel.recv_exit_status()
        print(f"\n命令执行完成，退出状态: {exit_status}")
        
        # 总结输出
        print("\n=== 执行总结 ===")
        print(f"标准输出行数: {len(output_lines)}")
        print(f"错误输出行数: {len(error_lines)}")
        print(f"退出状态: {exit_status}")
        
        if exit_status == 0:
            print("✅ 命令执行成功！")
        else:
            print("❌ 命令执行失败！")
        
        # 显示详细输出
        if output_lines:
            print("\n=== 标准输出详情 ===")
            for i, line in enumerate(output_lines, 1):
                print(f"{i:3d}: {line}")
        
        if error_lines:
            print("\n=== 错误输出详情 ===")
            for i, line in enumerate(error_lines, 1):
                print(f"{i:3d}: {line}")
        
        return exit_status == 0, output_lines, error_lines
        
    except paramiko.AuthenticationException:
        print("❌ SSH认证失败！请检查用户名和密码。")
        return False, [], []
    except paramiko.SSHException as e:
        print(f"❌ SSH连接错误: {e}")
        return False, [], []
    except Exception as e:
        print(f"❌ 执行过程中发生错误: {e}")
        return False, [], []
    finally:
        try:
            ssh.close()
            print("\nSSH连接已关闭。")
        except:
            pass

if __name__ == "__main__":
    print("SSH远程命令执行测试")
    print("=" * 50)
    
    success, stdout_lines, stderr_lines = test_ssh_command()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 测试完成：命令执行成功！")
    else:
        print("⚠️  测试完成：命令执行失败或出现问题！")
    
    sys.exit(0 if success else 1)