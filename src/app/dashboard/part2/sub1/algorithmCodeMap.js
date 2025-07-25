export const algorithmCodeMap = {
  'k-Clique': `// CF测试的图点小于1M个，st和ed占用内存小于4MB
// CF时图单元输出SIMD_WIDTH个int数，0: ans(结果有多少个三角形), 1: ans2(一共遍历了多少个三角形), 2: ans3(final performance)
// [0 4MB)              [4MB 12MB)           [12MB  20MB)        [20MB  ---)
// config, rsv          old_v, new_v(结果)    st, ed              edge_id
// [0    4MB)
// config
// config平铺如下：
// [0           4           8           12                             4MB  )
// [v_num       e_num       cpu_iters   0                                   )

// LPDDR上的数据和地址
SMOVI S1, 4194304       // CPU传入的old_v在4MB
SMOVI S2, 8388608       // CPU传入的new_v地址在8MB
SMOVI S3, 12582912      // CPU传入的st地址在12MB
SMOVI S4, 16777216      // CPU传入的ed地址在16MB
SMOVI S5, 20971520      // CPU传入的edge_id地址在20MB

SMOVI S7, 256           // 拉取config到Scalar SPM, 配置空间256bytes
SDMAL2S S0, S0, S7, 0
SDMABARRIER

SLOAD S7, S0, 0         // S7: v_num
SLOAD S8, S0, 4         // S8: e_num
SSLLI S9, S7, 2         // S9: v_num * 4
SSLLI S10, S8, 2        // S10: e_num * 4
SLOAD S12, S0, 8        // S12: cpu iters

SMOVI S11, 0             // SPM上，st地址在0MB
SDMAL2V S11, S3, S9, 0
SMOVI S11, 4194304       // SPM上，ed地址在4MB
SDMAL2V S11, S4, S9, 0
SMOVI S11, 8388608       // SPM上，old_v地址在8MB
SDMAL2V S11, S1, S9, 0
SMOVI S11, 12582912       // SPM上，new_v地址在12MB
SDMAL2V S11, S2, S9, 0
SDMABARRIER

SNOP
QGENID_S Q24, S0, S7, 1
SMOVI S13, 0                // S12循环计数器
SMOVI S4, 100
SBEQ S12, S13, 124
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QFORK Q1, Q2, Q24       // copy src id
QFORK Q3, Q4, Q1        // copy src id
QLOAD Q7, Q3, 0         // load off st
QLOAD Q8, Q4, 4194304   // load off ed
//QLOAD Q18, Q6, 8388608 // load src v

GCFGI C0, 8388608       // old_v
GCFGI C1, 12582912      // new_v, 输出CF统计的结果
QSQMOV Q26, Q2          // 拷贝src_id到图单元
QSQMOV Q27, Q7          // 拷贝off st到图单元
QSQMOV Q28, Q8          // 拷贝off ed到图单元
//QSQMOV Q29, Q0         // 拷贝v_val到图单元, CF 不是用v_val
SNOP
GCFGI C2, 1   	        // 配置PUSH模式(0), PULL模式(1)
GCFGI C3, 0   	        // 配置图单元输出到graph单元的目标数据缓冲区
GCFGI C4, 0   	        // 不需要读取边属性
GCFGI C5, 2   	        // M5级的ALU执行直连操作
GCFGI C6, 2   	        // M6-M8的ALU执行浮点加法操作
GCFG C7, S5      	    // 配置放置边数据的lpddr地址
GCFGI C8, 2097152       // 配置放置边属性数据的lpddr地址, 2*1024*1024, NOT used
GCFGI C9, 0             // log(v_feature)
GCFGI C10, 1            // 使用CF
GRUN                    // 启动图单元的计算
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
WAITQ Q30

SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SMOVI S1, 12582912              // 传出pr的值进行对比，先放到lpddr指定位置
SDMAV2L S2, S11, S9, 0
SDMABARRIER
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
`,
  GCN: `// 要求：
// GCN的规模不能超过限制，N, Feature, Channels均需要小于256K个数据, 而且A, X1, X2的非零元小于1M个
// A需要是稀疏矩阵表示，非零元小于1M个 (Cora, CiteSeer, PubMed满足)
// X1需要是稀疏矩阵表示, 非零元小于2M个(按照nnz占比算，100%时，不太满足, 10%的可满足)
// X2是稠密的(N * Channels < 1M) (Cora, CiteSeer, PubMed满足)
//
// 实现说明:
// lpddr中需要存放3个图和两个权重矩阵，A, X1, X2, 每个图需要放st, ed, edge_id, edge_val 4种数据
// 由于GCN测试的图可能小于2^18个点，因此st,ed占用内存小于1MB，因此可以按这个来组织; edge_id和edge_val均小于4MB
//      [0 4MB)               [4MB - 12MB)    [12MB - 16MB) [16MB - 18MB)      [18MB -          170MB)  [180MB --- 200MB)
//       config, rsv          3组st, ed          W1的值        W2的值           3组edge_id, edge_val      X3(结果)

// 配置信息在[0 4MB)范围内, 每个数据4bytes, 平铺如下
// 地址: [0      4      8       12        16       20       24      28       32       36    ------------------- 256Bytes)
// 含义:  A_row, A_row, X1_row, X1_col,   W1_row,  W1_col,  X2_row, X2_col,  W2_row,  W2_col
// 值:    N      N      N       feature   feature  channel  N       channel  channel  class
// [0MB 1MB) [1MB 2MB) [2MB 3MB) [3MB 4MB)
// config    0         old_v     new_v(最终计算结果)

// LPDDR上的数据和地址
SMOVI S1, 4194304       // A st地址在4MB
SMOVI S2, 5242880       // A ed地址在5MB
SMOVI S3, 6291456       // X1 st地址在6MB
SMOVI S4, 7340032       // X1 ed地址在7MB
SMOVI S5, 8388608       // X2 st地址在8MB
SMOVI S6, 9437184       // X2 ed地址在9MB

// A  e_num: 13264, 按照小于4MB计算
// X1 e_num: 49216
// X2 e_num: 86656
SMOVI S7, 12582912      // W1地址在12MB
SMOVI S8, 16777216      // W2地址在16MB
SMOVI S9, 18874368      // A edge id地址在18MB, 占34MB, 最多容纳8.5 M条边
SMOVI S10, 54525952     // A edge val地址在52MB, 占34MB
SMOVI S11, 90177536     // X1 edge id地址在86MB, 占8MB
SMOVI S12, 98566144     // X1 edge val地址在94MB, 占8MB空间，能容纳2M个边
SMOVI S13, 106954752    // X2 edge id地址在102MB, 占34MB
SMOVI S14, 142606336    // X2 edge val地址在136MB, 占34MB，到170MB

SMOVI S31, 188743680      // 最终结果写到180MB的lpddrr

// 拉取config到Scalar SPM
SMOVI S15, 256          // 配置空间256bytes
SDMAL2S S0, S0, S15, 0

SDMABARRIER

SLOAD S15, S0, 20       // S15: Channels, 循环计上限，第一层计算时等于channel
SLOAD S16, S0, 12       // S16: Feature, W1一列的个数, 第一层计算时等于feature
SLOAD S17, S0, 8        // S17: N, X1的一列数量，存在S_SPM 8的偏移位置, 其值为N

SMOVI S18, 0            // S18: 计算X1W1的循环计数器, 其循环上限是channel
SMOV S19, S7            // S19: W1的地址变量, 每一次AXW过程后，需要跳到下一列, 跳过的地址stride是Feature * sizeof(int)
SMOV S20, S14           // S20: 用作向LPDDR写入ReLU(AXW)一列的结果

SSLLI S21, S17, 2       // S21: N * sizeof(int)
SSLLI S22, S16, 2       // S22: Features * sizeof(int)
SSLLI S23, S15, 2       // S23: Channels * sizeof(int)

SNOP
SNOP
SNOP

// 第一层计算循环体开始
SBEQ S18, S15, 94      // 跳到第一层计算结束, 循环S15 = Channels次
SNOP
SNOP
SNOP
SNOP

// 从lpaddr加载X1的st和ed, W1数据
SDMAL2V S0, S3, S22, 0  // 加载X1 st到0MB的SPM, 数据量S22 = Feature << 2
SDMAL2V S1, S4, S22, 0  // 加载X1 ed到4MB的SPM, S1存放的4MB, 数据量是S22 = Feature << 2
SDMAL2V S5, S19, S22, 0 // 加载W1的每一列到8MB, S5存放的8MB, 数据量S22 = Feature << 2
SDMAL2V S7, S0, S21, 1048576   // 清零new_v, 1MB的地方是0, S7值是12MB, new_v放到12MB, 数据量是X1W1的一列 S21 = N << 2
SDMABARRIER

QGENID_S Q24, S0, S16, 1   // 激活点事W1一列的序号(S16: Feature)

// XW
GCFGI C0, 8388608       // old_v放8MB, PUSH时，内部不会读取这里, 而从外部送入激活点的值
GCFGI C1, 12582912      // new_v放12MB
GCFGI C2, 0             // push模式(0)
GCFGI C3, 0             // 直接输出到new_v，不需要输出到Graph的dst输出队列
GCFGI C4, 1             // 需要读取边属性, 这里代表了X矩阵的元素
GCFGI C5, 3             // M5阶段需要和边属性相乘, PUSH时，邻居拿到激活点的值后，会和边属性做乘法
GCFGI C6, 2             // M6-M8的合并阶段需要进行浮点累加, 多个激活点可能有相同邻居，这些激活点值和边属性的乘积需要加起来
GCFG C7, S11            // X1 edge_id 的LPDDR存放地址
GCFG C8, S12            // X1 edge_val 的LPDDR存放地址
GCFGI C9, 0             // 特征维度（默认是0, 用1会出问题）

QFORK Q1, Q2, Q24       // Q1, Q1激活点
QFORK Q4, Q3, Q1        // Q3, Q4激活点
QFORK Q5, Q6, Q2        // Q5, Q6激活点
QLOAD Q7, Q3, 0         // 0MB处存放st
QLOAD Q8, Q4, 4194304   // 4MB处存放ed
QLOAD Q9, Q6, 8388608   // 8MB处存放old_v

QSQMOV Q26, Q5          // 拷贝激活点到图单元激活点队列
QSQMOV Q27, Q7          // 拷贝st到激活点的st队列
QSQMOV Q28, Q8          // 拷贝ed到激活点的ed队列
QSQMOV Q29, Q9          // 拷贝源顶点的val到图单元

GRUN                    // 启动图单元
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP

WAITQ Q30

// AXW, A(XW)
GCFGI C0, 12582912      // old_v放12MB
GCFGI C1, 16777216      // new_v放16MB
GCFGI C2, 0             // push模式(0)
GCFGI C3, 0             // 直接输出到new_v，不需要输出到Graph的dst输出队列
GCFGI C4, 1             // 需要读取边属性, 这里代表了X矩阵的元素
GCFGI C5, 3             // M5阶段需要和边属性相乘, PUSH时，邻居拿到激活点的值后，会和边属性做乘法
GCFGI C6, 2             // M6-M8的合并阶段需要进行浮点累加, 多个激活点可能有相同邻居，这些激活点值和边属性的乘积需要加起来
GCFG C7, S9             // A edge_id 的LPDDR存放地址
GCFG C8, S10            // A edge_val 的LPDDR存放地址
GCFGI C9, 0             // 特征维度（默认是0, 用1会出问题）

// 从lpaddr加载 A st, ed(这两个在SPM上的位置不变)
SDMAL2V S0, S1, S21, 0  // 加载A st到0MB的SPM, A有N个点, S21: N << 2
SDMAL2V S1, S2, S21, 0  // 加载A ed到4MB的SPM, S1存放的4MB, S21 : N << 2
SDMAL2V S8, S0, S21, 1048576   // 清零new_v(S8=16MB), 1MB的地方是0, 数据量是N << 2
SDMABARRIER

QGENID_S Q24, S0, S17, 1   // X1W1一列有N个数据

QFORK Q1, Q2, Q24       // Q1, Q1激活点
QFORK Q4, Q3, Q1        // Q3, Q4激活点
QFORK Q5, Q6, Q2        // Q5, Q6激活点
QLOAD Q7, Q3, 0         // 0MB处存放st
QLOAD Q8, Q4, 4194304   // 4MB处存放ed
QLOAD Q9, Q6, 12582912  // 12MB处存放old_v

QSQMOV Q26, Q5          // 拷贝激活点到图单元激活点队列
QSQMOV Q27, Q7          // 拷贝st到激活点的st队列
QSQMOV Q28, Q8          // 拷贝ed到激活点的ed队列
QSQMOV Q29, Q9          // 拷贝源顶点的val到图单元

GRUN                    // 启动图单元
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP

WAITQ Q30

// 第一层计算ReLU, AXW输出值在16MB处, ReLU(AXW)输出到0MB处
SDMAL2V S0, S0, S21, 1048576   // 清零ReLU结果写入位置(20MB), 1MB的地方是0, S21 : N<<2
SDMABARRIER
SNOP

QGENID_S Q24, S0, S17, 1    // 遍历AX1W1结果的一列(N个数)
QFORK Q3, Q2, Q24           // Q1, Q1激活点
QLOAD Q5, Q6, Q2, 16777216  // 加载new_v到Q5, Q6, 输出值在16MB处
QFSUB Q7, Q0, Q5            // Q7 = 0.0f - Q5
QFLT Q8, Q9, Q7, Q0         // Q8 = Q7 < 0.0f
QFILTER Q10, Q3, Q8         // 过滤id
QFILTER Q11, Q6, Q9         // 过滤值
QSTORE Q10, Q11, 0          // ReLU结果写入0MB位置, 一列结果

WAITQ Q10

// ReLU(AXW) 的结果写入lpddr
SDMAV2L S20, S0, S21, 0     // 将ReLU(AXW)的一列写入LPDDR， N个 S21: N << 2
SDMABARRIER

SADDI S18, S18, 1

//  更新第一层计算的地址
// S19(W1一列的地址)移动到下一列数据的位置，+ Featuer * sizeof(int)
SADD S19, S19, S22          // S22 : stride = Feature * sizeof(int)

// S20(写入结果的LPDDR地址)，紧密移动， + N * sizeof(int)
SADD S20, S20, S21          // S21: stride = N * sizeof(int)

SJAL S24, -92               // 跳转到第一层计算开始

SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP

// 第二层计算
SLOAD S24, S0, 36           // S24: classes, 循环计上限，第二层计算时等于class
//SMOV S22, S15             // S15: Channels, W2一列的个数, 第2层计算时等于channel

SMOVI S18, 0                // S18: 循环计数器, 其循环上限是class
SMOV S19, S8                // S19: W2的地址变量, 每一次AXW过程后，需要跳到下一列
SMOV S20, S31               // S20: 第二层结果写入的LPDDR地址变量
SSLLI S25, S24, 2           // S25: Class << 2

SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
// 第二层循环体
SBEQ S18, S24, 86           // 跳到第二层结束, 循环Class次
SNOP
SNOP
SNOP
SNOP
SNOP

// 从lpaddr加载X2的st和ed, W2数据
SDMAL2V S0, S5, S23, 0      // 加载X2 st到0MB的SPM, 数据量S23: Channels << 2
SDMAL2V S1, S6, S23, 0      // 加载X2 ed到4MB的SPM, S1存放的4MB, 数据量S23: Channels << 2
SDMAL2V S5, S19, S23, 0     // 加载W2的每一列到8MB, S5存放的8MB, 数据量S23: Channels << 2
SDMAL2V S7, S0, S21, 1048576   // 清零new_v, 1MB的地方是0, S7值是12MB, new_v放到12MB, 数据量S21: N << 2
SDMABARRIER
QGENID_S Q24, S0, S15, 1    // 激活W2的一列，点个数=channel， W2的rows

// X2W2
GCFGI C0, 8388608           // old_v放8MB
GCFGI C1, 12582912          // new_v放12MB
GCFGI C2, 0                 // push模式(0)
GCFGI C3, 0                 // 直接输出到new_v，不需要输出到Graph的dst输出队列
GCFGI C4, 1                 // 需要读取边属性, 这里代表了X矩阵的元素
GCFGI C5, 3                 // M5阶段需要和边属性相乘, PUSH时，邻居拿到激活点的值后，会和边属性做乘法
GCFGI C6, 2                 // M6-M8的合并阶段需要进行浮点累加, 多个激活点可能有相同邻居，这些激活点值和边属性的乘积需要加起来
GCFG C7, S13                // X2 edge_id 的LPDDR存放地址
GCFG C8, S14                // X2 edge_val 的LPDDR存放地址
GCFGI C9, 0                 // 特征维度（默认是0, 用1会出问题）

QFORK Q1, Q2, Q24           // Q1, Q1激活点
QFORK Q4, Q3, Q1            // Q3, Q4激活点
QFORK Q5, Q6, Q2            // Q5, Q6激活点
QLOAD Q7, Q3, 0             // st
QLOAD Q8, Q4, 4194304       // 4MB处存放ed
QLOAD Q9, Q6, 8388608       // 8MB处存放old_v

QSQMOV Q26, Q5              // 拷贝激活点到图单元激活点队列
QSQMOV Q27, Q7              // 拷贝st到激活点的st队列
QSQMOV Q28, Q8              // 拷贝ed到激活点的ed队列
QSQMOV Q29, Q9              // 拷贝源顶点的val到图单元

GRUN                        // 启动图单元
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP

WAITQ Q30

// A(X2W2)
GCFGI C0, 12582912          // old_v放12MB
GCFGI C1, 16777216          // new_v放16MB
GCFGI C2, 0                 // push模式(0)
GCFGI C3, 0                 // 直接输出到new_v，不需要输出到Graph的dst输出队列
GCFGI C4, 1                 // 需要读取边属性, 这里代表了X矩阵的元素
GCFGI C5, 3                 // M5阶段需要和边属性相乘, PUSH时，邻居拿到激活点的值后，会和边属性做乘法
GCFGI C6, 2                 // M6-M8的合并阶段需要进行浮点累加, 多个激活点可能有相同邻居，这些激活点值和边属性的乘积需要加起来
GCFG C7, S9                 // A edge_id 的LPDDR存放地址
GCFG C8, S10                // A edge_val 的LPDDR存放地址
GCFGI C9, 0                 // 特征维度（默认是0, 用1会出问题）

// 从lpaddr加载 A st, ed(这两个在SPM上的位置不变)
SDMAL2V S0, S1, S21, 0      // 加载A st到0MB的SPM, 数据量S21: N << 2
SDMAL2V S1, S2, S21, 0      // 加载A ed到4MB的SPM, S1存放的4MB, 数据量S21: N << 2
SDMAL2V S8, S0, S21, 1048576   // 清零new_v(S8=16MB), 1MB的地方是0, 数据量S21: N << 2
SDMABARRIER

QGENID_S Q24, S0, S17, 1    // 激活X2W2的一列，N个数

QFORK Q1, Q2, Q24           // Q1, Q1激活点
QFORK Q4, Q3, Q1            // Q3, Q4激活点
QFORK Q5, Q6, Q2            // Q5, Q6激活点
QLOAD Q7, Q3, 0             // 0MB处存放st
QLOAD Q8, Q4, 4194304       // 4MB处存放ed
QLOAD Q9, Q6, 12582912      // 12MB处存放old_v

QSQMOV Q26, Q5              // 拷贝激活点到图单元激活点队列
QSQMOV Q27, Q7              // 拷贝st到激活点的st队列
QSQMOV Q28, Q8              // 拷贝ed到激活点的ed队列
QSQMOV Q29, Q9              // 拷贝源顶点的val到图单元

GRUN                        // 启动图单元
SNOP
SNOP
SNOP
SNOP
SNOP

WAITQ Q30

// argmax 计算(暂时给CPU算吧)

SNOP
SNOP
// 最终结果写到180MB的lpddrr(S20指向的地址), 结果在SPM是16MB处
SMOVI S26, 16777216
SDMAV2L S20, S26, S21, 0    // S21 = N << 2, 输出N个数
SDMABARRIER

SADDI S18, S18, 1

// 更新第二层计算的地址
// S19(W2一列的地址)移动到下一列数据的位置，+ Channel * sizeof(int)
SADD S19, S19, S23          // 更新W2下一列的地址, S23: stride = Channel * sizeof(int)

// S20(第二层写入地址)移动到下一列的位置, + N * sizeof(int)
SADD S20, S20, S21          // 更新下一列结果写入LPDDR的位置, S21: stride = N * sizeof(int)

SJAL S28, -83               // 跳转到第二层计算开始的地方
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
`,
  PageRank: `// dela-pr测试的图点小于1M个，st和ed占用内存小于4MB
// [0 4MB)              [4MB 16MB)              [16MB  24MB)        [24MB  ---)
// config, rsv          old_v, new_v(结果), pr   st, ed              edge_id
// [0    4MB)
// config
// config平铺如下：
// [0           4           8           12                             256Byte  )
// [v_num       e_num       cpu_iters   0                                       )

// LPDDR上的数据和地址
SMOVI S1, 4194304       // CPU传入的old_v在4MB
SMOVI S2, 8388608       // CPU传入的new_v地址在8MB
SMOVI S3, 12582912      // CPU传入的pr地址在12MB
SMOVI S4, 16777216      // CPU传入的st地址在16MB
SMOVI S5, 20971520      // CPU传入的ed地址在20MB
SMOVI S6, 25165824      // CPU传入的edge_id地址在24MB

SMOVI S7, 256           // 拉取config到Scalar SPM, 配置空间256bytes
SDMAL2S S0, S0, S7, 0
SDMABARRIER

SLOAD S7, S0, 0         // S7: v_num
SLOAD S8, S0, 4         // S8: e_num
SSLLI S9, S7, 2         // S9: v_num * 4
SSLLI S10, S8, 2        // S10: e_num * 4
SLOAD S12, S0, 8        // S12: cpu iters

SMOVI S11, 0            // st的SPM地址在0MB
SDMAL2V S11, S4, S9, 0
SMOVI S11, 4194304      // ed的SPM地址在4MB
SDMAL2V S11, S5, S9, 0
SMOVI S11, 8388608      // old_v的SPM地址在8MB
SDMAL2V S11, S1, S9, 0
SMOVI S11, 12582912     // new_v的SPM地址在12MB
SDMAL2V S11, S2, S9, 0
SMOVI S11, 16777216     // pr的SPM地址在16MB
SDMAL2V S11, S3, S9, 0
SDMABARRIER

QGENID_S Q24, S0, S7, 1
SMOVI S13, 0            // S13: 循环计数器
SNOP
SBEQ S13, S12, 124      // 达到CPU迭代轮次，退出(条件1：防止一直不结束（V20_24这个图，后面每轮都有少量激活点)
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QFORK Q1, Q2, Q24                   // copy src id
QFORK Q3, Q4, Q1                    // copy src id
QFORK Q5, Q6, Q2                    // copy src id
QLOAD Q7, Q8, Q3, 0                 // load off st
QLOAD Q9, Q10, Q4, 4194304          // load off ed
QSUB Q11, Q12, Q9, Q7               // cal degree
QSLT Q13, Q0, Q11                   // 为0的degree强制+1
QSUBI Q14, Q13, 1
QSLT Q15, Q14, Q0
QADD Q16, Q12, Q15
QI2F Q17, Q16                       // 转换为浮点
QSQMOV Q26, Q5                      // 拷贝src_id到图单元
QSQMOV Q27, Q8                      // 拷贝off st到图单元
QSQMOV Q28, Q10                     // 拷贝off ed到图单元
SANDI S30, S13, 1                   // iter_id % 2
SBEQ S30, S0, 15                    // if 30.s == 0, jump to config 0
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QLOAD Q18, Q6, 12582912             // load src v
GCFGI C0, 12582912
GCFGI C1, 8388608
SJAL S31, 8     	                //跳转到cur_pc + 7的位置
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QLOAD Q18, Q6, 8388608              // load src v

GCFGI C0, 8388608                   // old_v
GCFGI C1, 12582912                  // new_v
QFDIV Q19, Q18, Q17                 // src_v / degree
QFMULI Q20, Q19, 1062836634         // res * damping(0.85)
QSQMOV Q29, Q20
GCFGI C2, 0                         // 配置PUSH模式
GCFGI C3, 0                         // 配置图单元输出到graph单元的目标数据缓冲区
GCFGI C4, 0                         // 不需要读取边属性
GCFGI C5, 2                         // M5级的ALU执行直连操作
GCFGI C6, 2                         // M6-M8的ALU执行浮点加法操作
GCFG C7, S6                         // 配置放置边数据的lpddr地址
GCFGI C8, 2097152                   // 配置放置边属性数据的lpddr地址, 2*1024*1024
GCFGI C9, 0                         // log(v_feature)
GRUN                                // 启动图单元的计算
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
WAITQ Q30
// 产生激活点并更新pr值
QGENID_S Q1, Q2, S0, S7, 1          // S7: v_num
QFORK Q3, Q4, Q1                    // copy src id
QFORK Q5, Q6, Q2                    // copy src id
QFORK Q7, Q8, Q3                    // copy src id
SANDI S30, S13, 1                   // iter_id % 2
SBEQ S30, S0, 14                    // if $30.s == 0 then jump to store old v
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QSTORE Q4, Q0, 12582912             // reset old delta
QLOAD Q9, Q10, Q5, 8388608          // load new delta
SJAL S31, 8     	                //跳转到cur_pc + 6的位置
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QSTORE Q4, Q0, 8388608              // reset old delta
QLOAD Q9, Q10, Q5, 12582912         // load new delta
QLOAD Q11, Q6, 16777216             // load pr
QFABS Q12, Q9                       // fabs(delta)
SBEQ S13, S0, 18                     // if iteration is 0
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QFORK Q13, Q14, Q11                 // copy pr
QFADD Q15, Q13, Q10                 // new_pr = old_pr + new_delta
QSTORE Q7, Q15, 16777216            // store new pr
QFMULI Q16, Q14, 1008981770         // old_pr * 0.01
QFLT Q17, Q16, Q12                  // if (old_pr * 1e-2 < fabs(new_delta))
QFILTER Q24, Q8, Q17                // filter active v id
SJAL S31, 12
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
QFADD Q13, Q11, Q10                 // new_pr = old_pr + new_delta
QFORK Q15, Q14, Q13                 // copy pr
QSTORE Q7, Q14, 16777216            // store new pr
QFMULI Q16, Q15, 1008981770         // new_pr * 0.01
QFLT Q17, Q16, Q12                  // if (new_pr * 1e-2 < fabs(new_delta))
QFILTER Q24, Q8, Q17                // filter active v id
WAITQ Q24
SADDI S13, S13, 1  	                // $3.s = $3.s + 1
Q2SCHCKE S31, Q24
SBEQ S31, S0, -126
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
SMOVI S20, 16777216                  // 传出pr的值进行对比，先放到lpddr指定位置
SDMAV2L S3, S4, S9, 0               // S3: 12MB lpddr pr, S4: 16MB spm pr
SDMABARRIER
SNOP
SNOP
SNOP
SNOP
SNOP
SNOP
`
};
