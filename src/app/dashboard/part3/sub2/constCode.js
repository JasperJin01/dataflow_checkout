

// 各算法对应的示例代码
export const sampleCodes = {
    'bfs': {
      frameworkCode: `@pregel(vd_type="int", md_type="int")
# @pregel(vd_type="unsigned", md_type="unsigned")
class BFS_Pregel(AppAssets):
    @staticmethod
    def Init(v, context):
        v.set_value(MAX_UINT)
    @staticmethod
    def Compute(messages, v, context):
        src_id = context.get_config(b"src")
        v.value = new_parent
        new_parent = MAX_UINT
        if v.id() == src_id:
            new_parent = v.id
        for message in messages:
            # if(new_parent == MAX_UINT):
            #     new_parent = message
            # gather_add
            new_parent = min(new_parent, message)
            # apply
            if v.value < new_parent:
                v.set_value(new_parent)
            for e_label_id in range(context.edge_label_num()):
                edges = v.outgoing_edges(e_label_id)
                for e in edges:
                    # gather_mult
                    v.send(e.vertex(), v.value + 1)
        v.vote_to_halt()
`,
    },



    'sssp': {
      frameworkCode: `# decorator, and assign the types for vertex data, message data.
# @pregel(vd_type="double", md_type="double")
# @pregel(vd_type="float", md_type="float")
@pregel(vd_type="int", md_type="int")
class SSSP_Pregel(AppAssets):
    @staticmethod
    def Init(v, context):
        v.set_value(MAXUNIT)
    @staticmethod
    def Compute(messages, v, context):
        src_id = context.get_config(b"src")
        # construct, v.value() -> prop
        # cur_dist = v.value()
        v.value = cur_dist
        new_dist = MAXUNIT
        if v.id() == src_id:
            new_dist = 0
        for message in messages:
            # gather_add
            new_dist = min(message, new_dist)
            # apply
            # if new_dist < cur_dist:
            #     v.set_value(new_dist)
            v.set_value(min(cur_dist, new_dist))
            for e_label_id in range(context.edge_label_num()):
                edges = v.outgoing_edges(e_label_id)
                for e in edges:
                    # gather_mult
                    v.send(e.vertex(), new_dist + e.get_int(2))
                    # v.send(e.vertex(), new_dist + e.weight())
`,
    },




    
    'ppr': {
      frameworkCode: `// GraphScope PPR示例代码
  import graphscope as gs
  from graphscope.dataset import load_ldbc
  
  # 加载图数据
  graph = load_ldbc()
  
  # 定义PPR算法
  def ppr(graph, source):
      return gs.pagerank(graph, source)
  
  # 执行算法
  results = ppr(graph, 0)
  print(results)`,
    },
    'gcn': {
      frameworkCode: `// DGL GCN示例代码
  import dgl
  import torch
  import torch.nn as nn
  import torch.nn.functional as F
  
  # 定义GCN模型
  class GCN(nn.Module):
      def __init__(self, in_feats, h_feats, num_classes):
          super(GCN, self).__init__()
          self.conv1 = dgl.nn.GraphConv(in_feats, h_feats)
          self.conv2 = dgl.nn.GraphConv(h_feats, num_classes)
  
      def forward(self, g, in_feat):
          h = self.conv1(g, in_feat)
          h = F.relu(h)
          h = self.conv2(g, h)
          return h
  
  # 创建模型实例
  model = GCN(10, 16, 2)`,
  
    }
  };
  