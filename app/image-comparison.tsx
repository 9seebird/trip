'use client';
import { useId, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { comparisonState } from './comparison-model';

export function ImageComparison({src,name,adjustment,onAdjust}:{src:string;name:string;adjustment:{brightness:number;contrast:number};onAdjust:(value:{brightness:number;contrast:number})=>void}) {
  const [position,setPosition]=useState(50);
  const labelId=useId();
  const state=comparisonState(position);
  return <div className="image-comparison">
    <div className="adjustment-controls">{(['brightness','contrast'] as const).map(kind=><div key={kind}><label id={labelId+kind}>{kind==='brightness'?'밝기':'대비'} <strong>{adjustment[kind]}%</strong></label><Slider aria-labelledby={labelId+kind} value={[adjustment[kind]]} min={50} max={150} step={1} onValueChange={value=>onAdjust({...adjustment,[kind]:Array.isArray(value)?value[0]:value})}/></div>)}<button type="button" className="secondary-button" onClick={()=>onAdjust({brightness:100,contrast:100})}>원본 값으로 초기화</button><p role="status">{adjustment.brightness===100&&adjustment.contrast===100?'원본과 동일 · 조절 효과 없음':'미리보기에 적용됨 · 원본 파일 저장 안 됨'}</p></div>
    <div className="comparison-canvas">
      <img className="comparison-after" src={src} alt={`${name} 조절 후 미리보기`} draggable={false} style={{filter:`brightness(${adjustment.brightness/100}) contrast(${adjustment.contrast/100})`}}/>
      <img className="comparison-before" src={src} alt={`${name} 원본`} draggable={false} style={{filter:'none',clipPath:`inset(0 ${state.after}% 0 0)`}}/>
      {state.showBefore&&<div className="comparison-label-region before-region" style={{width:`${state.before}%`}}><span>BEFORE · 원본</span></div>}
      {state.showAfter&&<div className="comparison-label-region after-region" style={{width:`${state.after}%`}}><span>AFTER · 조절 미리보기</span></div>}
      <Slider className="comparison-slider" aria-labelledby={labelId} thumbAlignment="center" value={[state.before]} onValueChange={value=>setPosition(Array.isArray(value)?value[0]:value)} min={0} max={100} step={1}/>
    </div>
    <div className="comparison-options" aria-label="보정 비교 보기">
      <button type="button" aria-pressed={state.before===100} onClick={()=>setPosition(100)}>보정 전만</button>
      <button type="button" aria-pressed={state.before===50} onClick={()=>setPosition(50)}>반반 비교</button>
      <button type="button" aria-pressed={state.before===0} onClick={()=>setPosition(0)}>보정 후만</button>
    </div>
    <p className="comparison-help" id={labelId}>이미지의 경계선을 좌우로 드래그하세요. 왼쪽은 보정 전, 오른쪽은 보정 후입니다.</p>
    <p className="sr-only">키보드 방향키로도 조절할 수 있습니다. Home은 보정 후 전체, End는 보정 전 전체입니다. 현재 보정 전 {state.before}%, 보정 후 {state.after}%.</p>
  </div>;
}
