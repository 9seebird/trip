'use client';
import { useState } from 'react';
import { ArrowRight, CheckCheck, Camera, CalendarDays, MapPin, FolderOpen } from 'lucide-react';
import { Detail } from './detail';
import { AxStageBanner } from './ax-panel';
import { stages, transition, type Project, type Action } from './projects';
import { workspaceViews, workspaceQueue, workspaceForStage, type WorkspaceView } from './workspace-model';

export function StageWorkspace({view,items,onAction,onNavigate,initialProjectId,scope='all'}:{view:WorkspaceView;items:Project[];onAction:(id:number,a:Action)=>boolean;onNavigate:(view:string,id?:number)=>void;initialProjectId:number|null;scope?:string}){
 const [selected,setSelected]=useState<number|null>(initialProjectId);
 const [finished,setFinished]=useState<number|null>(null);
 const [currentScope,setCurrentScope]=useState(scope);
 const queue=workspaceQueue(items,view,currentScope);
 const active=queue.find(p=>p.id===selected)??queue[0];
 const done=finished===null?null:items.find(p=>p.id===finished);
 const config=workspaceViews[view];
 const action=(a:Action)=>{
   if(!active)return false;
   const ok=onAction(active.id,a);
   if(ok&&!workspaceQueue([transition(active,a)],view,currentScope).length)setFinished(active.id);
   return ok;
 };
 return <div className="stage-layout">
   <aside className="task-queue">
     <div className="queue-heading"><span>STEP {config.step}</span><h2>{config.queue}<b>{queue.length}</b></h2></div>
     {view==='review'&&<div className="queue-filters" aria-label="보정 검수 필터">{[['all','전체'],['2','보정 중'],['3','검수 대기'],['revision','수정 요청']].map(([value,label])=><button key={value} className={currentScope===value?'active':''} aria-pressed={currentScope===value} onClick={()=>{setCurrentScope(value);setSelected(null);setFinished(null)}}>{label}<b>{workspaceQueue(items,view,value).length}</b></button>)}</div>}{currentScope!=='all'&&view!=='review'&&<div className="queue-scope"><span>{currentScope==='today'?'오늘 촬영만':stages[Number(currentScope)]+'만'} 표시 중</span><button onClick={()=>setCurrentScope('all')}>전체 보기</button></div>}<div className="queue-items">{queue.map(p=><button key={p.id} className={active?.id===p.id&&!done?'queue-item active':'queue-item'} aria-pressed={active?.id===p.id&&!done} onClick={()=>{setSelected(p.id);setFinished(null)}}>
       <div className="queue-item-top"><span className={`status s${p.stage}`}>{stages[p.stage]}</span>{p.stage<5&&p.due<'2026-09-04'&&<span className="overdue">마감 지연</span>}</div>
       <strong>{p.name}<ArrowRight size={15}/></strong><p><MapPin size={13}/>{p.region}</p>
       <div className="queue-meta">{view==='schedule'?<span><CalendarDays size={14}/>{p.date.slice(5).replace('-','.')} {p.time}</span>:view==='publish'?<span><CheckCheck size={14}/>{p.channels.filter(Boolean).length}/3 채널 완료</span>:<span><Camera size={14}/>{p.photos}장</span>}<span>{p.owner}</span></div>
       {view!=='schedule'&&<small>{p.due.slice(5).replace('-','.')} 마감</small>}
     </button>)}</div>
     {!queue.length&&<p className="queue-empty">{currentScope==='all'?config.empty:'선택한 조건에 해당하는 콘텐츠가 없습니다.'}</p>}
     <button className="queue-board-link" onClick={()=>onNavigate('board')}>전체 콘텐츠 보드 보기<ArrowRight size={15}/></button>
   </aside>
   <section className="task-surface" aria-label={config.title}>
     <AxStageBanner view={view}/>
     {done?<div className="handoff-success" role="status"><span className="success-icon"><CheckCheck size={30}/></span><h2>{done.name}</h2><p>{stages[done.stage]} 단계로 이동했습니다.</p><small>대시보드와 전체 보드에도 동일하게 반영되었습니다.</small><button className="primary-button" onClick={()=>onNavigate(workspaceForStage(done.stage),done.id)}>{workspaceViews[workspaceForStage(done.stage)].title}로 이동<ArrowRight size={16}/></button>{queue.length>0&&<button className="text-button" onClick={()=>setFinished(null)}>남은 {queue.length}건 계속하기</button>}</div>
     :active?<Detail key={active.id} inline project={active} all={items} onClose={()=>{}} onAction={action}/>
     :<div className="workspace-empty"><FolderOpen size={38}/><h2>{currentScope==='all'?config.empty:'선택한 조건의 작업이 없습니다.'}</h2><p>{view==='upload'?'촬영 일정 관리에서 촬영을 완료하면 여기에 표시됩니다.':view==='review'?'사진 업로드를 완료하면 보정을 시작할 수 있습니다.':view==='publish'?'검수 승인된 콘텐츠가 이곳에 표시됩니다.':'전체 보드에서 콘텐츠 진행 상태를 확인하세요.'}</p><button className="secondary-button" onClick={()=>onNavigate(view==='upload'?'schedule':view==='review'?'upload':view==='publish'?'review':'board')}>이전 작업 확인<ArrowRight size={16}/></button></div>}
   </section>
 </div>
}
