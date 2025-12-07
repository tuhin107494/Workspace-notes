export const getTagColor = (tag?: string) => {
  const colors = [
    'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
    'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/10',
    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10',
    'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10',
    'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10',
    'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/10',
    'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/10',
    'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
    'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
    'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-700/10',
    'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10',
    'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-700/10',
    'bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-700/10',
    'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-700/10',
  ];
  const key = (tag || '').toString();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getAvatarColor = (name?: string) => {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 
        'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 
        'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
        'bg-pink-500', 'bg-rose-500'
    ];
    const key = (name || '').toString();
    if (key.length === 0) return 'bg-slate-400';
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}