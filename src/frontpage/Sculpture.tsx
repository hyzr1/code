import { useEffect, useRef, useState } from "react";

const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float scroll;
uniform vec2 pointer;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float shape(vec3 p){
  p.xz=rot(time*.09+pointer.x*.16+scroll*.65)*p.xz;
  p.yz=rot(.62+pointer.y*.12+scroll*.2)*p.yz;
  p.xy=rot(-.42)*p.xy;
  float angle=atan(p.y,p.x);
  float radius=1.24+.13*cos(angle*3.+time*.14);
  vec2 q=vec2(length(p.xy)-radius,p.z);
  q=rot(angle*1.5+time*.1)*q;
  float tube=length(q)-.43;
  return tube+.005*sin(angle*88.)*(.6+.4*cos(atan(q.y,q.x)*9.));
}
vec3 normal(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));}
float studio(vec3 r){
  float v=.035;
  v+=2.2*pow(max(0.,dot(r,normalize(vec3(-.6,1.,1.)))),18.);
  v+=1.6*smoothstep(.90,.96,dot(r,normalize(vec3(1.,.1,1.))));
  v+=.7*pow(max(0.,dot(r,normalize(vec3(-1.,-.4,.6)))),8.);
  v+=.2*smoothstep(-.15,.3,r.y);
  return v;
}
void main(){
  vec2 uv=(gl_FragCoord.xy*2.-resolution)/resolution.y;
  vec3 ro=vec3(0.,0.,6.5);
  vec3 rd=normalize(vec3(uv,-3.1));
  float t=0.;float d=1.;
  for(int i=0;i<76;i++){vec3 p=ro+rd*t;d=shape(p);if(d<.0015||t>8.)break;t+=d*.8;}
  float col=.031;
  if(t<8.&&d<.005){
    vec3 p=ro+rd*t;vec3 n=normal(p);vec3 r=reflect(rd,n);
    float fres=pow(1.-max(0.,dot(n,-rd)),3.);
    col=studio(r)*(.48+.52*fres);
    col+=.09*max(0.,dot(n,normalize(vec3(-1.,2.,3.))));
    col=pow(col,.8);
  }
  gl_FragColor=vec4(vec3(col),1.);
}`;

export default function Sculpture({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(8);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || fallback) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFallback(true);
      return;
    }
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex),
      fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) {
      setFallback(true);
      return;
    }
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = {
      resolution: gl.getUniformLocation(program, "resolution"),
      time: gl.getUniformLocation(program, "time"),
      scroll: gl.getUniformLocation(program, "scroll"),
      pointer: gl.getUniformLocation(program, "pointer"),
    };
    let frame = 0,
      visible = true,
      last = 0;
    let x = 0,
      y = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX / innerWidth - 0.5;
      y = e.clientY / innerHeight - 0.5;
    };
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (
        !visible ||
        document.hidden ||
        now - last < 33 ||
        (paused && last > 0)
      )
        return;
      if (!paused && last > 0)
        elapsed.current += Math.min(now - last, 100) * 0.001;
      last = now;
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(
        devicePixelRatio,
        1.25,
        Math.sqrt(600000 / (rect.width * rect.height)),
      );
      const w = Math.round(rect.width * scale),
        h = Math.round(rect.height * scale);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uniforms.resolution, w, h);
      gl.uniform1f(uniforms.time, elapsed.current);
      gl.uniform1f(uniforms.scroll, Math.min(window.scrollY / innerHeight, 2));
      gl.uniform2f(uniforms.pointer, x, y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    const lost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
    };
    canvas.addEventListener("webglcontextlost", lost);
    window.addEventListener("pointermove", move, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      canvas.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [paused, fallback]);
  return (
    <div className="sculpture" aria-hidden="true">
      {fallback ? <div className="sculpture-fallback" /> : <canvas ref={ref} />}
      <div className="sculpture-cross cross-one">+</div>
      <div className="sculpture-cross cross-two">+</div>
      <span className="sculpture-caption">
        FIG. 001 / THE SHAPE OF UNDERSTANDING
      </span>
    </div>
  );
}
