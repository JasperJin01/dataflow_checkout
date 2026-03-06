# -*- coding: utf-8 -*-
from __future__ import print_function
import os
import subprocess
import datetime
import shutil

# ================= 用户配置区域 (User Configuration) =================

# 1. 场景图片存储位置说明
# 所有场景的图片都存储在项目根目录的以下路径：
# public/drive_visual/combined/
# 文件名格式为: combined_XXX.jpg (XXX为3位数字)

# 2. 场景选择配置
# 请根据需要修改 start_index (起始编号) 和 image_count (图片数量)
# 
# 可选场景列表 (参考 src/app/dashboard/part3/sub2/page.jsx):
# - 场景 1: 城市道路 (默认)
#   start_index = 39, image_count = 40 (范围: 039 - 078)
# - 场景 2: 高车流量
#   start_index = 79, image_count = 41 (范围: 079 - 119)
# - 场景 3: 窄路场景
#   start_index = 202, image_count = 40 (范围: 202 - 241)
# - 场景 4: 露天停车场
#   start_index = 242, image_count = 41 (范围: 242 - 282)

SCENE_CONFIG = {
    'start_index': 39,  # 修改此处切换场景
    'image_count': 40
}

# 3. 播放速度配置 (单位: 毫秒)
# 修改这里可以调整视频播放速度
LEFT_INTERVAL_MS = 150   # 左侧视频（融合前）每一帧的停留时间 -> 较慢
RIGHT_INTERVAL_MS = 80   # 右侧视频（融合后）每一帧的停留时间 -> 较快

# 输入图片路径模式
INPUT_IMAGE_PATTERN = "public/drive_visual/combined/combined_%03d.jpg"

# ===================================================================

def run_ffmpeg(command):
    print("Executing: " + command)
    subprocess.call(command, shell=True)

def main():
    # 1. 创建带时间戳的输出文件夹
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = "video_output_" + timestamp
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    print("Created output directory: " + output_dir)

    # 2. 计算帧率
    # FPS = 1000 / interval_ms
    fps_left = 1000.0 / LEFT_INTERVAL_MS
    fps_right = 1000.0 / RIGHT_INTERVAL_MS
    
    print("Left FPS: {:.2f}, Right FPS: {:.2f}".format(fps_left, fps_right))

    # 3. 生成 Left 视频
    left_video = os.path.join(output_dir, "left.mp4")
    cmd_left = 'ffmpeg -y -framerate {} -start_number {} -i "{}" -vframes {} -c:v libx264 -pix_fmt yuv420p "{}"'.format(
        fps_left, SCENE_CONFIG["start_index"], INPUT_IMAGE_PATTERN, SCENE_CONFIG["image_count"], left_video
    )
    run_ffmpeg(cmd_left)

    # 4. 生成 Right 视频
    right_video = os.path.join(output_dir, "right.mp4")
    cmd_right = 'ffmpeg -y -framerate {} -start_number {} -i "{}" -vframes {} -c:v libx264 -pix_fmt yuv420p "{}"'.format(
        fps_right, SCENE_CONFIG["start_index"], INPUT_IMAGE_PATTERN, SCENE_CONFIG["image_count"], right_video
    )
    run_ffmpeg(cmd_right)

    # 5. 计算需要的 Padding 时长
    duration_left = SCENE_CONFIG['image_count'] * (LEFT_INTERVAL_MS / 1000.0)
    duration_right = SCENE_CONFIG['image_count'] * (RIGHT_INTERVAL_MS / 1000.0)
    pad_duration = duration_left - duration_right
    
    print("Duration Left: {:.2f}s, Right: {:.2f}s, Padding needed: {:.2f}s".format(duration_left, duration_right, pad_duration))

    right_padded_video = os.path.join(output_dir, "right_padded.mp4")
    
    if pad_duration > 0:
        # 使用 tpad 滤镜在视频末尾定格最后一帧
        # stop_mode=clone: 克隆最后一帧
        # stop_duration: 持续时间
        cmd_pad = 'ffmpeg -y -i "{}" -vf "tpad=stop_mode=clone:stop_duration={}" -c:v libx264 -pix_fmt yuv420p "{}"'.format(
            right_video, pad_duration, right_padded_video
        )
        run_ffmpeg(cmd_pad)
    else:
        # 如果不需要 padding (或者 right 比 left 慢)，直接复制
        print("No padding needed or Right is slower than Left.")
        shutil.copy(right_video, right_padded_video)

    # 6. 合并视频
    output_video = os.path.join(output_dir, "output.mp4")
    # 使用 filter_complex_script 防止命令行转义问题
    filter_content = "[0:v]pad=iw+20:ih:color=white[left];[left][1:v]hstack=inputs=2"
    filter_file = os.path.join(output_dir, "filter.txt")
    
    with open(filter_file, "w") as f:
        f.write(filter_content)

    cmd_combine = 'ffmpeg -y -i "{}" -i "{}" -filter_complex_script "{}" -c:v libx264 -pix_fmt yuv420p "{}"'.format(
        left_video, right_padded_video, filter_file, output_video
    )
    run_ffmpeg(cmd_combine)

    print("\nSuccess! All files are in: " + output_dir)

if __name__ == "__main__":
    main()
