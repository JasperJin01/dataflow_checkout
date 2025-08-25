
1. 安装node.js 16.15.1 版本 和 最新的npm（不是最新的也可以）
2. 执行 npm install（下载安装包）
3. 执行 npm run dev
* 后端接口修改路径：middle_check/src/lib/request/request.js 中，修改 BASE_URL 即可

# 启动（开发模式）
npm run dev

# 编译与启动（生产模式）
npm run build
npm run start


# log的目录：public/log/
# 性能记录：src/app/dashboard/part1和part2的constData.js

```js
export const PERFORMANCE_DATA = {
  'PageRank': {
    'GPU': {
      1: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 36.0,
          'Dataflow-Time(s)': 12.0,
          'Baseline-Throughput': 0.0004, // GTEPS
          'Dataflow-Throughput': 0.0009  // GTEPS
        },
        //...

```
确保日志中的数据（DATAFLOW METHOD）与constData.js中的数据一致