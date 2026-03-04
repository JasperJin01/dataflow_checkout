from django.http import HttpResponse, StreamingHttpResponse, JsonResponse, HttpResponseNotFound
import subprocess
import json
import re
import ast
import os
import time
from pathlib import Path
from .ssh_pool import SSHConnectionPool

# SSH 连接密钥
# SSH_KEY_ROOT = '/home/jinjm' 
SSH_KEY_ROOT = '/Users/jiminj'

KEY_PATH = f'{SSH_KEY_ROOT}/.ssh/id_rsa_hust_server'
WQ_KEY_PATH = f'{SSH_KEY_ROOT}/.ssh/id_rsa_wq'
QCH_KEY_PATH = f'{SSH_KEY_ROOT}/.ssh/id_rsa_qch'


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
        
        while True:
            # 检查命令是否已完成
            if stdout.channel.exit_status_ready():
                # 命令已完成，读取剩余的所有输出
                remaining_stdout = stdout.read().decode('utf-8', errors='ignore')
                remaining_stderr = stderr.read().decode('utf-8', errors='ignore')
                
                # 输出剩余的stdout内容
                if remaining_stdout:
                    for line in remaining_stdout.splitlines():
                        if line.strip():
                            print(f'[ssh] 剩余stdout: {line}')
                            yield f"data: {line}\n\n"
                
                # 输出剩余的stderr内容
                if remaining_stderr:
                    for line in remaining_stderr.splitlines():
                        if line.strip():
                            print(f'[ssh] 剩余stderr: {line}')
                            yield f"data: [stderr] {line}\n\n"
                
                break
            
            # 初始化变量
            line = None
            error_line = None
            
            # 读取stdout
            try:
                line = stdout.readline()
                if line:
                    print(f'[ssh] stdout: {line.rstrip()}')
                    yield f"data: {line.rstrip()}\n\n"
            except Exception:
                pass
            
            # 读取stderr
            try:
                error_line = stderr.readline()
                if error_line:
                    print(f'[ssh] stderr: {error_line.rstrip()}')
                    yield f"data: [stderr] {error_line.rstrip()}\n\n"
            except Exception:
                pass
            
            # 如果没有新输出，根据slp参数决定是否等待
            if not line and not error_line:
                if slp:
                    time.sleep(0.05)
                # else:
                    # 不设置slp时，使用极短的延迟避免CPU占用过高，但保持实时性
                    # time.sleep(0.001)
        
        # 获取退出状态
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            print(f'[ssh] 命令退出状态: {exit_status}')
            yield f"data: [exit_status] {exit_status}\n\n"
        
        yield "data: [done]\n\n"
    except Exception as e:
        print(f'[ssh] 异常: {str(e)}')
        yield f"data: [error] {str(e)}\n\n"
    finally:
        if client:
            pool.return_connection(client)





def run_single(request, platform, algo, dataset):
    """统一的单机执行API"""
    print(f'[run_single] 请求平台：{platform}, 算法：{algo}, 数据集：{dataset}')
    
    try:
        if platform.lower() == 'dsa' and algo.lower() == 'pr':
            # DSA PageRank执行逻辑
            dataset_mapping = {
                'rmat18': 'rmat-18',
                'rmat19': 'rmat-19', 
                'rmat20': 'rmat-20',
                'rmat-18': 'rmat-18',
                'rmat-19': 'rmat-19', 
                'rmat-20': 'rmat-20'
            }
            
            if dataset.lower() not in dataset_mapping:
                return JsonResponse(
                    {"status": 400, "error": f"不支持的数据集: {dataset}"},
                    status=400
                )
            
            rmat_param = dataset_mapping[dataset.lower()]
            
            # 构建命令序列
            commands = [
                'cd /root/tmp/pagerank/PageRank_v_2_0',
                f'./restart.sh -g {rmat_param}'
            ]
            
            cmd = ' && '.join(commands)
            print(f'[run_single] DSA PageRank执行命令: {cmd}')
            
            response = StreamingHttpResponse(
                stream_ssh_command(target_machine3, cmd),
                content_type='text/event-stream',
            )
            response['Cache-Control'] = 'no-cache'
            return response

        elif platform.lower() == 'fpga' and algo.lower() == 'pr':
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
    
    try:
        # 检查是否为FPGA PageRank
        if platform == 'CPU-FPGA' and algorithm == 'PageRank':
            # 数据集映射：前端的Rmat-16/18/20对应后端的scale18/20/22
            dataset_mapping = {
                'Rmat-16': 'scale18',
                'Rmat-18': 'scale20', 
                'Rmat-20': 'scale22'
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


# 自动驾驶应用
def run_uniad_command(request, idx):
    """执行UniAD命令"""
    print(f'[run_uniad_command] 请求场景：{idx}')
    
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