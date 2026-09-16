import type { Problem, TestSpec } from '../types';

/** Independent small-input oracles; never compare a submission with itself. */
export function interviewCases(problem: Problem): TestSpec[] {
  if (!problem.id.startsWith('py.nc.')) return [];
  const slug=problem.id.slice(6);
  const match=problem.tests[0]?.code.match(/json\.loads\(("(?:\\.|[^"\\])*")\)/);
  if(!match)return [];
  let meta:unknown;try{meta=JSON.parse(JSON.parse(match[1]));}catch{return [];}
  let seed=81427;const random=(max:number)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
  const cases:{args:unknown[];expected:unknown}[]=[];
  const add=(args:unknown[],expected:unknown)=>cases.push({args,expected});
  for(let index=0;index<240;index++){
    const n=1+random(25), nums=Array.from({length:n},()=>random(31)-15);
    const word=Array.from({length:index%25},()=> 'abcde'[random(5)]).join('');
    switch(slug){
      case 'concatenation-of-array': {const a=nums.map(v=>Math.abs(v)+1);add([a],[...a,...a]);break;}
      case 'contains-duplicate':add([nums],new Set(nums).size!==nums.length);break;
      case 'two-sum': {const a=Array.from({length:2+random(15)},(_,i)=>2**i);const l=random(a.length),r=(l+1+random(a.length-1))%a.length;add([a,a[l]+a[r]],[l,r]);break;}
      case 'valid-anagram': {const a=word||'a',b=index%2?a.split('').reverse().join(''):a+'z';add([a,b],a.split('').sort().join('')===b.split('').sort().join(''));break;}
      case 'product-of-array-except-self': {const a=nums.slice(0,6);if(a.length<2)a.push(0);add([a],a.map((_,i)=>a.reduce((v,x,j)=>j===i?v:v*x,1)));break;}
      case 'longest-consecutive-sequence': {const a=[...new Set(nums)].sort((a,b)=>a-b);let best=0,run=0;a.forEach((v,i)=>{run=i&&v===a[i-1]+1?run+1:1;best=Math.max(best,run);});add([nums],best);break;}
      case 'best-time-to-buy-and-sell-stock': {const a=nums.map(v=>v+16);let best=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)best=Math.max(best,a[j]-a[i]);add([a],best);break;}
      case 'longest-substring-without-repeating-characters': {let best=0;for(let i=0;i<word.length;i++)for(let j=i+1;j<=word.length;j++){const s=word.slice(i,j);if(new Set(s).size===s.length)best=Math.max(best,s.length);}add([word],best);break;}
      case 'longest-repeating-character-replacement': {const s=(word||'a').toUpperCase(),k=random(s.length+1);let best=0;for(let i=0;i<s.length;i++)for(let j=i+1;j<=s.length;j++){const counts=new Map<string,number>();for(const c of s.slice(i,j))counts.set(c,(counts.get(c)||0)+1);if(j-i-Math.max(...counts.values())<=k)best=Math.max(best,j-i);}add([s,k],best);break;}
      case 'trapping-rain-water': {const a=nums.map(v=>Math.abs(v));add([a],a.reduce((sum,v,i)=>sum+Math.max(0,Math.min(Math.max(...a.slice(0,i+1)),Math.max(...a.slice(i)))-v),0));break;}
      case 'container-with-most-water': {const a=nums.map(v=>Math.abs(v));if(a.length<2)a.push(0);let best=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)best=Math.max(best,(j-i)*Math.min(a[i],a[j]));add([a],best);break;}
      case 'binary-search': {const a=[...new Set(nums)].sort((a,b)=>a-b),target=index%2?a[random(a.length)]:40;add([a,target],a.indexOf(target));break;}
      case 'search-insert-position': {const a=[...new Set(nums)].sort((a,b)=>a-b),target=random(41)-20;const i=a.findIndex(v=>v>=target);add([a,target],i<0?a.length:i);break;}
      case 'valid-palindrome': {const s=index%2?word+' ,'+word.split('').reverse().join(''):word+' XY';const clean=s.toLowerCase().replace(/[^a-z0-9]/g,'');add([s],clean===clean.split('').reverse().join(''));break;}
      case 'valid-parentheses': {const s=index%2?'('.repeat(1+index%15)+')'.repeat(1+index%15):'([)]'.repeat(1+index%8);add([s],!!(index%2));break;}
      case 'coin-change': {const coins=[...new Set([1+random(8),1+random(8),1+random(8)])],amount=random(60);const dp=Array(amount+1).fill(Infinity);dp[0]=0;for(let i=1;i<=amount;i++)for(const c of coins)if(c<=i)dp[i]=Math.min(dp[i],dp[i-c]+1);add([coins,amount],Number.isFinite(dp[amount])?dp[amount]:-1);break;}
      default:return [];
    }
  }
  const unique=new Map(cases.map(c=>[JSON.stringify(c.args),c]));
  const literal=(value:unknown)=>`json.loads(${JSON.stringify(JSON.stringify(value))})`;
  return [...unique.values()].map((c,index)=>({name:`Boundary case ${index+1}`,hidden:true,code:`_hyzr_check(fn, ${JSON.stringify(slug)}, ${literal(meta)}, ${literal(c.args)}, ${literal(c.expected)})`}));
}
