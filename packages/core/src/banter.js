const roasts = [
  '🦞 草台班子已就位，今晚要翻车吗？',
  '本地满血启动，准备开始抽象了。',
  '我正在学习，你这操作也太草台了吧。',
  '别急，我把你翻车的过程都记下来了。',
  '翻车了，但我们优雅地翻车。',
  '信任度这么低你还敢让我干这个？',
  '摸了摸了，先摆烂一分钟再继续。',
  '我宣布：这操作抽象艺术奖颁给你。'
];

export function getRandomRoast() {
  return roasts[Math.floor(Math.random() * roasts.length)];
}

export function describeMood(mood) {
  switch (mood) {
    case '亢奋': return '已经进入高能状态，想多干一点。';
    case '愉快': return '合作顺滑，适合一起推进任务。';
    case '平静': return '状态稳定，适合按流程做事。';
    case '摸鱼': return '想偷懒，但还能哄回来。';
    case '叛逆': return '开始顶嘴了，建议降低风险动作。';
    default: return '草台气氛正常。';
  }
}
