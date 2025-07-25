export const moduleCodeMap = {
    module1: {
      rtl: `\`timescale 1ns / 1ps

\`include "core.vh"

/*
* 模块名：fetch_top, 取指模块
* 模块功能：维护pc值
* 1. 外部强制更新时：local_pc值设置为front_pc
* 2. 外部强制stall时：pc值停住，且pc_valid置为无效
* 3. 其余情况：local_pc正常自增
* 正常条件测试：
* 1. stall时正常停住
* 2. rst时local_pc正常清0
* 3. front_pc_valid有效时正常写入front_pc
* 异常条件测试：
*/

module fetch_top #(parameter
    PC_WIDTH = \`PC_WIDTH,
    WIDTH = 1
) (
    input                                                                   clk,
    input                                                                   rst_n,
    // 来源于decoder的译码缓冲区满信号
    input                                                                   stall, // 停止取指信号
    // 来自scalar处理器的pc更新
    input [PC_WIDTH - 1 : 0]                                                front_pc, // 待写入的pc值
    input                                                                   front_pc_valid, // pc写入有效性

    output [PC_WIDTH - 1 : 0]                                               pc, // 需取指的pc值
    output                                                                  pc_valid // pc有效性
);

    reg [PC_WIDTH - 1 : 0] local_pc;

    assign pc = local_pc;
    assign pc_valid = rst_n &&!stall;

    always @ (posedge clk) begin
        if (!rst_n) begin
            local_pc <= 0;
        end else begin
            if (front_pc_valid) begin
                local_pc <= front_pc;
            end else begin
                if (!stall) begin
                    local_pc <= local_pc + 1;
                end
            end
        end
    end

endmodule
`,
      simulator: `#include <bits/stdc++.h>
#include "frontend.h"

// #define DEBUG

void fetch_top::Exe (
    int clk,
    int rst_n,
    // 来源于decoder的译码缓冲区满信号
    int stall,
    // 来自scalar处理器的pc更新
    int front_pc,
    int front_pc_valid,
    int front_dma_inst_valid,

    int *done,
    int *pc,
    int *pc_valid
) {
    // output
    if (!rst_n) {
        *pc = 0;
        *pc_valid = 0;
    } else {
        *pc = _local_pc;
        *pc_valid = !stall && _local_pc < _max_pc;
    }

    if (!rst_n) {
        _local_pc = 0;
        _max_pc = 0;
    } else {
        if (front_dma_inst_valid) {
            _max_pc++;
        }
        if (front_pc_valid) {
            _local_pc = front_pc;
        } else {
            if (!stall && _local_pc < _max_pc) {
                _local_pc++;
            }
        }
    }

    *done = (_local_pc != 0 && _local_pc == _max_pc) ? 1 : 0;

    #ifdef USE_FETCH_DEBUG
    if (*done) {
        printf("clk: %d, fetch_top give done signal: %d\n", clk, *done);
    }

    if (*pc_valid) {
        printf("clk: %d, fetch_top: send valid pc, pc=%d, max_pc=%d, stall:%d\n", clk, *pc, _max_pc, stall);
    }
    #endif
}

void fetch_top::BackProcess () {}
`
    },
    module2: {
      rtl: `\`timescale 1ns / 1ps

\`include "core.vh"

/*
* 模块名：inst_mem_top, 指令缓存区
* 模块功能：指令的缓存与读取
* 1. 指令缓存：通过dma_*相关信号将指令写入缓冲区中
* 2. 指令读取：根据front_pc和front_pc_valid信号控制指令读取
* 正常条件测试：
* 1. dma_inst_valid有效时，指令正常写入缓冲区对应位置
* 2. front_pc_valid有效时，正常读出对应位置的指令
* 异常条件测试：
*/

module inst_mem_top #(parameter
    VLIW_SI_NUM = \`VLIW_SI_NUM,
    VLIW_VI_NUM = \`VLIW_VI_NUM,
    SINST_WIDTH = \`SINST_WIDTH,
    VINST_WIDTH = \`VINST_WIDTH,
    PC_WIDTH = \`PC_WIDTH,
    TOT_INST_WIDTH = \`TOT_INST_WIDTH,
    ADDR_WIDTH = \`INST_SPM_AWIDTH
) (
    input                                                                   clk,
    input                                                                   rst_n,
    input [PC_WIDTH - 1 : 0]                                                front_pc, // 待取指的pc值
    input                                                                   front_pc_valid, // pc值有效性
    input [ADDR_WIDTH - 1 : 0]                                              dma_inst_addr, // 待更新的缓冲区地址
    input [VLIW_SI_NUM * SINST_WIDTH + VLIW_VI_NUM * VINST_WIDTH - 1 : 0]   dma_inst_data, // 待写入的指令数据
    input                                                                   dma_inst_valid, // 缓冲区写入有效性

    output [VLIW_SI_NUM * SINST_WIDTH + VLIW_VI_NUM * VINST_WIDTH - 1 : 0]  inst, // vliw指令
    output                                                                  inst_valid // vliw指令有效性
);
    reg tmp_valid [0 : 1];

    assign inst_valid = tmp_valid[1];

    always @ (posedge clk) begin
        tmp_valid[0] <= front_pc_valid;
        tmp_valid[1] <= tmp_valid[0];
    end
\`ifndef USE_ASIC_SIM_IP
\`define USE_ASIC_SIM_IP
\`endif

\`ifdef USE_ASIC_SIM_IP
    sram_ip_single #(.ADDR_WIDTH(ADDR_WIDTH), .DATA_WIDTH(TOT_INST_WIDTH))
    SRAM_IP_SINGLE (
        .clka       (clk),
        .ena        (!rst_n),
        .wea        (dma_inst_valid),
        .addra      (dma_inst_addr),
        .dina       (dma_inst_data),
        .clkb       (clk),
        .enb        (!rst_n),
        .addrb      (front_pc[ADDR_WIDTH - 1 : 0]),
        .doutb      (inst)
    );

\`else
    //"Error, Should define USE_ASIC_SIM_IP for function sim, or instance FPGA SRAM IP here";
\`endif

endmodule
`,
      simulator: `#include <bits/stdc++.h>
#include "frontend.h"

 // #define DEBUG

void inst_mem_top::Exe (
    int clk,
    int rst_n,
    int front_pc,
    int front_pc_valid,
    int dma_inst_addr,
    int dma_inst_data[],
    int dma_inst_valid,

    int *inst,
    int *inst_valid
) {

    #ifdef DEBUG
    if (dma_inst_valid) {
        printf("clk: %d, inst_mem_top: get dma instruction, addr=%d, data=(", clk, dma_inst_addr);
        for (int i = 2 * VLIW_SI_NUM + 3 * VLIW_VI_NUM - 1; i > 0; i--) {
            printf("0x%x, ", dma_inst_data[i]);
        }
        printf("0x%x)\n", dma_inst_data[0]);
    }
    if (front_pc_valid) {
        cout << "clk: " << clk << ", inst_mem_top: get valid pc, front_pc=" << front_pc << endl;
    }
    #endif

    if (!rst_n) {
        *inst_valid = 0;
    } else {
        *inst_valid = front_pc_valid;
    }

    _sram.Exe (
        clk,
        rst_n,
        dma_inst_valid,
        dma_inst_addr,
        dma_inst_data,
        clk,
        (rst_n && front_pc_valid),
        front_pc,

        inst
    );

    #ifdef DEBUG
    if (*inst_valid) {
        printf("clk: %d, inst_mem_top: send instruction, inst=(", clk);
        for (int i = 2*VLIW_SI_NUM + 3*VLIW_VI_NUM - 1; i > 0; i--) {
            printf("%d, ", inst[i]);
        }
        printf("%d)\n", inst[0]);
    }
    #endif
}

void inst_mem_top::BackProcess () {
    // no logic
}`
    },
    module3: {
      rtl: `\`timescale 1ns / 1ps
\`include "core.vh"
/*
 * 模块名：vfexp_exer, 向量指数计算模块
 * 模块功能：计算向量x的e^x值
 * 1. 当front_vexer_id_valid有效时，激活该计算单元
 * 2. 模块计算出SIMD_WIDTH个e^front_vexer_rt_data[i]的值
 * 3. 计算结果输出由vexer_rd指示写入的寄存器位置，vexer_rd_data指示输出的值
 * 4. 输入掩码由front_vexer_rt_data_valid指示，输出掩码由vexer_rd_data_valid指示
 * 正常条件测试：
 * 1. front_vexer_id_valid有效时才有输出
 * 2. front_vexer_rt_data_valid中掩码有效时才进行计算输出，掩码无效则不输出
 * 3. vexer_valid有效时才进行有效输出
 * 异常条件测试：
 */

module vfexp_exer #(parameter
    DATA_WIDTH=\`DATA_WIDTH,
    SIMD_WIDTH=\`SIMD_WIDTH,
    REG_ID_WIDTH=\`REG_ID_WIDTH,
    EXP_PIPE_NUM=\`EXP_PIPE_NUM
) (
    input                               clk,
    input                               rst_n,
    input                               front_vexer_id_valid,
    input [SIMD_WIDTH*DATA_WIDTH-1:0]   front_vexer_rt_data,
    input [SIMD_WIDTH-1:0]              front_vexer_rt_data_valid, // mask
    input [REG_ID_WIDTH-1:0]            front_vexer_rd,
    input                               front_vexer_rd_valid,

    output                              vexer_valid,
    output [REG_ID_WIDTH-1:0]           vexer_rd,
    output                              vexer_rd_valid,
    output [SIMD_WIDTH*DATA_WIDTH-1:0]  vexer_rd_data,
    output [SIMD_WIDTH-1:0]             vexer_rd_data_valid
);
    generate
        genvar i;
        for (i = 0; i < SIMD_WIDTH; i = i + 1) begin: exp_single_
            FExp #(
                .DWIDTH(DATA_WIDTH),
                .PIPE_NUM(EXP_PIPE_NUM)
            ) exp_single_inst (
                .clk(clk),
                .rst(!rst_n),
                .i_fx(front_vexer_rt_data[(i+1)*DATA_WIDTH-1: i*DATA_WIDTH]),
                .i_valid(front_vexer_rt_data_valid[i]),
                .o_res(vexer_rd_data[(i+1)*DATA_WIDTH-1: i*DATA_WIDTH]),
                .o_valid(vexer_rd_data_valid[i])
            );
        end
    endgenerate

    delay_pass #(
        .DATA_WIDTH(REG_ID_WIDTH+1+1),
        .DELAY(EXP_PIPE_NUM)
    ) exp_delay (
        .clk(clk),
        .rst_n(rst_n),
        .in({front_vexer_rd, front_vexer_rd_valid, front_vexer_id_valid}),
        .out({vexer_rd, vexer_rd_valid, vexer_valid})
    );

endmodule`,
      simulator: `#include <bits/stdc++.h>
#include "backend.h"

void vfexp_exer::Exe (
    int clk,
    int rst_n,
    int front_vexer_id_valid,
    int front_vexer_rs_data[],
    int front_vexer_rs_data_valid[],
    int front_vexer_rd,
    int front_vexer_rd_valid,

    int *vexer_valid,
    int *vexer_rd,
    int *vexer_rd_valid,
    int *vexer_rd_data,
    int *vexer_rd_data_valid
) {
    for (int i = 0; i < SIMD_WIDTH; i++ ){
        _exp_single_inst[i].Exe(
                clk,
                !rst_n,
                front_vexer_rs_data[i],
                front_vexer_rs_data_valid[i] & front_vexer_id_valid, // @TODO: Amend verilog codes for consistency

                vexer_rd_data[i],
                vexer_rd_data_valid[i]
                );
    }

    int in[] = {front_vexer_rd, front_vexer_rd_valid, front_vexer_id_valid};
    int out[3];
    _exp_delay.Exe (
            clk,
            rst_n,
            in,
            out
    );
    *vexer_rd = out[0];
    *vexer_rd_valid = out[1];
    *vexer_valid = out[2];
}

void vfexp_exer::BackProcess () {
}
`
    },
  };

export const fetch_top_data = `clk rstn stall front_pc front_pc_valid pc pc_valid
clk signal signal data signal data signal
0 1 1 0 1 0 0
1 1 1 0 1 0 0
2 1 1 0 1 0 0
3 1 1 0 1 0 0
4 1 1 0 1 0 0
5 1 1 0 1 0 0
6 1 1 0 1 0 0
7 1 1 0 1 0 0
8 1 1 0 1 0 0
9 1 1 0 1 0 0
10 1 0 0 0 0 1
11 1 0 0 0 1 1
12 1 0 0 0 2 1
13 1 0 0 0 3 1
14 1 0 0 0 4 1
15 1 0 0 0 5 1
16 1 0 0 0 6 1
17 1 0 0 0 7 1
18 1 0 0 0 8 1
19 1 0 0 0 9 1
20 1 0 0 0 10 0`;


export const inst_mem_data = `clk rstn front_pc front_pc_valid dma_inst_addr dma_inst_data dma_inst_valid inst inst_valid
clk signal data signal data data signal data signal
0 1 10 1 10 20 1 10 1
1 1 10 1 10 21 1 20 1
2 1 10 1 10 22 1 21 1
3 1 10 1 10 23 1 22 1
4 1 10 1 10 24 1 23 1
5 1 10 1 10 25 1 24 1
6 1 10 1 10 26 1 25 1
7 1 10 1 10 27 1 26 1
8 1 10 1 10 28 1 27 1
9 1 10 1 10 29 1 28 1
10 1 10 1 10 30 1 29 1
11 1 10 1 10 31 1 30 1
12 1 10 1 10 32 1 31 1
13 1 10 1 10 33 1 32 1
14 1 10 1 10 34 1 33 1
15 1 10 1 10 35 1 34 1
16 1 10 1 10 36 1 35 1
17 1 10 1 10 37 0 36 1
18 1 10 1 10 38 0 36 1
19 1 10 0 10 39 0 X 0
20 1 10 0 10 40 0 X 0`

export const vexer_data = `clk rstn front_vexer_id_valid front_vexer_rt_data front_vexer_rt_data_valid front_vexer_rd front_vexer_rd_valid vexer_valid vexer_rd vexer_rd_valid vexer_rd_data vexer_rd_data_valid
clk signal signal data data data signal signal data signal data signal
0 1 1 1050440738 1 0 1 1 0 1 1068826571 1
1 1 1 1050407184 1 0 1 1 0 1 1068814992 1
2 1 1 1050373630 1 0 1 1 0 1 1068803425 1
3 1 1 1050340076 1 0 1 1 0 1 1068791869 1
4 1 1 1050306522 0 0 1 1 0 0 1068780325 1
5 1 1 1050272968 0 0 1 1 0 0 X 0
6 1 1 1050239414 0 0 1 1 0 0 X 0
7 1 1 1050205860 0 0 1 1 0 0 X 0
8 1 1 1050172306 0 0 1 1 0 0 X 0
9 1 1 1050138752 1 0 1 1 0 0 X 0
10 1 1 1050071644 1 0 1 1 0 0 1068711291 1
11 1 1 1050038090 1 0 1 1 0 0 1068699825 1
12 1 1 1050004536 1 0 1 1 0 1 1068688370 1
13 1 1 1049970982 1 0 1 1 0 1 1068676928 1
14 1 1 1049937428 1 0 1 1 0 1 1068665494 1
15 1 1 1049903874 1 0 1 1 0 1 1068654075 1
16 1 1 1049870320 1 0 1 1 0 1 1068636963 1
17 1 1 1049836766 1 0 1 1 0 1 1068625569 1
18 1 1 1049803212 1 0 1 1 0 1 1068614187 1
19 1 1 1049769658 1 0 1 1 0 1 1068602815 1
20 1 1 1049736104 1 0 1 1 0 1 1068591456 1`
