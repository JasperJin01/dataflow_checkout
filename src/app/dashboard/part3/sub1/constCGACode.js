
// CGA 代码常量
export const CGA_CODE_MAP = {
    'bfs': `from graph_dsl import *

class BFSKernel(GraphTraversalKernel):
    def __init__(self, dev_graph : Graph, dev_depth : vec_int, dev_root : int):                  
        super().__init__(dev_graph, CHANGED_MODE, PUSH, DEFAULT_EDGE_PROP)
        self.root : int = dev_root
        self.depth : vec_int = dev_depth

        self.CGAprop: GraphTraversalProPerty =()
        self.CGAprop.res = ()
        self.CGAprop.frontier = FrontierFromRoot(self.root)
        self.CGAprop.end_tag  = self.CGAprop.frontier.isempty()
        self.CGAprop.maxiter = 100
        self.CGAprop.ret_value = self.depth
            
    def gather_mult(msg, weight):
        return msg + 1 
    
    def gather_add(res1, res2):
        return min(res1, res2)
    
    def construct(self):
        return self.depth
    
    def apply(self):
        self.depth = min(self.depth, self.CGAprop.res)
        return self.depth
`,


    'sssp': `from graph_dsl import * 

class SSSPKernel(GraphTraversalKernel):
    def __init__(self, dev_graph:Graph, dev_dis:vec_int, dev_root:int):
        super().__init__(dev_graph, CHANGED_MODE, PUSH, CUSTOMED_EDGE_PROP)
        
        self.root : int = dev_root
        self.dis : vec_int = dev_dis

        self.CGAprop:GraphTraversalProPerty=()
        self.CGAprop.res = ()
        self.CGAprop.frontier = FrontierFromRoot(self.root)
        self.CGAprop.end_tag  = self.CGAprop.frontier.isempty()
        self.CGAprop.maxiter = 10000
        self.CGAprop.ret_value = self.dis
    
    def gather_mult(msg, weight):
        return msg + weight
    
    def gather_add(res1, res2):
        return min(res1, res2)
    
    def construct(self):
        return self.dis

    def apply(self):
        self.dis = min(self.dis, self.CGAprop.res)
        return self.dis
`,


    'wcc': `from graph_dsl import * 

class WCCKernel(GraphTraversalKernel):
    def __init__(self, dev_graph:Graph, dev_prop:vec_int):
        super().__init__(dev_graph, CHANGED_MODE, PUSH, DEFAULT_EDGE_PROP)
        self.prop : vec_int = dev_prop
    
        self.CGAprop:GraphTraversalProPerty=()
        self.CGAprop.res = ()
        self.CGAprop.frontier = FrontierFull()
        self.CGAprop.end_tag  = self.CGAprop.frontier.isempty()
        self.CGAprop.maxiter = 10000   
        self.CGAprop.ret_value = self.prop
    
    def gather_mult(msg, weight):
        return msg 
    
    def gather_add(res1, res2):
        return min(res1, res2)
    
    def construct(self):
        return self.prop

    def apply(self):
        self.prop = min(self.prop, self.CGAprop.res)
        return self.prop
`,


    'kcore':`from graph_dsl import *

class KcoreKernel(GraphTraversalKernel):
    def __init__(self, dev_graph: Graph, dev_prop: vec_int, dev_degree: vec_int, dev_nodemask: vec_int):
        super().__init__(dev_graph, CUSTOMED_MODE, PUSH, DEFAULT_EDGE_PROP)
        self.degree : vec_int = dev_degree
        self.nodemask : vec_int =dev_nodemask
        
        self.K : int = 10

        self.CGAprop:GraphTraversalProPerty=()
        self.CGAprop.res = ()
        self.CGAprop.frontier = ()
        self.CGAprop.end_tag = self.CGAprop.frontier.isempty()
        self.CGAprop.maxiter = 30
        self.CGAprop.ret_value = (self.nodemask, self.degree)

    def gather_mult(msg, weight):
        return msg + 1

    def gather_add(res1, res2):
        return res1 + res2

    def construct(self):
        node_ltk = self.degree < self.K
        node_ltk1 = node_ltk & self.nodemask
        self.nodemask = self.nodemask ^ node_ltk1
        self.CGAprop.frontier = FrontierFromQueue(node_ltk1)
        return 0

    def apply(self):
        self.degree = self.degree - self.CGAprop.res
        return self.degree
`,


    'cf': `from graph_dsl import *

class KCliqueKernel(GraphMiningKernel):

    def __init__(self, dev_graph : Graph, dev_prop : vec_float, dev_cnt :int):                  
        super().__init__(dev_graph, FULL_MODE, PULL, DEFAULT_EDGE_PROP)
        self.prop : vec_int = dev_prop
        self.cf_cnt : int = dev_cnt

        self.CGAprop : GraphPatternMiningProPerty = ()
        self.CGAprop.res = ()
        self.CGAprop.ret_value = self.cf_cnt
        self.CGAprop.CfNum = 3
        
    def gather_mult(msg, weight):
        return msg 
    
    def gather_add(res1, res2):
        return res1 + res2
    
    def construct(self):
        return self.prop

    def apply(self):
        self.cf_cnt = self.CGAprop.res
`,



    'ppr': `from graph_dsl import *

class PPRKernel(GraphTraversalKernel):
    def __init__(self, dev_graph:Graph, dev_pr:vec_float, dev_addconst:vec_float):
        super().__init__(dev_graph, FULL_MODE, PUSH, DEFAULT_EDGE_PROP)
        self.pr : vec_float = dev_pr
        self.addconst : vec_float = dev_addconst

        self.Alpha : float = 0.85
        self.Epsilon : float = 1e-6

        self.CGAprop:GraphTraversalProPerty=()
        self.CGAprop.res = ()
        self.CGAprop.end_tag  = ()
        self.CGAprop.maxiter = 10
        self.CGAprop.ret_value = self.pr
        
    def gather_mult(msg, weight):
        return msg 
    
    def gather_add(res1, res2):
        return res1 + res2
    
    def construct(self):
        outdegree  = self.graph.Get_Degree()
        msg : vec_float = (self.pr* self.Alpha)/ outdegree
        return msg

    def apply(self):
        pr_new : vec_float = self.CGAprop.res + self.addconst
        self.pr = pr_new 
        return self.pr
`,



    'gcn': `from graph_dsl import *

class GCNKernel(GraphLearningKernel):

    def __init__(
        self,
        dev_graph: Graph,
        dev_FM: matrix_float,
        dev_WM_1: matrix_float,
        dev_WM_2: matrix_float
    ):
        super().__init__(dev_graph, FULL_MODE, PUSH, CUSTOMED_EDGE_PROP)
        self.Fmat: matrix_float = dev_FM
        self.Wmat1: matrix_float = dev_WM_1
        self.Wmat2: matrix_float = dev_WM_2
    
        self.CGAprop: GraphLearningProPerty = ()
        self.CGAprop.res = ()
        self.CGAprop.layer = ()
        self.CGAprop.layer_num = 2

    def gather_mult(msg, weight):
        return msg * weight

    def gather_add(res1, res2):
        return res1 + res2

    def construct(self):
        return self.CGAprop.layer

    def apply(self):
        self.CGAprop.G_Relu(self.CGAprop.res)

    def compute(self):
        Gcn_Layer(self.Wmat1, self.Fmat, self.construct, self.gather_add, self.gather_mult, self.apply)
        Gcn_Layer(self.Wmat2, self.Fmat, self.construct, self.gather_add, self.gather_mult)
`



  };