import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: '课题一', title: '统一图计算加速芯片架构', href: paths.dashboard.part1, icon: 'chart-pie',
    subItems: [
      {key: '内容一', title: '加速器性能展示', href: paths.dashboard.part1_sub1},
    ]},
  { key: '课题二', title: '图计算加速卡', href: paths.dashboard.part2, icon: 'users',
    subItems: [
      {key: '内容一', title: '模拟器数据集运行展示', href: paths.dashboard.part2_sub1},
      {key: '内容二', title: '模拟器基本原理展示', href: paths.dashboard.part2_sub2}
    ]
  },
  { key: '课题三', title: '图计算编程环境', href: paths.dashboard.part3, icon: 'plugs-connected',
    subItems: [
      {key: '内容一', title: '编程模型框架', href: paths.dashboard.part3_sub1},
      {key: '内容二', title: '框架转换', href: paths.dashboard.part3_sub2},
      {key: '内容三', title: '动态图数据管理', href: paths.dashboard.part3_sub3},
    ]
  },
  { key: '课题四', title: '分布式图计算框架', href: paths.dashboard.part4, icon: 'gear-six',
    subItems: [
      {key: '内容一', title: '分布式图计算框架验收平台', href: paths.dashboard.part4_sub1},
    ]
  },
  { key: '课题五', title: '泛图计算典型应用', href: paths.dashboard.part5, icon: 'user',
    subItems: [
      {key: '内容一', title: '面向不同场景的数据清洗', href: paths.dashboard.part5_sub1},
      {key: '内容二', title: '数据清洗中间结果', href: paths.dashboard.part5_sub2},
      {key: '内容三', title: '金融应用示例展示', href: paths.dashboard.part5_sub3}
    ]
  },
] satisfies NavItemConfig[];
