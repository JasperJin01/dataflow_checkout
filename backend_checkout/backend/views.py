from django.http import HttpResponse, StreamingHttpResponse, JsonResponse, HttpResponseNotFound
import subprocess
import json
import re
import ast
import os
import time
import random
from pathlib import Path
from .ssh_pool import SSHConnectionPool

# 全局控制开关：
# 'run': 强制所有任务真实执行 # TODO ？
# 'log': 强制所有任务模拟执行
# 'config': 使用 SIMULATION_CONFIG 进行细粒度控制
SIMULATION_MODE = 'config'

# 细粒度模拟配置 (当 SIMULATION_MODE = 'config' 时生效)
# 格式: 'PLATFORM_ALGORITHM': 'run'/'log'
# 'run': 真实执行 (SSH连接服务器)
# 'log': 模拟执行 (读取本地日志文件)
# PLATFORM: 'CPU', 'FPGA', 'CPU-FPGA', 'CPU-DSA', 'CPU-GPU'
# ALGORITHM: 'PR', 'ViT'
SIMULATION_CONFIG = {
    'CPU_PR': 'run',
    'CPU_ViT': 'run',

    'GPU_PR': 'log',
    'GPU_ViT': 'log',

    'FPGA_PR': 'run',
    'FPGA_ViT': 'run',

    'CPU-FPGA_PR': 'run',
    'CPU-FPGA_ViT': 'run',

    'CPU-DSA_PR': 'run',
    'CPU-DSA_ViT': 'run',

    'CPU-GPU_PR': 'log',
    'CPU-GPU_ViT': 'log',
}

# SSH 连接密钥
# 自动获取当前用户主目录，兼容 Windows/Linux/macOS
SSH_KEY_ROOT = Path.home()

KEY_PATH = str(SSH_KEY_ROOT / '.ssh' / 'id_rsa_hust_server')
WQ_KEY_PATH = str(SSH_KEY_ROOT / '.ssh' / 'id_rsa_wq')
QCH_KEY_PATH = str(SSH_KEY_ROOT / '.ssh' / 'id_rsa_qch')


# --- 不同的服务器连接池 ---
# 负责电力应用
lab84qch = SSHConnectionPool(
    hostname='192.168.165.231',
    username='qch',
    key_filename=QCH_KEY_PATH,
    port=22222,
    max_connections=5
)

# 负责自动驾驶应用
node8wq = SSHConnectionPool(
    hostname='222.20.94.68', # NOTE ping不通
    port=50008,
    username='wangqie',
    key_filename=WQ_KEY_PATH,
    max_connections=5
)

# CPU服务器
work1 = SSHConnectionPool(
    hostname='222.20.95.34', # NOTE ping不通
    username='jinjm',
    key_filename=KEY_PATH,
    port=50017,
    max_connections=5
)

# FPGA服务器
pool86 = SSHConnectionPool(
    hostname='192.168.165.232',
    username='jinjm',
    key_filename=KEY_PATH,
    port=22222,
    max_connections=5
)

# TODO GPU服务器（云服务）

# 升腾服务器
# TargetMachine3 SSH连接池 (通过JumpMachine1跳转)
target_machine3 = SSHConnectionPool(
    hostname='11.11.10.30',
    username='root',
    key_filename=KEY_PATH,
    port=22,
    max_connections=5,
    jump_hostname='222.20.98.151',
    jump_username='user',
    jump_port=22
)


def execute_ssh_command(pool, command):
    """使用连接池执行SSH命令"""
    client = None
    try:
        client = pool.get_connection()
        stdin, stdout, stderr = client.exec_command(command)
        return stdout.read().decode(), stderr.read().decode()
    finally:
        if client:
            pool.return_connection(client)

def stream_ssh_command(pool, command, slp=True):
    """使用连接池执行SSH命令并返回生成器"""
    client = None
    try:
        client = pool.get_connection()
        stdin, stdout, stderr = client.exec_command(command)
        
        # 设置非阻塞模式
        stdout.channel.settimeout(0.001)
        stderr.channel.settimeout(0.001)
        
        stdout_buf = ""
        stderr_buf = ""
        
        while True:
            # 检查命令是否已完成
            if stdout.channel.exit_status_ready():
                # 命令已完成，读取剩余的所有输出
                remaining_stdout = stdout.read().decode('utf-8', errors='ignore')
                remaining_stderr = stderr.read().decode('utf-8', errors='ignore')
                
                # 合并剩余的 buffer
                final_stdout = stdout_buf + remaining_stdout
                final_stderr = stderr_buf + remaining_stderr
                
                # 输出剩余的stdout内容
                if final_stdout:
                    # 处理 \r 为 \n
                    final_stdout = final_stdout.replace('\r', '\n')
                    for line in final_stdout.split('\n'):
                        if line.strip():
                            print(f'[ssh] 剩余stdout: {line}')
                            yield f"data: {line}\n\n"
                
                # 输出剩余的stderr内容
                if final_stderr:
                    final_stderr = final_stderr.replace('\r', '\n')
                    for line in final_stderr.split('\n'):
                        if line.strip():
                            print(f'[ssh] 剩余stderr: {line}')
                            yield f"data: {line}\n\n"
                
                break
            
            # 标记是否有数据读取
            data_read = False
            
            # 读取stdout
            if stdout.channel.recv_ready():
                try:
                    chunk = stdout.channel.recv(4096).decode('utf-8', errors='ignore')
                    if chunk:
                        data_read = True
                        stdout_buf += chunk
                        # 处理 \r 为 \n，解决进度条不刷新问题
                        stdout_buf = stdout_buf.replace('\r', '\n')
                        
                        if '\n' in stdout_buf:
                            lines = stdout_buf.split('\n')
                            # 输出完整的行
                            for line in lines[:-1]:
                                print(f'[ssh] stdout: {line.rstrip()}')
                                yield f"data: {line.rstrip()}\n\n"
                            # 保留未完成的部分
                            stdout_buf = lines[-1]
                except Exception:
                    pass
            
            # 读取stderr
            if stderr.channel.recv_ready():
                try:
                    chunk = stderr.channel.recv(4096).decode('utf-8', errors='ignore')
                    if chunk:
                        data_read = True
                        stderr_buf += chunk
                        stderr_buf = stderr_buf.replace('\r', '\n')
                        
                        if '\n' in stderr_buf:
                            lines = stderr_buf.split('\n')
                            for line in lines[:-1]:
                                print(f'[ssh] stderr: {line.rstrip()}')
                                yield f"data: {line.rstrip()}\n\n"
                            stderr_buf = lines[-1]
                except Exception:
                    pass
            
            # 如果没有新输出，根据slp参数决定是否等待
            if not data_read:
                if slp:
                    time.sleep(0.05)
        
        # 获取退出状态
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            print(f'[ssh] 命令退出状态: {exit_status}')
            yield f"data: [exit_status] {exit_status}\n\n"
        
        yield "data: [done]\n\n"
    except Exception as e:
        print(f'[ssh] 异常: {str(e)}')
        yield f"data: {str(e)}\n\n"
    finally:
        if client:
            pool.return_connection(client)





def stream_simulated_log(filename):
    """通用模拟日志流生成器"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    log_file_path = os.path.join(current_dir, 'logfile', f"{filename}.log")
    
    try:
        if not os.path.exists(log_file_path):
             yield f"data: [error] Simulation log file not found: {log_file_path}\n\n"
             return

        with open(log_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                # 1. 处理延时指令
                if line.startswith('#SLEEP:'):
                    try:
                        seconds = float(line.split(':')[1])
                        time.sleep(seconds)
                    except ValueError:
                        pass
                    continue
                
                # 2. NOTE 处理性能随机化 (通用匹配)
                # 匹配 Throughput, GTEPS, GFLOPS 等常见指标
                if 'Throughput:' in line:
                    random_factor = random.uniform(0.95, 1.05)
                    line = re.sub(r'(Throughput:\s*)([\d.]+)', lambda m: f"{m.group(1)}{float(m.group(2)) * random_factor:.2f}", line)
                elif 'GTEPS:' in line:
                    random_factor = random.uniform(0.95, 1.05)
                    line = re.sub(r'(GTEPS:\s*)([\d.]+)', lambda m: f"{m.group(1)}{float(m.group(2)) * random_factor:.4f}", line)
                elif 'GFLOPS:' in line: # 可能需要根据具体日志调整正则
                    random_factor = random.uniform(0.95, 1.05)
                    line = re.sub(r'(GFLOPS:\s*)([\d.]+)', lambda m: f"{m.group(1)}{float(m.group(2)) * random_factor:.2f}", line)

                
                # 3. 发送日志
                yield f"data: {line}\n\n"
        
        yield "data: [done]\n\n"
        
    except Exception as e:
        print(f'[stream_simulated_log] Error: {str(e)}')
        yield f"data: [error] Simulation error: {str(e)}\n\n"


def should_simulate(platform, algorithm):
    """判断是否应该进行模拟 (True: 模拟, False: 真实执行)"""
    if SIMULATION_MODE == 'log':
        return True
    elif SIMULATION_MODE == 'run':
        return False
    
    # config 模式
    # 归一化算法名: pr/pagerank -> PR, 其他 -> ViT
    norm_algo = 'PR' if algorithm.lower() in ['pr', 'pagerank'] else 'ViT'
    
    # 归一化平台名: 转为大写，确保与 SIMULATION_CONFIG 匹配
    # 前端传来的 platform 可能是 'CPU', 'FPGA', 'CPU-FPGA', 'CPU-DSA', 'GPU', 'CPU-GPU'
    norm_platform = platform.upper()
    
    config_key = f"{norm_platform}_{norm_algo}"
    
    # 获取配置，默认为 'run' (真实执行)
    mode = SIMULATION_CONFIG.get(config_key, 'run')
    
    return mode == 'log'


def run_single(request, platform, algo, dataset):
    """统一的单机执行API"""
    print(f'[run_single] 请求平台：{platform}, 算法：{algo}, 数据集：{dataset}')
    
    # 检查是否需要模拟
    if should_simulate(platform, algo):
        print(f'[run_single] 进入模拟模式: {platform} {algo}')
        # 构建模拟日志文件名规则:
        # 单机模式 (run_single)
        # 路径: logfile/single/
        # 格式: {algo}_{platform}_{dataset}.log
        # 示例: pr_cpu_rmat18.log, vit_fpga_imagenet.log
        
        # 1. 处理算法名: PageRank -> pr, ViT -> vit
        algo_map = {
            'PageRank': 'pr',
            'PR': 'pr',
            'ViT': 'vit'
        }
        safe_algo = algo_map.get(algo, algo.lower())
        
        # 2. 处理平台名: CPU -> cpu, FPGA -> fpga, GPU -> gpu
        safe_platform = platform.lower()
        
        # 3. 处理数据集名
        # PageRank: Rmat-18 -> rmat18
        # ViT: ImageNet -> imagenet, DriveSeg -> driveseg
        safe_dataset = dataset.lower().replace('-', '')
        
        log_filename = f"single/{safe_algo}_{safe_platform}_{safe_dataset}"
        print(f'[run_single] 模拟日志路径: {log_filename}')
        
        response = StreamingHttpResponse(
            stream_simulated_log(log_filename),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        return response

    try:
        
        if platform.lower() == 'fpga' and algo.lower() == 'pr':
            # FPGA PageRank执行逻辑
            dataset_mapping = {
                'rmat18': 'scale18',
                'rmat19': 'scale19', 
                'rmat20': 'scale20',
                'rmat-18': 'scale18',
                'rmat-19': 'scale19', 
                'rmat-20': 'scale20'
            }
            
            if dataset.lower() not in dataset_mapping:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的数据集: {dataset}"},
                    status=400
                )
            
            scale_param = dataset_mapping[dataset.lower()]
            
            # FPGA初始化和执行命令
            commands = [
                'source /tools/Xilinx/Vitis/2023.2/settings64.sh',
                'source /opt/xilinx/xrt/setup.sh',
                'cd /space2/qch-data/now_version',
                f'./pagerank_single_kernel 110Mhz_28suram.xclbin {scale_param}'
            ]
            print(commands)
            
            cmd = ' && '.join(commands)
            print(f'[run_single] FPGA PageRank执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(pool86, cmd),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response

        elif platform.lower() == 'cpu' and algo.lower() == 'pr':
            # CPU PageRank执行逻辑
            dataset_mapping = {
                'rmat18': 'Rmat-18',
                'rmat19': 'Rmat-19', 
                'rmat20': 'Rmat-20',
                'rmat-18': 'Rmat-18',
                'rmat-19': 'Rmat-19', 
                'rmat-20': 'Rmat-20'
            }

            if dataset.lower() not in dataset_mapping:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的数据集: {dataset}"},
                    status=400
                )

            dataset_param = dataset_mapping[dataset.lower()]
            
            # 构建命令序列
            commands = [
                'cd /home/jinjm/dev/pagerank',
                'source ~/anaconda3/etc/profile.d/conda.sh', 
                'conda activate pt38',
                f'python -u pr_dataflow.py {dataset_param}'
            ]
            
            cmd = ' && '.join(commands)
            print(f'[run_single] CPU PageRank执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(work1, cmd),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response

        elif platform.lower() == 'fpga' and algo.lower() == 'vit':
            # FPGA ViT执行逻辑
            # 数据集映射：前端的DriveSeg/ImageNet对应命令中的driveseg/imagenet
            dataset_mapping = {
                'DriveSeg': 'driveseg',
                'ImageNet': 'imagenet',
                'driveseg': 'driveseg',
                'imagenet': 'imagenet'
            }
            
            if dataset not in dataset_mapping:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的数据集: {dataset}"},
                    status=400
                )
            
            dataset_param = dataset_mapping[dataset]
            
            # 构建命令序列
            commands = [
                'source /tools/Xilinx/Vitis/2023.2/settings64.sh',
                'source /opt/xilinx/xrt/setup.sh',
                'cd /home/jinjm/Documents/ViT-Accelerator/host/build/',
                f'./bin/vit -d {dataset_param} --device 1'
            ]
            
            cmd = ' && '.join(commands)
            print(f'[run_single] FPGA ViT执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(pool86, cmd),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response

        elif platform.lower() == 'cpu' and algo.lower() == 'vit':
            # CPU ViT执行逻辑
            dataset_mapping = {
                'DriveSeg': 'driveseg',
                'ImageNet': 'imagenet',
                'driveseg': 'driveseg',
                'imagenet': 'imagenet'
            }
            
            if dataset not in dataset_mapping:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的数据集: {dataset}"},
                    status=400
                )
            
            dataset_param = dataset_mapping[dataset]
            
            # 构建命令序列
            if dataset_param == 'imagenet':
                commands = [
                    'cd /home/jinjm/xxr/vit-cpu/dataflow',
                    '/home/jinjm/anaconda3/envs/dataflow/bin/python -u train.py'
                ]
            else: # driveseg
                commands = [
                    'cd /home/jinjm/xxr/vit-cpu/dataflow',
                    '/home/jinjm/anaconda3/envs/dataflow/bin/python -u train1.py'
                ]
            
            cmd = ' && '.join(commands)
            print(f'[run_single] CPU ViT执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(work1, cmd),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response
            
        else:
            # 其他平台的执行逻辑可以在这里添加
            return JsonResponse(
                {"status": 400, "error": f"不支持的平台/算法组合: {platform}/{algo}"},
                status=400
            )
            
    except Exception as e:
        print(f'[run_single] 错误: {str(e)}')
        return JsonResponse(
            {"status": 500, "error": str(e)},
            status=500
        )



def run_distributed(request):
    """分布式执行API"""
    platform = request.GET.get('platform')
    card_count = request.GET.get('card_count')
    algorithm = request.GET.get('algorithm')
    dataset = request.GET.get('dataset')
    
    print(f'[run_distributed] 请求参数：平台={platform}, 卡数={card_count}, 算法={algorithm}, 数据集={dataset}')
    
    # 检查是否需要模拟
    norm_algo = 'PR' if algorithm.lower() in ['pr', 'pagerank'] else 'ViT'
    if should_simulate(platform, norm_algo):
        print(f'[run_distributed] 进入模拟模式: {platform} {algorithm}')
        # 构建模拟日志文件名规则
        # 分布式模式 (run_distributed)
        # 路径: logfile/distrib/
        # 格式: {algo}_{platform}_{cards}_{dataset}.log
        # 示例: pr_dsa_4_rmat18.log, vit_gpu_8_imagenet.log
        
        # 1. 处理算法名: PageRank -> pr, ViT -> vit
        algo_map = {
            'PageRank': 'pr',
            'PR': 'pr',
            'ViT': 'vit'
        }
        safe_algo = algo_map.get(algorithm, algorithm.lower())
        
        # 2. 处理平台名: CPU-DSA -> dsa, CPU-FPGA -> fpga, CPU-GPU -> gpu
        platform_map = {
            'CPU-DSA': 'dsa',
            'CPU-FPGA': 'fpga',
            'CPU-GPU': 'gpu',
            'DSA': 'dsa',
            'FPGA': 'fpga',
            'GPU': 'gpu'
        }
        safe_platform = platform_map.get(platform, platform.lower())
        
        # 3. 处理数据集名
        safe_dataset = dataset.lower().replace('-', '')
        
        # 4. 卡数
        safe_cards = str(card_count)
        
        log_filename = f"distrib/{safe_algo}_{safe_platform}_{safe_cards}_{safe_dataset}"
        print(f'[run_distributed] 模拟日志路径: {log_filename}')
        
        response = StreamingHttpResponse(
            stream_simulated_log(log_filename),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        return response

    try:
        # 检查是否为FPGA PageRank
        if platform == 'CPU-FPGA' and algorithm == 'PageRank':
            # 数据集映射：前端的Rmat-16/18/20对应后端的scale18/20/22
            dataset_mapping = {
                'Rmat-18': 'scale18',
                'Rmat-19': 'scale19', 
                'Rmat-20': 'scale20'
            }
            
            if dataset not in dataset_mapping:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的数据集: {dataset}"},
                    status=400
                )
            
            scale_param = dataset_mapping[dataset]
            
            # 根据卡数选择不同的执行命令
            if card_count == '4':
                # FPGA 4卡分布式执行命令
                commands = [
                    'source /tools/Xilinx/Vitis/2023.2/settings64.sh',
                    'source /opt/xilinx/xrt/setup.sh',
                    'cd /space2/qch-data/now_version',
                    f'./pagerank_4_kernel 110Mhz_28suram.xclbin {scale_param}'
                ]
                print(f'[run_distributed] FPGA 4卡 PageRank执行命令')
            elif card_count == '1':
                # FPGA 1卡执行命令
                commands = [
                    'source /tools/Xilinx/Vitis/2023.2/settings64.sh',
                    'source /opt/xilinx/xrt/setup.sh',
                    'cd /space2/qch-data/now_version',
                    f'./pagerank_single_kerel 110Mhz_28suram.xclbin {scale_param}'
                ]
                print(f'[run_distributed] FPGA 1卡 PageRank执行命令')
            else:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的卡数配置: {card_count}卡"},
                    status=400
                )
            
            cmd = ' && '.join(commands)
            print(f'[run_distributed] 执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(pool86, cmd),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response
        
        # 检查是否为CPU-DSA PageRank
        elif platform == 'CPU-DSA' and algorithm == 'PageRank':
            # 数据集映射：前端的Rmat-16/18/20对应后端的rmat-16/18/20
            dataset_mapping = {
                'Rmat-18': 'rmat-18',
                'Rmat-19': 'rmat-19', 
                'Rmat-20': 'rmat-20'
            }
            
            if dataset not in dataset_mapping:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的数据集: {dataset}"},
                    status=400
                )
            
            graph_name = dataset_mapping[dataset]
            
            # CPU-DSA分布式执行命令
            commands = [
                'cd /root/tmp/pagerank/PageRank_v_3_0',
                'source /root/.bashrc',
                'source /usr/local/Ascend/ascend-toolkit/set_env.sh',
                'source /root/miniconda3/etc/profile.d/conda.sh',
                'conda activate pytorch231',
                f'./restart.sh -g {graph_name} -c {card_count}'
            ]
            print(f'[run_distributed] CPU-DSA {card_count}卡 PageRank执行命令')
            
            cmd = ' && '.join(commands)
            print(f'[run_distributed] 执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(target_machine3, cmd, slp=False),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response

        # 检查是否为CPU-FPGA ViT
        elif platform == 'CPU-FPGA' and algorithm == 'ViT':
            # 数据集映射：前端的ImageNet/DriveSeg对应后端的imagenet/driveseg
            dataset_mapping = {
                'ImageNet': 'imagenet',
                'DriveSeg': 'driveseg'
            }
            
            if dataset not in dataset_mapping:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的数据集: {dataset}"},
                    status=400
                )
            
            dataset_param = dataset_mapping[dataset]
            
            # CPU-FPGA ViT执行命令
            commands = [
                'source /tools/Xilinx/Vitis/2023.2/settings64.sh',
                'source /opt/xilinx/xrt/setup.sh',
                'cd /home/jinjm/Documents/ViT-Accelerator',
                f'python -u parallel.py -d {dataset_param}'
            ]
            print(f'[run_distributed] CPU-FPGA ViT执行命令')
            
            cmd = ' && '.join(commands)
            print(f'[run_distributed] 执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(pool86, cmd, slp=False),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response

        # 检查是否为CPU-DSA ViT
        elif platform == 'CPU-DSA' and algorithm == 'ViT':
            # 确定工作目录
            if dataset == 'ImageNet':
                work_dir = '/root/tmp/vit/VIT/VIT_for_Dataflow'
            elif dataset == 'DriveSeg':
                work_dir = '/root/tmp/vit/VIT/VIT_Drive_Dataflow/'
            else:
                 return JsonResponse(
                    {"status": 400, "error": f"CPU-DSA ViT暂不支持数据集: {dataset}"},
                    status=400
                )

            config_file = 'configs/vit_b16_224_ascend.yaml'
            
            # 根据卡数选择不同的执行命令
            if str(card_count) == '1':
                cmd_exec = f'python -u train.py --config {config_file} --distribute False'
            elif str(card_count) == '2':
                cmd_exec = f'msrun --bind_core=True --worker_num 2 --local_worker_num=2 python -u train2.py --config {config_file}'
            elif str(card_count) == '4':
                cmd_exec = f'msrun --bind_core=True --worker_num 4 --local_worker_num=4 python -u train4.py --config {config_file}'
            elif str(card_count) == '8':
                cmd_exec = f'msrun --bind_core=True --worker_num 8 python -u train8.py --config {config_file}'
            else:
                return JsonResponse(
                    {"status": 400, "error": f"CPU-DSA ViT不支持卡数: {card_count}"},
                    status=400
                )

            # CPU-DSA ViT执行命令
            commands = [
                'source /usr/local/Ascend/ascend-toolkit/set_env.sh',
                'source /root/miniconda3/etc/profile.d/conda.sh',
                'conda activate mindspore_py39',
                f'cd {work_dir}',
                cmd_exec
            ]
            print(f'[run_distributed] CPU-DSA ViT执行命令: {cmd_exec}')
            
            cmd = ' && '.join(commands)
            print(f'[run_distributed] 执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(target_machine3, cmd, slp=False),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response

        else:
            return JsonResponse(
                {"status": 400, "error": f"不支持的分布式配置: {platform}/{card_count}卡/{algorithm}"},
                status=400
            )
            
    except Exception as e:
        print(f'[run_distributed] 错误: {str(e)}')
        return JsonResponse(
            {"status": 500, "error": str(e)},
            status=500
        )


# 电力的两个应用
def stream_power_trend(request, dataset):
    """电力应用 - 潮流计算 (Power Application - Power Flow Calculation)"""
    print(f"[stream_power_trend] 收到请求，数据集: {dataset}")
    
    my_command = f'source /tools/Xilinx/Vitis/2023.2/settings64.sh;source /opt/xilinx/xrt/setup.sh;/home/qch/src/pf2 /home/qch/src/pf100MHz.xclbin {dataset} 0.0001'
    print(f"[stream_power_trend] 执行命令: {my_command}")
    
    try:
        response = StreamingHttpResponse(
            stream_ssh_command(lab84qch, my_command, slp=0.1),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        return response
        
    except Exception as e:
        print(f"[stream_power_trend] 响应创建失败: {str(e)}")
        return JsonResponse(
            {"status": 500, "error": str(e)},
            status=500
        )


def stream_power_state_estimation(request, dataset):
    """电力应用 - 状态估计 (Power Application - State Estimation)"""
    print(f"[stream_power_state_estimation] 收到请求，数据集: {dataset}")
    
    # 将hn_前缀改为sc_前缀
    if dataset.startswith('hn_'):
        dataset = dataset.replace('hn_', 'sc_', 1)
    
    # 构建状态估计命令：cd se_src/src && ./se50MHz se50.xclbin sc_20171128_174550 0.0001
    my_command = f'source /tools/Xilinx/Vitis/2023.2/settings64.sh;source /opt/xilinx/xrt/setup.sh;cd /home/qch/se_src/src && ./se50MHz se50.xclbin {dataset} 0.0001'
    print(f"[stream_power_state_estimation] 执行命令: {my_command}")
    
    try:
        response = StreamingHttpResponse(
            stream_ssh_command(lab84qch, my_command, slp=False),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        return response
        
    except Exception as e:
        print(f"[stream_power_state_estimation] 响应创建失败: {str(e)}")
        return JsonResponse(
            {"status": 500, "error": str(e)},
            status=500
        )


def stream_simulated_uniad():
    """模拟 UniAD 日志输出"""
    # 获取当前文件（views.py）的绝对路径目录（backend目录）
    current_dir = os.path.dirname(os.path.abspath(__file__))
    log_file_path = os.path.join(current_dir, 'logfile', 'uniad_simulation.log')
    
    try:
        if not os.path.exists(log_file_path):
             yield f"data: [error] Simulation log file not found: {log_file_path}\n\n"
             return

        with open(log_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                # 1. 处理延时指令
                if line.startswith('#SLEEP:'):
                    try:
                        seconds = float(line.split(':')[1])
                        time.sleep(seconds)
                    except ValueError:
                        pass
                    continue
                
                # 2. 处理性能随机化
                if 'Throughput:' in line:
                    # 提取原始值（虽然我们不需要它，但正则替换需要）
                    # 生成随机吞吐量：在 1.45 到 1.65 之间波动
                    random_throughput = random.uniform(1.45, 1.65)
                    # 替换日志中的数值
                    line = re.sub(r'Throughput: [\d.]+', f'Throughput: {random_throughput:.2f}', line)
                
                # 3. 发送日志
                yield f"data: {line}\n\n"
        
        yield "data: [done]\n\n"
        
    except Exception as e:
        print(f'[stream_simulated_uniad] Error: {str(e)}')
        yield f"data: [error] Simulation error: {str(e)}\n\n"


# 自动驾驶应用
def run_uniad_command(request, idx):
    """执行UniAD命令"""
    print(f'[run_uniad_command] 请求场景：{idx}, 模拟模式：{SIMULATION_MODE}')
    
    if SIMULATION_MODE:
        response = StreamingHttpResponse(
            stream_simulated_uniad(),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        return response

    try:
        # 验证场景索引
        scene_idx = int(idx)
        if scene_idx not in [1, 2, 3, 4]:
            return JsonResponse(
                {"status": 400, "error": f"不支持的场景索引: {idx}，支持的场景: 1, 2, 3, 4"},
                status=400
            )
        
        # 构建命令序列
        commands = [
            'export PATH="/home/wangqie/anaconda3/bin:$PATH"',
            'source /home/wangqie/anaconda3/etc/profile.d/conda.sh',
            'cd /home/wangqie/UniAD',
            'conda activate uniad',
            f'./tools/uniad_dist_eval_{scene_idx}.sh ./projects/configs/stage1_track_map/base_track_map.py /home/wangqie/UniAD/ckpts/uniad_base_e2e.pth 4'
        ]
        
        cmd = ' && '.join(commands)
        print(f'[run_uniad_command] 执行命令: {cmd}')
        
        response = StreamingHttpResponse(
            stream_ssh_command(node8wq, cmd),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        return response
        
    except ValueError:
        return JsonResponse(
            {"status": 400, "error": f"无效的场景索引: {idx}，必须是数字"},
            status=400
        )
    except Exception as e:
        print(f'[run_uniad_command] 错误: {str(e)}')
        return JsonResponse(
            {"status": 500, "error": str(e)},
            status=500
        )
    


def read_log_file(request, filename):
    # 获取当前文件（views.py）的绝对路径目录（backend目录）
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 构建相对路径：backend -> 项目根目录 -> logfile -> 目标文件
    log_file_path = os.path.normpath(os.path.join(current_dir, '..', 'logfile', f"{filename}.log"))
        
    # 检查文件是否存在
    if not os.path.exists(log_file_path):
        return HttpResponseNotFound(f"Log file {filename}.log not found")
    
    # 检查是否为合法文件（防止目录遍历攻击）
    if not os.path.isfile(log_file_path):
        return HttpResponse("Invalid file path", status=400)
    
    try:
        # 读取文件内容
        with open(log_file_path, 'r') as f:
            content = f.read()
        
        # 返回文件内容
        return HttpResponse(content, content_type='text/plain')
    
    except Exception as e:
        # 处理读取错误
        return HttpResponse(f"Error reading file: {str(e)}", status=500)