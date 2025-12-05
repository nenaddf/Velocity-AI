export interface Dashboard {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  category: 'Sales' | 'Finance' | 'Operations' | 'Marketing' | 'Executive';
}

export const dashboards: Dashboard[] = [
  {
    id: 'a639d0dd-4a0c-44de-b99c-1a8995d08ec2',
    workspaceId: '6675407f-e82c-4667-9f5d-858c928f5505',
    title: '📈 Brand Director Dashboard',
    description: 'An executive-level overview of key brand performance metrics.',
    category: 'Executive',
  },
  {
    id: 'bb508b3a-e8b7-4e1f-bd62-095f2ab15ebc',
    workspaceId: '6675407f-e82c-4667-9f5d-858c928f5505',
    title: '🚀 Know Your Numbers',
    description: 'A detailed financial overview of key business numbers.',
    category: 'Executive',
  },
  // You can add other reports here once you have their IDs
];
