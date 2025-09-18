#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IP地址自动更新脚本
用于更新前端和后端配置文件中的IP地址
"""

import subprocess
import re
import os
from pathlib import Path

def get_current_ip():
    """
    获取当前机器的IP地址（10.x.x.x格式）
    """
    try:
        # 执行ifconfig命令并过滤10.开头的IP
        result = subprocess.run(['ifconfig', '-a'], capture_output=True, text=True)
        output = result.stdout
        
        # 查找10.开头的IP地址
        ip_pattern = r'inet (10\.\d+\.\d+\.\d+)'
        matches = re.findall(ip_pattern, output)
        
        if matches:
            # 返回第一个找到的10.x.x.x IP地址
            return matches[0]
        else:
            print("❌ 未找到10.x.x.x格式的IP地址")
            return None
            
    except Exception as e:
        print(f"❌ 获取IP地址时出错: {e}")
        return None

def update_frontend_config(new_ip):
    """
    更新前端配置文件中的IP地址
    """
    frontend_file = '/Users/jiminj/Desktop/dataflow_checkout/src/lib/request/request.js'
    
    try:
        # 读取文件内容
        with open(frontend_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 替换host配置
        old_pattern = r"host: '[0-9.]+'"
        new_host = f"host: '{new_ip}'"
        
        updated_content = re.sub(old_pattern, new_host, content)
        
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
    更新后端配置文件中的ALLOWED_HOSTS最后一个IP地址
    """
    backend_file = '/Users/jiminj/Desktop/dataflow_checkout/backend_checkout/backend/settings.py'
    
    try:
        # 读取文件内容
        with open(backend_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # 查找ALLOWED_HOSTS配置并更新最后一个IP
        updated_lines = []
        in_allowed_hosts = False
        
        for line in lines:
            if 'ALLOWED_HOSTS = [' in line:
                in_allowed_hosts = True
                updated_lines.append(line)
            elif in_allowed_hosts and ']' in line:
                # 这是ALLOWED_HOSTS的结束行，在前面插入新IP
                # 先移除最后一个IP行（如果存在）
                if updated_lines and "'10." in updated_lines[-1]:
                    updated_lines.pop()  # 移除最后一个IP行
                
                # 添加新的IP行
                updated_lines.append(f"                '{new_ip}',\n")
                updated_lines.append(line)
                in_allowed_hosts = False
            else:
                updated_lines.append(line)
        
        # 写回文件
        with open(backend_file, 'w', encoding='utf-8') as f:
            f.writelines(updated_lines)
        
        print(f"✅ 后端配置已更新: {backend_file}")
        print(f"   ALLOWED_HOSTS最后一个IP已更新为: {new_ip}")
        return True
        
    except Exception as e:
        print(f"❌ 更新后端配置失败: {e}")
        return False

def main():
    """
    主函数
    """
    print("🔄 IP地址自动更新脚本")
    print("=" * 50)
    
    # 获取当前IP地址
    print("📡 正在获取当前IP地址...")
    current_ip = get_current_ip()
    
    if not current_ip:
        print("❌ 无法获取IP地址，脚本退出")
        return False
    
    print(f"✅ 当前IP地址: {current_ip}")
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
        print("🎉 所有配置文件已成功更新！")
        print(f"📍 新IP地址: {current_ip}")
        print()
        print("💡 提示:")
        print("   - 前端需要重新启动开发服务器")
        print("   - 后端需要重新启动Django服务器")
        return True
    else:
        print("⚠️  部分配置更新失败，请检查错误信息")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)