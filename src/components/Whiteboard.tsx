import { useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "./Icon";

type Point = { x: number; y: number };
type Tool = "pen" | "marker" | "eraser" | "line" | "arrowRight" | "rectangle" | "ellipse" | "type" | "hand";
type Stroke = { points: Point[]; tool: Tool; color: string; size: number; text?: string };
const COLORS = ["#242936", "#ffffff", "#8064dc", "#3478db", "#239b78", "#e09a2b", "#e05467"];
const TOOLS: { id: Tool; label: string; key: string }[] = [
  { id: "pen", label: "Pen", key: "P" }, { id: "marker", label: "Highlighter", key: "M" },
  { id: "eraser", label: "Stroke eraser", key: "E" }, { id: "line", label: "Line", key: "L" },
  { id: "arrowRight", label: "Arrow", key: "A" }, { id: "rectangle", label: "Rectangle", key: "R" },
  { id: "ellipse", label: "Ellipse", key: "O" }, { id: "type", label: "Text", key: "T" }, { id: "hand", label: "Pan", key: "H" },
];
function shapePoints(stroke: Stroke): Point[] {
  const [a, b = a] = [stroke.points[0], stroke.points.at(-1)!];
  if (!a) return [];
  if (stroke.tool === "rectangle") return [a, { x:b.x,y:a.y }, b, { x:a.x,y:b.y }, a];
  if (stroke.tool === "ellipse") return Array.from({length:65}, (_, i) => ({ x:(a.x+b.x)/2 + (b.x-a.x)/2*Math.cos(i/64*Math.PI*2), y:(a.y+b.y)/2+(b.y-a.y)/2*Math.sin(i/64*Math.PI*2) }));
  return stroke.points;
}
function path(stroke: Stroke): string {
  const points = shapePoints(stroke);
  if (!points.length) return "";
  const first = points[0];
  if (points.length === 1) return `M${first.x} ${first.y}l.01 .01`;
  if (stroke.tool === "arrowRight") {
    const end = points.at(-1)!; const angle = Math.atan2(end.y-first.y,end.x-first.x); const length = Math.max(12, stroke.size*4);
    return `M${first.x} ${first.y}L${end.x} ${end.y}M${end.x-length*Math.cos(angle-.5)} ${end.y-length*Math.sin(angle-.5)}L${end.x} ${end.y}L${end.x-length*Math.cos(angle+.5)} ${end.y-length*Math.sin(angle+.5)}`;
  }
  if (!["pen", "marker"].includes(stroke.tool)) return points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' ');
  let d = `M${first.x} ${first.y}`;
  for (let i=1;i<points.length-1;i++) { const a=points[i], b=points[i+1]; d+=`Q${a.x} ${a.y} ${(a.x+b.x)/2} ${(a.y+b.y)/2}`; }
  const last=points.at(-1)!; return d+`L${last.x} ${last.y}`;
}
function distance(p: Point, a: Point, b: Point) {
  const dx=b.x-a.x,dy=b.y-a.y, length=dx*dx+dy*dy;
  const t=length ? Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/length)) : 0;
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
function readBoard(key:string): { strokes:Stroke[]; background:string; grid:boolean } {
  try {
    const data=JSON.parse(localStorage.getItem(key) || "null");
    if (Array.isArray(data?.strokes) && data.strokes.every((s:Stroke)=>TOOLS.some(t=>t.id===s.tool) && /^#[0-9a-f]{6}$/i.test(s.color) && Number.isFinite(s.size) && s.size>0 && (s.tool!=='type'||typeof s.text==='string') && Array.isArray(s.points) && s.points.length && s.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))) return {strokes:data.strokes,background:/^#[0-9a-f]{6}$/i.test(data.background)?data.background:"#faf9f6",grid:!!data.grid};
  } catch { /* An unavailable or invalid draft starts a fresh canvas. */ }
  return { strokes:[],background:"#faf9f6",grid:false };
}
export default function Whiteboard({problemId,title,onClose}:{problemId:string;title:string;onClose:()=>void}) {
  const key=`hyzr.whiteboard.v1.${problemId}`;
  const [initial] = useState(()=>readBoard(key));
  const [strokes,setStrokes]=useState<Stroke[]>(initial.strokes);
  const [background,setBackground]=useState(initial.background);
  const [grid,setGrid]=useState(initial.grid);
  const [tool,setTool]=useState<Tool>("pen");
  const [color,setColor]=useState("#8064dc");
  const [size,setSize]=useState(3);
  const [view,setView]=useState({x:0,y:0,zoom:1});
  const [dimensions,setDimensions]=useState({width:1000,height:700});
  const [revision,setRevision]=useState(0);
  const [saved,setSaved]=useState(true);
  const [clearConfirm,setClearConfirm]=useState(false);
  const [textEntry,setTextEntry]=useState<{point:Point;text:string}|null>(null);
  const [measured,setMeasured]=useState(false);
  const [preview,setPreview]=useState<Stroke|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const svg=useRef<SVGSVGElement>(null);
  const history=useRef<Stroke[][]>([]), future=useRef<Stroke[][]>([]);
  const current=useRef(strokes);
  const gesture=useRef<{id:number;before:Stroke[];stroke:Stroke|null;last:Point;pan:boolean}|null>(null);
  current.current=strokes;
  const commit=(next:Stroke[], before=current.current)=>{history.current=[...history.current.slice(-79),before];future.current=[];current.current=next;setStrokes(next);setRevision(n=>n+1);};
  const undo=()=>{const prev=history.current.pop();if(prev){future.current.push(current.current);current.current=prev;setStrokes(prev);setRevision(n=>n+1);}};
  const redo=()=>{const next=future.current.pop();if(next){history.current.push(current.current);current.current=next;setStrokes(next);setRevision(n=>n+1);}};
  const fit=()=>{
    const points=current.current.flatMap(s=>s.points);
    if(!points.length){setView({x:0,y:0,zoom:1});return;}
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for(const p of points){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);}
    const zoom=Math.min(2,Math.max(.1,Math.min((dimensions.width-80)/Math.max(100,maxX-minX),(dimensions.height-140)/Math.max(100,maxY-minY))));
    setView({x:(minX+maxX)/2-dimensions.width/zoom/2,y:(minY+maxY)/2-dimensions.height/zoom/2,zoom});
  };
  const zoomBy=(factor:number)=>setView(v=>{const z=Math.max(.1,Math.min(4,v.zoom*factor));return {x:v.x+dimensions.width/2/v.zoom-dimensions.width/2/z,y:v.y+dimensions.height/2/v.zoom-dimensions.height/2/z,zoom:z};});
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const modal=dialog.current;
    modal?.showModal();
    const resize=new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;setDimensions({width,height});setMeasured(true);});
    if(svg.current)resize.observe(svg.current);
    return ()=>{resize.disconnect();modal?.close();requestAnimationFrame(()=>{if(previous?.isConnected)previous.focus();});};
  },[]);
  const initiallyFitted=useRef(false);
  useEffect(()=>{if(measured&&!initiallyFitted.current){initiallyFitted.current=true;fit();}},[dimensions,measured]);
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify({strokes,background,grid}));setSaved(true);}catch{setSaved(false);}},[strokes,background,grid,key]);
  useEffect(()=>{
    const handle=(e:KeyboardEvent)=>{
      // Keep workspace Run/Submit shortcuts from reaching the editor behind this dialog.
      if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();return;}
      if((e.target as HTMLElement).matches('input,textarea'))return;
      if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();if(e.shiftKey||e.key.toLowerCase()==='y')redo();else undo();return;}
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      const selected=TOOLS.find(t=>t.key.toLowerCase()===e.key.toLowerCase());if(selected)setTool(selected.id);
      if(e.key==='[')setSize(s=>Math.max(1,s-1));if(e.key===']')setSize(s=>Math.min(32,s+1));
    };
    window.addEventListener('keydown',handle,true);return()=>window.removeEventListener('keydown',handle,true);
  });
  const point=(event:{clientX:number;clientY:number})=>{const rect=svg.current!.getBoundingClientRect();return {x:view.x+(event.clientX-rect.left)/view.zoom,y:view.y+(event.clientY-rect.top)/view.zoom};};
  const erase=(p:Point)=>{const next=current.current.filter(s=>{if(s.tool==='type'){const a=s.points[0];const lines=(s.text||'').split('\n');return !(p.x>=a.x-8&&p.x<=a.x+Math.max(...lines.map(l=>l.length))*s.size*.65+8&&p.y>=a.y-s.size&&p.y<=a.y+(lines.length-1)*s.size*1.3+8);}const points=shapePoints(s);return !points.some((a,i)=>distance(p,a,points[i+1]??a)<(size+8)/view.zoom+s.size/2);});current.current=next;setStrokes(next);};
  const finish=(cancel=false)=>{
    const g=gesture.current;if(!g)return;
    if(cancel){current.current=g.before;setStrokes(g.before);}
    else if(g.stroke)commit([...g.before,g.stroke],g.before);
    else if(!g.pan&&current.current!==g.before)commit(current.current,g.before);
    gesture.current=null;setPreview(null);
  };
  const download=()=>{
    const source=svg.current!;const copy=source.cloneNode(true) as SVGSVGElement;
    copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width',String(dimensions.width*2));copy.setAttribute('height',String(dimensions.height*2));
    const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}));
    const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=dimensions.width*2;canvas.height=dimensions.height*2;canvas.getContext('2d')!.drawImage(img,0,0);URL.revokeObjectURL(url);canvas.toBlob(blob=>{if(!blob)return;const link=document.createElement('a');const png=URL.createObjectURL(blob);link.href=png;link.download=`${problemId}-whiteboard.png`;link.click();setTimeout(()=>URL.revokeObjectURL(png),1000);});};img.onerror=()=>URL.revokeObjectURL(url);img.src=url;
  };
  const button=(name:IconName,label:string,action:()=>void,disabled=false)=><button type="button" title={label} aria-label={label} onClick={action} disabled={disabled}><Icon name={name} size={18}/></button>;
  return <dialog className="whiteboard" ref={dialog} aria-label={`${title} whiteboard`} onCancel={onClose} data-revision={revision}>
    <header className="board-header"><div className="board-heading"><Icon name="board" size={20}/><div><strong>Whiteboard</strong><span>{title}</span></div></div><div className="board-actions"><span className={saved?'board-saved':'board-unsaved'}>{saved?'Saved on this device':'Not saved — export your sketch'}</span>{button('download','Export PNG',download)}{button('x','Close whiteboard',onClose)}</div></header>
    <div className="board-stage">
      <svg ref={svg} className={`board-canvas tool-${tool}`} role="img" aria-label="Drawing canvas" viewBox={`${view.x} ${view.y} ${dimensions.width/view.zoom} ${dimensions.height/view.zoom}`}
        onPointerDown={event=>{if(gesture.current||event.button>1)return;event.preventDefault();if(tool==='type'){setTextEntry({point:point(event),text:""});return;}event.currentTarget.setPointerCapture(event.pointerId);const p=point(event);const pan=tool==='hand'||event.button===1;const stroke=pan||tool==='eraser'?null:{points:[p],tool,color,size:tool==='marker'?size*5:size};gesture.current={id:event.pointerId,before:current.current,stroke,last:{x:event.clientX,y:event.clientY},pan};if(tool==='eraser'&&!pan)erase(p);setPreview(stroke);}}
        onPointerMove={event=>{const g=gesture.current;if(!g||g.id!==event.pointerId)return;if(g.pan){const dx=event.clientX-g.last.x,dy=event.clientY-g.last.y;setView(v=>({...v,x:v.x-dx/v.zoom,y:v.y-dy/v.zoom}));g.last={x:event.clientX,y:event.clientY};return;}if(tool==='eraser'){erase(point(event));return;}if(!g.stroke)return;const events=event.nativeEvent.getCoalescedEvents?.()||[];const points=(events.length?events:[event]).map(point);g.stroke={...g.stroke,points:['pen','marker'].includes(g.stroke.tool)?[...g.stroke.points,...points]:[g.stroke.points[0],points.at(-1)!]};setPreview(g.stroke);}}
        onPointerUp={event=>{if(gesture.current?.id===event.pointerId){finish();event.currentTarget.releasePointerCapture(event.pointerId);}}}
        onPointerCancel={()=>finish(true)} onLostPointerCapture={()=>finish()}>
        <defs><pattern id="board-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={background==='#191c24'?'#454a58':'#c4c7cd'}/></pattern></defs>
        <rect x={view.x} y={view.y} width={dimensions.width/view.zoom} height={dimensions.height/view.zoom} fill={background}/>
        {grid&&<rect x={view.x} y={view.y} width={dimensions.width/view.zoom} height={dimensions.height/view.zoom} fill="url(#board-dots)"/>}
        {[...strokes,...(preview?[preview]:[])].map((stroke,i)=>stroke.tool==='type'?<text data-stroke="true" key={i} fill={stroke.color} fontSize={stroke.size} fontFamily="Arial, sans-serif">{(stroke.text||'').split('\n').map((line,index)=><tspan key={index} x={stroke.points[0].x} y={stroke.points[0].y+index*stroke.size*1.3}>{line}</tspan>)}</text>:<path data-stroke="true" key={i} d={path(stroke)} fill="none" stroke={stroke.color} strokeWidth={stroke.size} strokeLinecap="round" strokeLinejoin="round" opacity={stroke.tool==='marker'?.3:1}/>)}
      </svg>
      <div className="board-toolbox" role="toolbar" aria-label="Drawing tools">{TOOLS.map(t=><button key={t.id} type="button" title={`${t.label} (${t.key})`} aria-label={t.label} aria-pressed={tool===t.id} onClick={()=>setTool(t.id)}><Icon name={t.id} size={20}/></button>)}<i/>{button('undo','Undo',undo,!history.current.length)}{button('redo','Redo',redo,!future.current.length)}</div>
      <aside className="board-options" aria-label="Brush and canvas settings">
        <div className="board-colors">{COLORS.map(c=><button key={c} aria-label={`Ink ${c}`} aria-pressed={color===c} className="board-swatch" style={{background:c}} onClick={()=>setColor(c)}/>)}<label className="board-custom-color" title="Custom ink color"><input type="color" aria-label="Custom ink color" value={color} onChange={e=>setColor(e.target.value)}/><Icon name="plus" size={14}/></label></div>
        <div className="board-brush"><Icon name="pen" size={15}/><input aria-label="Brush size" type="range" min="1" max="32" value={size} onChange={e=>setSize(Number(e.target.value))}/><output>{size}px</output><span className="board-brush-preview"><i style={{width:Math.min(size,24),height:Math.min(size,24),background:color}}/></span></div>
        <div className="board-paper"><span>Canvas</span>{['#faf9f6','#ffffff','#191c24'].map(c=><button className="board-swatch" aria-label={`Background ${c}`} aria-pressed={background===c} key={c} style={{background:c}} onClick={()=>setBackground(c)}/>)}<label className="board-custom-color" title="Custom canvas color"><input type="color" aria-label="Custom canvas color" value={background} onChange={e=>setBackground(e.target.value)}/><Icon name="plus" size={12}/></label><button className="board-grid" aria-pressed={grid} onClick={()=>setGrid(!grid)}><Icon name="layers" size={14}/>Dots</button></div>
      </aside>
      <div className="board-view-controls">{button('minus','Zoom out',()=>zoomBy(1/1.2))}<span>{Math.round(view.zoom*100)}%</span>{button('plus','Zoom in',()=>zoomBy(1.2))}{button('maximize','Fit drawing',fit)}<i/>{button('trash','Clear drawing',()=>setClearConfirm(true),!strokes.length)}</div>
      {textEntry&&<form className="board-clear board-text-entry" aria-label="Add canvas text" onSubmit={event=>{event.preventDefault();if(textEntry.text.trim())commit([...strokes,{tool:'type',points:[textEntry.point],text:textEntry.text,color,size:Math.max(16,size*3)}]);setTextEntry(null);}}><label htmlFor="board-text">Add a label or note</label><textarea id="board-text" autoFocus value={textEntry.text} onChange={e=>setTextEntry({...textEntry,text:e.target.value})} placeholder="e.g. left pointer"/><button type="submit">Add text</button><button type="button" onClick={()=>setTextEntry(null)}>Cancel</button></form>}
      {clearConfirm&&<div className="board-clear" role="alertdialog" aria-label="Clear drawing confirmation"><strong>Clear this whiteboard?</strong><span>You can restore it with Undo.</span><button onClick={()=>{commit([]);setClearConfirm(false);}}>Clear drawing</button><button onClick={()=>setClearConfirm(false)}>Cancel</button></div>}
      <span className="board-shortcuts">P pen · E eraser · H pan · Ctrl/⌘ Z undo</span>
    </div>
  </dialog>;
}
