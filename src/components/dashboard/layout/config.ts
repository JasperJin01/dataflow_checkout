import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  // { key: '理论演示', title: '数据流理论演示', href: paths.dashboard.dataflow_theory, icon: 'code'},
  { key: '课题一', title: '单机环境性能演示', href: paths.dashboard.part1, icon: 'chart-pie' },
  { key: '课题二', title: '异构分布式性能演示', href: paths.dashboard.part2, icon: 'users' },
  { key: '课题三', title: '应用验证演示', href: paths.dashboard.part3, icon: 'plugs-connected',
    subItems: [
      {key: '内容一', title: '电力系统分析', href: paths.dashboard.part3_sub1},
      {key: '内容二', title: '智能驾驶大模型', href: paths.dashboard.part3_sub2},
      // {key: '内容三', title: '动态图数据管理', href: paths.dashboard.part3_sub3},
    ]
  },
] satisfies NavItemConfig[];
