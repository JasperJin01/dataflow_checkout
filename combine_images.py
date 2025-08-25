#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片拼接脚本
将public/up/文件夹中的up_xxx.jpg图片与public/down/文件夹中对应的down_xxx.jpg图片进行上下拼接
"""

import os
from PIL import Image
import re

def get_image_numbers(folder_path, prefix):
    """获取文件夹中所有图片的编号"""
    numbers = []
    if not os.path.exists(folder_path):
        print(f"文件夹不存在: {folder_path}")
        return numbers
    
    for filename in os.listdir(folder_path):
        if filename.startswith(prefix) and filename.endswith('.jpg'):
            # 提取编号
            match = re.search(r'(\d+)', filename)
            if match:
                numbers.append(match.group(1))
    
    return sorted(numbers)

def combine_images(up_path, down_path, output_path):
    """将两张图片上下拼接"""
    try:
        # 打开图片
        up_img = Image.open(up_path)
        down_img = Image.open(down_path)
        
        # 获取图片尺寸
        up_width, up_height = up_img.size
        down_width, down_height = down_img.size
        
        # 计算拼接后的尺寸（宽度取最大值，高度相加）
        max_width = max(up_width, down_width)
        total_height = up_height + down_height
        
        # 创建新的图片
        combined_img = Image.new('RGB', (max_width, total_height), (255, 255, 255))
        
        # 将上图贴到顶部（居中）
        up_x = (max_width - up_width) // 2
        combined_img.paste(up_img, (up_x, 0))
        
        # 将下图贴到底部（居中）
        down_x = (max_width - down_width) // 2
        combined_img.paste(down_img, (down_x, up_height))
        
        # 保存拼接后的图片
        combined_img.save(output_path, 'JPEG', quality=95)
        print(f"成功拼接: {output_path}")
        
        # 关闭图片
        up_img.close()
        down_img.close()
        combined_img.close()
        
        return True
    except Exception as e:
        print(f"拼接失败 {up_path} + {down_path}: {str(e)}")
        return False

def main():
    # 设置路径
    up_folder = "public/up"
    down_folder = "public/down"
    output_folder = "public/combined"
    
    # 确保输出文件夹存在
    os.makedirs(output_folder, exist_ok=True)
    
    # 获取up文件夹中的所有图片编号
    up_numbers = get_image_numbers(up_folder, "up_")
    down_numbers = get_image_numbers(down_folder, "down_")
    
    print(f"找到 {len(up_numbers)} 张up图片")
    print(f"找到 {len(down_numbers)} 张down图片")
    
    # 找到共同的编号
    common_numbers = set(up_numbers) & set(down_numbers)
    print(f"找到 {len(common_numbers)} 对匹配的图片")
    
    success_count = 0
    fail_count = 0
    
    # 对每一对图片进行拼接
    for number in sorted(common_numbers):
        up_path = os.path.join(up_folder, f"up_{number}.jpg")
        down_path = os.path.join(down_folder, f"down_{number}.jpg")
        output_path = os.path.join(output_folder, f"combined_{number}.jpg")
        
        if combine_images(up_path, down_path, output_path):
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n拼接完成!")
    print(f"成功: {success_count} 张")
    print(f"失败: {fail_count} 张")
    print(f"输出文件夹: {output_folder}")

if __name__ == "__main__":
    main()