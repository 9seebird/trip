import type { Project } from './projects';
export const workspaceViews = {
  schedule: { title:'촬영 일정 관리', step:'01', stages:[0], description:'촬영 일정과 담당자를 확인하고, 완료된 촬영을 사진 업로드로 넘깁니다.', queue:'촬영 예정', empty:'예정된 촬영이 없습니다.' },
  upload: { title:'촬영 사진 업로드', step:'02', stages:[1], description:'숙소별 원본 사진을 추가하고, 보정 작업을 시작합니다.', queue:'업로드 대기', empty:'사진 업로드를 기다리는 콘텐츠가 없습니다.' },
  review: { title:'보정·검수', step:'03', stages:[2,3], description:'보정 사진을 비교하고, 검수 승인 또는 수정 요청을 진행합니다.', queue:'보정·검수 대상', empty:'보정·검수가 필요한 콘텐츠가 없습니다.' },
  publish: { title:'채널별 게시', step:'04', stages:[4,5], description:'승인된 콘텐츠의 채널별 게시 여부를 확인하고 제작을 마무리합니다.', queue:'게시 대상', empty:'검수 승인된 콘텐츠가 없습니다.' },
};
export type WorkspaceView = keyof typeof workspaceViews;
export function isWorkspaceView(view:string):view is WorkspaceView {return Object.prototype.hasOwnProperty.call(workspaceViews,view)}
export function workspaceForStage(stage:number):WorkspaceView{return stage===0?'schedule':stage===1?'upload':stage<4?'review':'publish'}
export const metricDestinations=[
  {view:'board',scope:'active'},
  {view:'board',scope:'0'},
  {view:'board',scope:'3'},
  {view:'board',scope:'overdue'},
  {view:'board',scope:'5'},
];
export function workspaceQueue(items:Project[],view:WorkspaceView,scope='all'):Project[]{
  return items.filter(p=>workspaceViews[view].stages.includes(p.stage)&&(scope==='all'||(scope==='today'?p.date==='2026-09-04':scope==='revision'?p.stage===2&&((p.photoReviews??[]).some(r=>!r.resolved)||!!p.note):p.stage===Number(scope)))).sort((a,b)=>{
    if(view==='review'&&a.stage!==b.stage)return b.stage-a.stage;
    if(view==='publish'&&a.stage!==b.stage)return a.stage-b.stage;
    return (view==='schedule'?a.date+a.time:a.due).localeCompare(view==='schedule'?b.date+b.time:b.due);
  });
}
export function scheduleRows(items:Project[],from='',to='',owner='all'){return workspaceQueue(items,'schedule').filter(p=>(!from||p.date>=from)&&(!to||p.date<=to)&&(owner==='all'||p.owner===owner))}
