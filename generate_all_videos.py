# -*- coding: utf-8 -*-
from __future__ import print_function
import os
import subprocess
import shutil

# ================= 场景配置 =================
SCENES = [
    {
        "name": "scene_01",
        "start_index": 39,
        "image_count": 40
    },
    {
        "name": "scene_02",
        "start_index": 79,
        "image_count": 41
    },
    {
        "name": "scene_03",
        "start_index": 202,
        "image_count": 40
    },
    {
        "name": "scene_04",
        "start_index": 242,
        "image_count": 41
    }
]

# 统一帧率 (FPS)
# 我们使用 10 FPS 作为基准，这样在前端使用 playbackRate 时：
# 0.67x ~= 6.7 FPS (原 150ms/帧)
# 1.25x ~= 12.5 FPS (原 80ms/帧)
TARGET_FPS = 10

# 输入图片路径模式
INPUT_IMAGE_PATTERN = "public/drive_visual/combined/combined_%03d.jpg"

# 输出目录
OUTPUT_DIR = "public/drive_visual/videos"

def run_ffmpeg(command):
    print("Executing: " + command)
    try:
        subprocess.check_call(command, shell=True)
    except subprocess.CalledProcessError as e:
        print("Error executing command: " + str(e))

def main():
    # 1. 创建输出目录
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print("Created output directory: " + OUTPUT_DIR)
    
    # 2. 遍历生成所有场景视频
    for scene in SCENES:
        scene_name = scene["name"]
        start_index = scene["start_index"]
        image_count = scene["image_count"]
        
        output_file = os.path.join(OUTPUT_DIR, "{}.mp4".format(scene_name))
        
        print("\nProcessing {}...".format(scene_name))
        
        # 使用 ffmpeg 生成视频
        # -framerate: 输入帧率
        # -start_number: 起始图片编号
        # -i: 输入文件模式
        # -vframes: 处理的图片数量
        # -c:v libx264: 使用 H.264 编码
        # -pix_fmt yuv420p: 确保兼容性
        # -y: 覆盖已存在的文件
        cmd = 'ffmpeg -y -framerate {} -start_number {} -i "{}" -vframes {} -c:v libx264 -pix_fmt yuv420p "{}"'.format(
            TARGET_FPS, start_index, INPUT_IMAGE_PATTERN, image_count, output_file
        )
        
        run_ffmpeg(cmd)
        
        if os.path.exists(output_file):
            print("Successfully generated: " + output_file)
        else:
            print("Failed to generate: " + output_file)

    print("\nAll tasks completed!")

if __name__ == "__main__":
    main()
