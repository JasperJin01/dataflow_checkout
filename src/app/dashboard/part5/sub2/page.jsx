'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, LinearProgress, MenuItem, Paper, Select, Typography } from '@mui/material';

import Image from 'next/image'; // 添加Image组件

import ReadOnlyCodeBox from './CodeContainer'; // 确保路径正确
import { formatTabularData, formatTableData } from './result';

const scene = ['金融风控', '电力潮流计算'];
const datasets = {
  金融风控: ['atec_task3_seq'],
  电力潮流计算: ['origin_power_data'],
};

const imageSrcMap = {
  金融风控: '/financial.png',
  电力潮流计算: '/electric.png',
}

let financial_data = {
  dataset: `index	payee_user_id_list	payee_pay_amt_list	payer_user_id_list	payer_pay_amt_list
1	2,,2	1.0,2.0,3.0
2	3,3,4,	1.0,2.0,3.0,4.0
3
-3
4	5			1

5	1,2	1.0,2.0
 	1,2			1.0,2.0
`,
  step1: `index	payee_user_id_list	payee_pay_amt_list	payer_user_id_list	payer_pay_amt_list
1	2,,2	1.0,2.0,3.0
2	3,3,4,	1.0,2.0,3.0,4.0
3
-3
4	5			1
5	1,2	1.0,2.0
	1,2			1.0,2.0
`,
  step2: `index	payee_user_id_list	payee_pay_amt_list	payer_user_id_list	payer_pay_amt_list
1	2,,2	1.0,2.0,3.0
2	3,3,4,	1.0,2.0,3.0,4.0
3
4	5			1
5	1,2	1.0,2.0
`,
  step3: `index	payee_user_id_list	payee_pay_amt_list
1	2,,2	1.0,2.0,3.0
2	3,3,4,	1.0,2.0,3.0,4.0
3
4	5
5	1,2	1.0,2.0
`,
  step4: `index	payee_user_id_list	payee_pay_amt_list
1	2,,2	1.0,2.0,3.0
2	3,3,4,	1.0,2.0,3.0,4.0
3
4	5
5	1,2	1.0,2.0
`,
  step5: `index	payee_user_id_list	payee_pay_amt_list
1	2	1
1	0	2
1	2	3
2	3	1
2	3	2
2	4	3
2	0	4
3	0	0
4	5	0
5	1	1
5	2	2
`,
  step6: `src	dst	edge_attr
1	0	2
2	0	4
2	4	3
5	1	1
4	5	0
1	2	1
5	2	2
2	3	2
1	2	3
2	3	1
3	0	0
`,
  terminal: `✅ 生成step1_preprocess.csv
✅ 生成step2_row_filter.csv
✅ 生成step3_column_filter.csv
✅ 生成step4_split.csv
✅ 生成step5_fill.csv
✅ 生成step6_edges.csv`,
};

let electric_data = {
  dataset: `		1	2		3	?	4
5		6	7		8	?	9
10	11	NA	12		13	-	14
15		16	17		18	?	19
		1	2		3	?	4
5		6	7		8	?	9
10	11	NA	12		13	-	14
15		16	17		18	?	19
5		6	7		8	?	9
10	11	NA	12		13	-	14
`,
  step1: `		1	2		3		4
5		6	7		8		9
10	11		12		13		14
15		16	17		18		19
		1	2		3		4
5		6	7		8		9
10	11		12		13		14
15		16	17		18		19
5		6	7		8		9
10	11		12		13		14
`,
  step2: `2.5	2.5	1	2	2.5	3	2.5	4
5	7	6	7	7	8	7	9
10	11	12	12	12	13	12	14
15	17	16	17	17	18	17	19
2.5	2.5	1	2	2.5	3	2.5	4
5	7	6	7	7	8	7	9
10	11	12	12	12	13	12	14
15	17	16	17	17	18	17	19
5	7	6	7	7	8	7	9
10	11	12	12	12	13	12	14
`,
  step3: `✅ 已保存：output_1.csv
2.5   2.5   1.0   2.0   2.5   3.0   2.5   4.0
✅ 已保存：output_2.csv
5.0   7.0   6.0   7.0   7.0   8.0   7.0   9.0
10.0  11.0  12.0  12.0  12.0  13.0  12.0  14.0
15.0  17.0  16.0  17.0  17.0  18.0  17.0  19.0
✅ 已保存：output_3.csv
2.5   2.5   1.0   2.0   2.5   3.0   2.5   4.0
5.0   7.0   6.0   7.0   7.0   8.0   7.0   9.0
✅ 已保存：output_4.csv
10.0  11.0  12.0  12.0  12.0  13.0  12.0  14.0
15.0  17.0  16.0  17.0  17.0  18.0  17.0  19.0
5.0   7.0   6.0   7.0   7.0   8.0   7.0   9.0
10.0  11.0  12.0  12.0  12.0  13.0  12.0  14.0
`,
  terminal: `✅ 已保存：output_1.csv（1行数据）
✅ 已保存：output_2.csv（3行数据）
✅ 已保存：output_3.csv（2行数据）
✅ 已保存：output_4.csv（4行数据）`,
};

export default function Page() {
  // 步骤数：金融风控 0~6（共7步），电力潮流计算 0~3（共4步）
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [selectedSecne, setSelectedScene] = useState(scene[0]);
  const [selectedDataset, setSelectedDataset] = useState(datasets[scene[0]][0]);
  const [imageSrc, setImageSrc] = useState(imageSrcMap['金融风控']); // 新增状态存储图片路径


  // 不同场景的最大step
  const maxStep = selectedSecne === '金融风控' ? 6 : 3;

  const handleSceneChange = (event) => {
    setSelectedScene(event.target.value);
    setImageSrc(imageSrcMap[event.target.value])
    setSelectedDataset(datasets[event.target.value][0]);
    setStep(0);
  };

  const runProcess = async () => {
    if (isRunning || step >= maxStep) {
      return;
    }
    setIsRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStep((prevStep) => Math.min(prevStep + 1, maxStep));
    setIsRunning(false);
  };

  useEffect(() => {
    // 处理所有数据步骤
    financial_data = {
      dataset: formatTabularData(financial_data.dataset),
      step1: formatTabularData(financial_data.step1),
      step2: formatTabularData(financial_data.step2),
      step3: formatTabularData(financial_data.step3),
      step4: formatTabularData(financial_data.step4),
      step5: formatTabularData(financial_data.step5),
      step6: formatTabularData(financial_data.step6),
      terminal: financial_data.terminal, // terminal不需要格式化
    };

    electric_data = {
      dataset: formatTableData(electric_data.dataset),
      step1: formatTableData(electric_data.step1),
      step2: formatTableData(electric_data.step2),
      step3: electric_data.step3, // step3不需要格式化
      terminal: electric_data.terminal, // terminal不需要格式化
    };
  }, []);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f6fa' }}>
      {/* 文字说明模块 */}
      <Grid item xs={12} sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: '#f0f4f8',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography
            variant="body1"
            component="div"
            sx={{
              lineHeight: 1.6,
              color: '#2d3436',
              fontSize: '0.95rem',
              '& .red-bold': {
                fontWeight: 600,
                color: '#ff4444',
                display: 'inline',
                padding: '0 2px',
              },
              '& strong': {
                fontWeight: 600,
              },
            }}
          >
            <strong>考核指标</strong>
            <Box component="span" display="block">
              针对图计算场景研发图应用相关辅助工具
            </Box>

            <strong>中期指标：</strong>
            <Box component="span" display="block">
              研发1～3个领域专用的图数据清洗工具
            </Box>

            <strong>中期指标完成情况：</strong>
            <Box component="span" display="block">
              ① 完成面向金融风控场景的图数据自动清洗工具
            </Box>
            <Box component="span" display="block">
              ② 完成面向电力潮流分析场景的图数据自动清洗工具
            </Box>
            <Box component="span" display="block">
              ③ 实现面向金融图数据的仿真生成工具，用于构建基于金融领域的生成图
            </Box>
            <strong>完成时指标：</strong>
            <Box component="span" display="block">
              研发1～3个领域专用的构图工具
            </Box>
            <strong>考核方式：</strong>
            <Box component="span" display="block">
              提供测试大纲并进行第三方评测，运行环境依托主流处理器Intel(R) Xeon(R) Gold 6148 CPU @ 2.40GHz
            </Box>

            <strong>数据集来源：</strong>
            <Box component="span" display="block">
              1.前沿科技探索社区（Adavanced Technology Exploration Community,
              ATEC）提供的农村金融风险预测数据集，采用atec_task3_seq.csv数据集。
            </Box>
            <Box component="span" display="block">
              2.采用南瑞提供的电力领域数据集origin_power_data.csv。
            </Box>
          </Typography>
        </Paper>
      </Grid>

      {/* 运行控制模块单独一行 */}
      <Grid container spacing={3} mb={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '350px' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'second.main',
                borderBottom: '2px solid',
                borderColor: 'second.main',
                pb: 1,
              }}
            >
              运行选项
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 550,
                    fontSize: '16px',
                    mb: 1,
                  }}
                >
                  场景选择
                </Typography>
                <Select
                  fullWidth
                  value={selectedSecne}
                  onChange={(e) => {
                    handleSceneChange(e);
                  }}
                  disabled={isRunning}
                >
                  {scene.map((scene) => (
                    <MenuItem key={scene} value={scene} sx={{ py: 1 }}>
                      <Typography variant="body1" fontWeight="500">
                        {scene}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 550,
                    fontSize: '16px',
                    mb: 1,
                  }}
                >
                  选择数据集
                </Typography>
                <Select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  disabled={isRunning}
                  fullWidth
                >
                  {datasets[selectedSecne].map((dataset) => (
                    <MenuItem key={dataset} value={dataset} sx={{ py: 1 }}>
                      <Typography variant="body1">{dataset}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={runProcess}
                  disabled={isRunning || step == maxStep}
                  sx={{ marginBottom: 2 }}
                >
                  {isRunning ? '运行中...' : step == maxStep ? '运行完成' : '运行'}
                </Button>
              </Grid>
            </Grid>

            {isRunning && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress color="success" />
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              position: 'relative',
              height: '350px'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'second.main',
              }}
            >
              流程展示
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Image src={imageSrc} alt="处理结果示意图" width={500} height={250} />
            </Box>
          </Paper>
        </Grid>

      </Grid>

      {/* 其余示例和展示模块 */}
      {selectedSecne === '金融风控' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  原始数据集
                </Typography>
                {step === 0 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={financial_data.dataset} height={400} />
            </Paper>
          </Grid>

          {/* 预处理后数据集 - 步骤① */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  预处理后数据集展示 步骤①
                </Typography>
                {step === 1 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={step > 0 ? financial_data.step1 : ''} height={400} />
            </Paper>
          </Grid>

          {/* 行过滤后数据集 - 步骤② */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  行过滤后数据集展示 步骤②
                </Typography>
                {step === 2 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={step > 1 ? financial_data.step2 : ''} height={400} />
            </Paper>
          </Grid>

          {/* 列过滤后数据集 - 步骤③ */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  列过滤后数据集展示 步骤③
                </Typography>
                {step === 3 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={step > 2 ? financial_data.step3 : ''} height={400} />
            </Paper>
          </Grid>

          {/* 列分割后数据集 - 步骤④ */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  列分割后数据集展示 步骤④
                </Typography>
                {step === 4 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={step > 3 ? financial_data.step4 : ''} height={400} />
            </Paper>
          </Grid>

          {/* 填充缺失值后数据集 - 步骤⑤ */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  填充缺失值后数据集展示 步骤⑤
                </Typography>
                {step === 5 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={step > 4 ? financial_data.step5 : ''} height={400} />
            </Paper>
          </Grid>

          {/* 去重与边生成后数据集 - 步骤⑥ - 最后一步不需要按钮 */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
                去重与边生成后数据集展示 步骤⑥
              </Typography>
              <ReadOnlyCodeBox content={step > 5 ? financial_data.step6 : ''} height={400} />
            </Paper>
          </Grid>

          {/* Terminal执行结果 - 步骤⑦ - 最后一步不需要按钮 */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
                Terminal执行结果 步骤⑥
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  overflow: 'auto',
                  padding: '16px',
                  borderRadius: '4px',
                  height: '400px',
                  whiteSpace: 'pre',
                }}
              >
                {step > 5 ? financial_data.terminal : ''}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      {selectedSecne === '电力潮流计算' && (
        <Grid container spacing={3}>
          {/* 原始数据集 */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  原始数据集
                </Typography>
                {step === 0 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={electric_data.dataset} height={400} />
            </Paper>
          </Grid>
          {/* 非数值检测与替换 - 步骤① */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  非数值检测与替换 步骤①
                </Typography>
                {step === 1 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={step > 0 ? electric_data.step1 : ''} height={400} />
            </Paper>
          </Grid>
          {/* 缺失值填充 - 步骤② */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  缺失值填充 步骤②
                </Typography>
                {step === 2 && (
                  <Button variant="contained" color="primary" onClick={runProcess} disabled={isRunning} size="small">
                    {isRunning ? '运行中...' : '运行'}
                  </Button>
                )}
              </Grid>
              <ReadOnlyCodeBox content={step > 1 ? electric_data.step2 : ''} height={400} />
            </Paper>
          </Grid>
          {/* 数据拆分 - 步骤③ */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Grid container alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', marginRight: 2 }}>
                  数据拆分 步骤③
                </Typography>
              </Grid>
              <ReadOnlyCodeBox content={step > 2 ? electric_data.step3 : ''} height={400} />
            </Paper>
          </Grid>
          {/* Terminal执行结果 - 步骤④ */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
                Terminal执行结果 步骤③
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  overflow: 'auto',
                  padding: '16px',
                  borderRadius: '4px',
                  height: '400px',
                  whiteSpace: 'pre',
                }}
              >
                {step > 2 ? electric_data.terminal : ''}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
