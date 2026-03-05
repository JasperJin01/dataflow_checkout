#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IP地址自动更新脚本 (Windows版)
用于更新前端和后端配置文件中的IP地址
"""

import socket
import re
import os
import sys

def get_current_ip():
    """
    获取当前机器的IP地址（优先获取10.x.x.x格式）
    """
    try:
        # 获取本机主机名
        hostname = socket.gethostname()
        # 获取本机所有IP地址
        _, _, ip_list = socket.gethostbyname_ex(hostname)
        
        print(f"🔍 发现的IP地址列表: {ip_list}")
        
        # 优先查找 10.x.x.x 的 IP
        for ip in ip_list:
            if ip.startswith('10.'):
                return ip
        
        # 如果没有 10. 开头的，尝试查找 192.168. 或 172. 开头的
        for ip in ip_list:
            if ip.startswith('192.168.') or (ip.startswith('172.') and 16 <= int(ip.split('.')[1]) <= 31):
                return ip

        # 如果还是没有，返回第一个非本地回环的 IP
        for ip in ip_list:
            if not ip.startswith('127.') and not ip.startswith('::1'):
                return ip
                
        if ip_list:
            return ip_list[0]
            
        print("❌ 未找到合适的IP地址")
        return None
            
    except Exception as e:
        print(f"❌ 获取IP地址时出错: {e}")
        return None

def get_base_dir():
    """
    获取脚本所在目录
    """
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

def update_frontend_config(new_ip):
    """
    更新前端配置文件中的IP地址
    """
    base_dir = get_base_dir()
    frontend_file = os.path.join(base_dir, 'src', 'lib', 'request', 'request.js')
    
    if not os.path.exists(frontend_file):
        print(f"❌ 前端配置文件不存在: {frontend_file}")
        return False
    
    try:
        # 读取文件内容
        with open(frontend_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 替换host配置
        # 匹配 host: 'xxx' 或 host: "xxx"
        pattern = r"(host:\s*)(['\"])(.*?)(['\"])"
        
        if not re.search(pattern, content):
            print(f"⚠️  在前端配置中未找到 host 设置")
            return False
            
        def replace_ip(match):
            prefix = match.group(1)
            quote = match.group(2)
            # original_ip = match.group(3)
            return f"{prefix}{quote}{new_ip}{quote}"
        
        updated_content = re.sub(pattern, replace_ip, content)
        
        # 写回文件
        with open(frontend_file, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        print(f"✅ 前端配置已更新: {frontend_file}")
        print(f"   新IP地址: {new_ip}")
        return True
        
    except Exception as e:
        print(f"❌ 更新前端配置失败: {e}")
        return False

def update_backend_config(new_ip):
    """
    更新后端配置文件中的ALLOWED_HOSTS配置
    """
    base_dir = get_base_dir()
    backend_file = os.path.join(base_dir, 'backend_checkout', 'backend', 'settings.py')
    
    if not os.path.exists(backend_file):
        print(f"❌ 后端配置文件不存在: {backend_file}")
        return False
    
    try:
        # 读取文件内容
        with open(backend_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 查找ALLOWED_HOSTS配置并更新
        # 匹配 ALLOWED_HOSTS = [ ... ] (包括多行)
        pattern = r"(ALLOWED_HOSTS\s*=\s*\[)(.*?)(\])"
        match = re.search(pattern, content, re.DOTALL)
        
        if not match:
             print("⚠️  未找到 ALLOWED_HOSTS 配置块")
             return False
             
        prefix = match.group(1)
        hosts_block = match.group(2)
        suffix = match.group(3)
        
        # 提取现有 IP 列表
        # 简单正则提取被引号包围的字符串
        existing_ips = re.findall(r"['\"]([^'\"]+)['\"]", hosts_block)
        
        # 过滤掉所有 10.x IP (除了新的)，保留其他特殊 IP
        # 这里策略是：移除所有 10. 开头的旧 IP，确保只保留最新的一个 10.x IP
        # 保留 localhost, 127.0.0.1 等
        kept_ips = []
        for ip in existing_ips:
            if not ip.startswith('10.'):
                kept_ips.append(ip)
        
        # 将新 IP 添加到列表最前面
        kept_ips.insert(0, new_ip)
        
        # 构建新的 hosts 块
        # 保持缩进格式
        new_hosts_content = ""
        for ip in kept_ips:
            new_hosts_content += f"\n    '{ip}',"
        new_hosts_content += "\n"
        
        # 替换整个 ALLOWED_HOSTS 块
        new_full_block = f"{prefix}{new_hosts_content}{suffix}"
        updated_content = content.replace(match.group(0), new_full_block)
        
        # 写回文件
        with open(backend_file, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        print(f"✅ 后端配置已更新: {backend_file}")
        print(f"   ALLOWED_HOSTS 已更新，当前 IP: {new_ip}")
        return True
        
    except Exception as e:
        print(f"❌ 更新后端配置失败: {e}")
        return False

def main():
    """
    主函数
    """
    print("🔄 IP地址自动更新脚本 (Windows版)")
    print("=" * 50)
    
    # 获取当前IP地址
    print("📡 正在获取当前IP地址...")
    current_ip = get_current_ip()
    
    if not current_ip:
        print("❌ 无法获取IP地址，脚本退出")
        return False
    
    print(f"✅ 当前选中IP地址: {current_ip}")
    print()
    
    # 更新前端配置
    print("🔧 正在更新前端配置...")
    frontend_success = update_frontend_config(current_ip)
    print()
    
    # 更新后端配置
    print("🔧 正在更新后端配置...")
    backend_success = update_backend_config(current_ip)
    print()
    
    # 总结
    print("=" * 50)
    if frontend_success and backend_success:
        print("💡 提示:")
        print("请在一个新的终端窗口中运行后端服务:")
        print("cd backend_checkout")
        print(f"python manage.py runserver 0.0.0.0:8200")
        return True
    else:
        print("⚠️  部分配置更新失败，请检查错误信息")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
