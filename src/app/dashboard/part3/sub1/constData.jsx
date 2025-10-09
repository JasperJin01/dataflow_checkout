export const selog = `dataset:hn_20171128_174550       precision:0.000100
node_num=2703  edge_num=3282
initial and create matrix: cost the time is : 0.001600000 s.
matrix factorization: cost the time is : 0.004790000 s.
host memory initialize: cost the time is : 0.000318000 s.
device memory allocate: cost the time is : 0.000282000 s.
iter 0: write device: cost the time is : 0.000362000 s.
iter 0: compute rhs: cost the time is : 0.000503000 s.
iter 0: read device: cost the time is : 0.000364000 s.
iter 0: max_dVa, 1.852347891, max_dVm, 1.573218765
back_forward and update Va: cost the time is : 0.000291000 s.
iter 1: write device: cost the time is : 0.000358000 s.
iter 1: compute rhs: cost the time is : 0.000497000 s.
iter 1: read device: cost the time is : 0.000366000 s.
iter 1: max_dVa, 0.421576543, max_dVm, 0.382459876
back_forward and update Vm: cost the time is : 0.000288000 s.
iter 2: write device: cost the time is : 0.000363000 s.
iter 2: compute rhs: cost the time is : 0.000502000 s.
iter 2: read device: cost the time is : 0.000361000 s.
iter 2: max_dVa, 0.084251237, max_dVm, 0.072369875
back_forward and update Va: cost the time is : 0.000292000 s.
iter 3: write device: cost the time is : 0.000359000 s.
iter 3: compute rhs: cost the time is : 0.000498000 s.
iter 3: read device: cost the time is : 0.000363000 s.
iter 3: max_dVa, 6.42357e-05, max_dVm, 5.87346e-05
back_forward and update Vm: cost the time is : 0.000289000 s.
----------------information---------------
dataset                   : hn_20171128_174550
precision                 : 0.000100
nodes                     : 2703
edges                     : 3282
iterations                : 4
------------------------------------------
----------------excute time---------------
initial and create matrix : 0.0016s
matrix factorization      : 0.00479s
compute rhs               : 0.002s
back and forward          : 0.00116s
convert                   : 0.00288s
total                     : 0.0124s
--------------------`;

export const executionTimes = {
  'hn_20171128_174550': { cpu: 150.98, accelerator: 12.4 },
  'hn_20171207_06300': { cpu: 150.98, accelerator: 11.2 },
  'hn_20171207_08000': { cpu: 150.98, accelerator: 11.0 },
  'hn_20171207_09150': { cpu: 150.98, accelerator: 11.0 },
  'hn_20171207_10000': { cpu: 150.98, accelerator: 11.0 },
  'hn_20171207_11100': { cpu: 150.98, accelerator: 10.8 },
  'hn_20171208_11100': { cpu: 150.98, accelerator: 11.8 }
};
