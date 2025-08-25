import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: '理论演示', title: '数据流理论演示', href: paths.dashboard.dataflow_theory, icon: 'code'},
  { key: '课题一', title: '单机环境性能演示', href: paths.dashboard.part1, icon: 'chart-pie' },
  { key: '课题二', title: '异构分布式性能展示', href: paths.dashboard.part2, icon: 'users' },
  { key: '课题三', title: '应用验证', href: paths.dashboard.part3, icon: 'plugs-connected',
    subItems: [
      {key: '内容一', title: '电力系统分析', href: paths.dashboard.part3_sub1},
      {key: '内容二', title: '智能驾驶大模型', href: paths.dashboard.part3_sub2},
      // {key: '内容三', title: '动态图数据管理', href: paths.dashboard.part3_sub3},
    ]
  },
  // { key: '课题四', title: '分布式图计算框架', href: paths.dashboard.part4, icon: 'gear-six',
  //   subItems: [
  //     {key: '内容一', title: '分布式图计算框架验收平台', href: paths.dashboard.part4_sub1},
  //   ]
  // },
  // { key: '课题五', title: '泛图计算典型应用', href: paths.dashboard.part5, icon: 'user',
  //   subItems: [
  //     {key: '内容一', title: '面向不同场景的数据清洗', href: paths.dashboard.part5_sub1},
  //     {key: '内容二', title: '数据清洗中间结果', href: paths.dashboard.part5_sub2},
  //     {key: '内容三', title: '金融应用示例展示', href: paths.dashboard.part5_sub3}
  //   ]
  // },
] satisfies NavItemConfig[];
