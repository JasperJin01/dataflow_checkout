export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    part1: '/dashboard/part1/sub1',
    part1_sub1: '/dashboard/part1/sub1',
    part1_sub2: '/dashboard/part1/sub2',
    part2: '/dashboard/part2/sub1',
    part2_sub1: '/dashboard/part2/sub1',
    part2_sub2: '/dashboard/part2/sub2',
    part3: '/dashboard/part3/sub1',
    part3_sub1: '/dashboard/part3/sub1',
    part3_sub2: '/dashboard/part3/sub2',
    part3_sub3: '/dashboard/part3/sub3',
    part4: '/dashboard/part4/sub1',
    part4_sub1: '/dashboard/part4/sub1',
    part5: '/dashboard/part5/sub1',
    part5_sub1: '/dashboard/part5/sub1',
    part5_sub2: '/dashboard/part5/sub2',
    part5_sub3: '/dashboard/part5/sub3',

  },
  errors: { notFound: '/errors/not-found' },
} as const;
