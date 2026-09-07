export const stages = ['촬영 예정', '사진 업로드', '보정 중', '검수 대기', '채널 게시', '완료'];
export type PhotoReviewEvent={note:string;resolved:boolean;at?:string};
export type PhotoReviewRecord={index:number;note:string;resolved:boolean;events?:PhotoReviewEvent[]};
export function reviewEvents(review:PhotoReviewRecord):PhotoReviewEvent[]{return review.events?.length?review.events:[{note:review.note,resolved:review.resolved}]};
export interface Project {id:number;name:string;region:string;type:string;stage:number;owner:string;date:string;time:string;due:string;photos:number;cover:number;channels:boolean[];note:string;uploads?:{name:string;url:string;category?:string}[];history?:string[];shots?:boolean[];channelUrls?:string[];recheck?:boolean[];photoReviews?:PhotoReviewRecord[];salesReview?:{url:string;scanned:boolean;checks:boolean[];approved:boolean}}
export const seed:Project[] = [
 {id:1,name:'스테이 온유',region:'제주 · 애월',type:'독채 스테이',stage:3,owner:'김서연',date:'2026-09-02',time:'10:00',due:'2026-09-03',photos:24,cover:0,channels:[false,false,false],note:''},
 {id:2,name:'오브 서울',region:'서울 · 성수',type:'디자인 호텔',stage:2,owner:'박지훈',date:'2026-09-03',time:'14:00',due:'2026-09-07',photos:36,cover:3,channels:[false,false,false],note:''},
 {id:3,name:'파도, 머무르다',region:'강릉 · 사천',type:'오션뷰 스테이',stage:4,owner:'이수민',date:'2026-09-01',time:'11:00',due:'2026-09-04',photos:18,cover:6,channels:[true,false,false],note:''},
 {id:4,name:'서촌의 오후',region:'서울 · 서촌',type:'프라이빗 공간',stage:0,owner:'박지훈',date:'2026-09-04',time:'10:00',due:'2026-09-09',photos:0,cover:9,channels:[false,false,false],note:''},
 {id:5,name:'월정의 기록',region:'제주 · 월정리',type:'독채 스테이',stage:0,owner:'김서연',date:'2026-09-04',time:'14:00',due:'2026-09-09',photos:0,cover:12,channels:[false,false,false],note:''},
 {id:6,name:'모먼트 부산',region:'부산 · 광안리',type:'부티크 호텔',stage:1,owner:'이수민',date:'2026-09-03',time:'13:00',due:'2026-09-08',photos:0,cover:15,channels:[false,false,false],note:''},
 {id:7,name:'포레스트 하우스',region:'양양 · 현남',type:'독채 스테이',stage:3,owner:'김서연',date:'2026-09-02',time:'09:00',due:'2026-09-06',photos:32,cover:18,channels:[false,false,false],note:''},
 {id:8,name:'더 헤이븐',region:'부산 · 해운대',type:'오션뷰 호텔',stage:5,owner:'이수민',date:'2026-08-28',time:'10:00',due:'2026-09-02',photos:28,cover:21,channels:[true,true,true],note:''},
];
// 숙소별 3장(객실 · 외관 · 편의시설) — Unsplash License 사진, 배포 파일에 포함
export const images=Array.from({length:24},(_,i)=>`covers/stay-${i+1}.jpg`);
export const shotNames=['객실','욕실','외관','편의시설'];
export function safeUrl(value:string){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password}catch{return false}}
export function photoList(p:Project){return p.photos===0?[]:p.uploads?.length?p.uploads:[{name:'대표 컷',category:'객실',url:images[p.cover]},{name:'참고 컷',category:'외관',url:images[(p.cover+1)%images.length]},{name:'참고 컷',category:'편의시설',url:images[(p.cover+2)%images.length]}]}
export type Action = {type:'sales-url';url:string}|{type:'sales-scan'}|{type:'sales-check';index:number;checked:boolean}|{type:'sales-approve'}| {type:'shot';index:number;checked:boolean}|{type:'url';index:number;url:string}|{type:'photo-review';index:number;note:string;resolved:boolean}| {type:'advance'} | {type:'rollback';reason:string} | {type:'reject';note:string} | {type:'channel';index:number} | {type:'schedule';date:string;time:string;due:string;owner:string} | {type:'upload';files:{name:string;url:string}[]} | {type:'photo-category';index:number;category:string} | {type:'remove-uploads';indices:number[]};
export function transition(p:Project,action:Action):Project{
 let result:Project;let entry='';
 switch(action.type){
 case 'sales-url':
  if(!safeUrl(action.url.trim()))throw new Error('http 또는 https 상품 URL을 입력해 주세요.');
  result={...p,salesReview:{url:action.url.trim(),scanned:false,checks:[false,false,false,false],approved:false}};entry='G마켓 상품 URL 저장 · 재검수 필요';break;
 case 'sales-scan':
  if(p.stage<4)throw new Error('검수 승인 후 판매 채널 상품을 확인해 주세요.');
  result={...p,salesReview:{url:p.salesReview?.url??'',scanned:true,checks:[false,false,false,false],approved:false}};entry='G마켓 상품 AI 사전 검수 예시 실행';break;
 case 'sales-check':
  if(!p.salesReview?.scanned||!Number.isInteger(action.index)||action.index<0||action.index>3)throw new Error('AI 사전 검수 예시를 먼저 실행해 주세요.');
  const salesChecks=p.salesReview.checks.map((v,i)=>i===action.index?action.checked:v);
  result={...p,salesReview:{...p.salesReview,checks:salesChecks,approved:false}};entry=['상품명·지역','가격·판매 조건','사진 누락·중복','편의시설·금지 표현'][action.index]+' 확인 '+(action.checked?'완료':'취소');break;
 case 'sales-approve':
  if(!p.salesReview?.scanned||p.salesReview.checks.length!==4||!p.salesReview.checks.every(Boolean))throw new Error('판매 채널 검수 항목을 모두 확인해 주세요.');
  result={...p,salesReview:{...p.salesReview,approved:true}};entry='G마켓 상품 검수 완료';break;
 case 'shot':
  if(p.stage!==1||!Number.isInteger(action.index)||action.index<0||action.index>3)throw new Error('사진 업로드 단계에서 촬영 컷을 확인해 주세요.');
  result={...p,shots:shotNames.map((_,i)=>i===action.index?action.checked:!!p.shots?.[i])};entry=shotNames[action.index]+' 촬영 컷 '+(action.checked?'확인':'확인 취소');break;
 case 'url':
  if(!Number.isInteger(action.index)||action.index<0||action.index>2||!safeUrl(action.url.trim()))throw new Error('http 또는 https 게시 URL을 입력해 주세요.');
  const urls=[...(p.channelUrls??['','',''])];urls[action.index]=action.url.trim();
  const checks=[...(p.recheck??[false,false,false])];const changed=urls[action.index]!==p.channelUrls?.[action.index];
  if(changed)checks[action.index]=true;
  result={...p,channelUrls:urls,recheck:checks,channels:p.channels.map((v,i)=>changed&&i===action.index?false:v),stage:changed&&p.stage===5?4:p.stage};entry='게시 URL 저장 · 해당 채널 재확인 필요';break;
 case 'photo-review':
  if(p.stage<2||!Number.isInteger(action.index)||!photoList(p)[action.index]||!action.note.trim())throw new Error('사진과 수정 메모를 확인해 주세요.');
  if(action.resolved&&!p.photoReviews?.some(r=>r.index===action.index&&!r.resolved))throw new Error('재검수할 수정 요청이 없습니다.');
  const previousReview=p.photoReviews?.find(r=>r.index===action.index);
  if(action.resolved&&action.note.trim()!==previousReview?.note)throw new Error('저장된 수정 요청을 확인한 후 재검수를 완료해 주세요.');
  const events=[{note:action.note.trim(),resolved:action.resolved,at:new Date().toISOString()},...(previousReview?reviewEvents(previousReview):[])];
  result={...p,photoReviews:[...(p.photoReviews??[]).filter(r=>r.index!==action.index),{index:action.index,note:action.note.trim(),resolved:action.resolved,events}],...(!action.resolved?{stage:2,channels:[false,false,false],recheck:[true,true,true],salesReview:p.salesReview?{...p.salesReview,checks:[false,false,false,false],approved:false}:undefined}:{} )};
  entry=photoList(p)[action.index].name+' · '+(action.resolved?'재검수 완료: ':'수정 요청: ')+action.note.trim();break;
 case 'rollback':
  if(p.stage<=0||p.stage>5)throw new Error('이전 단계가 없습니다.');
  if(!action.reason.trim())throw new Error('되돌리는 사유를 입력해 주세요.');
  result={...p,stage:p.stage-1,channels:[false,false,false],salesReview:p.salesReview?{...p.salesReview,checks:[false,false,false,false],approved:false}:undefined,recheck:p.stage>=4?[true,true,true]:p.recheck};
  entry=stages[p.stage]+' → '+stages[result.stage]+' 되돌림: '+action.reason.trim()+(p.channels.some(Boolean)?' · 게시 완료 표시 초기화':'');break;
 case 'advance':
  if(p.stage>=2&&p.photoReviews?.some(r=>!r.resolved))throw new Error('사진별 수정 요청을 재검수 완료한 후 진행해 주세요.');
  if(p.stage>=4)throw new Error('채널별 게시 상태를 확인해 주세요.');
  if(p.stage===1&&p.photos===0)throw new Error('사진을 먼저 추가해 주세요.');
  if(p.stage===1&&p.uploads?.some(f=>!f.category))throw new Error('모든 사진의 촬영 항목을 지정해 주세요.');
  if(p.stage===1&&shotNames.some((_,i)=>!p.shots?.[i]))throw new Error('필수 촬영 컷을 모두 확인해 주세요.');
  result={...p,stage:p.stage+1,note:p.stage===2?'':p.note};entry=stages[result.stage]+' 단계로 이동';break;
 case 'reject':
  if(p.stage!==3)throw new Error('검수 대기 상태에서만 수정 요청이 가능합니다.');
  if(!action.note.trim())throw new Error('수정 요청 사유를 입력해 주세요.');
  result={...p,stage:2,note:action.note.trim()};entry='수정 요청: '+action.note.trim();break;
 case 'channel':
  if(p.stage<4||!Number.isInteger(action.index)||action.index<0||action.index>2)throw new Error('검수 승인 후 채널별 게시를 진행해 주세요.');
  const channels=p.channels.map((v,i)=>i===action.index?!v:v);result={...p,channels,recheck:[0,1,2].map(i=>i===action.index?false:!!p.recheck?.[i]),stage:channels.every(Boolean)?5:4};entry=['자사 웹사이트','인스타그램','네이버 블로그'][action.index]+' 게시 '+(channels[action.index]?'완료 표시':'취소');break;
 case 'schedule':
  if(!/^\d{4}-\d{2}-\d{2}$/.test(action.date)||!/^\d{4}-\d{2}-\d{2}$/.test(action.due)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(action.time)||action.due<action.date||!['김서연','박지훈','이수민'].includes(action.owner))throw new Error('촬영일, 시간, 담당자와 마감일을 확인해 주세요.');
  result={...p,date:action.date,time:action.time,due:action.due,owner:action.owner};entry='촬영 일정 및 담당자 변경';break;
 case 'upload':
  if(p.stage!==1)throw new Error('사진 업로드 단계에서만 사진을 추가할 수 있습니다.');
  if(!action.files.length)throw new Error('사진을 선택해 주세요.');
  result={...p,uploads:[...(p.uploads??[]),...action.files],photos:p.photos+action.files.length,shots:[false,false,false,false],photoReviews:p.uploads?.length?p.photoReviews:[],channels:[false,false,false],salesReview:p.salesReview?{...p.salesReview,scanned:false,checks:[false,false,false,false],approved:false}:undefined,recheck:p.recheck};entry=action.files.length+'장 사진 추가';break;
 case 'photo-category': {
  if(p.stage!==1||!p.uploads?.[action.index]||!shotNames.includes(action.category))throw new Error('사진과 촬영 항목을 확인해 주세요.');
  const categorized=p.uploads.map((f,i)=>i===action.index?{...f,category:action.category}:f);
  result={...p,uploads:categorized,shots:shotNames.map(name=>categorized.some(f=>f.category===name))};entry=p.uploads[action.index].name+' · '+action.category+' 분류';break;
 }
 case 'remove-uploads': {
  const unique=new Set(action.indices);
  if(p.stage!==1||!p.uploads||!action.indices.length||unique.size!==action.indices.length||action.indices.some(i=>!Number.isInteger(i)||i<0||i>=p.uploads!.length))throw new Error('삭제할 업로드 사진을 다시 선택해 주세요.');
  const removed=[...unique].sort((a,b)=>a-b);
  result={...p,uploads:p.uploads.filter((_,i)=>!unique.has(i)),photos:Math.max(0,p.photos-unique.size),shots:[false,false,false,false],photoReviews:(p.photoReviews??[]).filter(r=>!unique.has(r.index)).map(r=>({...r,index:r.index-removed.filter(i=>i<r.index).length})),channels:[false,false,false],salesReview:p.salesReview?{...p.salesReview,scanned:false,checks:[false,false,false,false],approved:false}:undefined};entry=unique.size+'장 사진 삭제';break;
 }
 }
 return {...result,history:[entry,...(p.history??[])].slice(0,12)};
}
function validReviewEvents(events:unknown):boolean{return events===undefined||(Array.isArray(events)&&events.every(e=>e&&typeof e.note==='string'&&typeof e.resolved==='boolean'&&(e.at===undefined||(typeof e.at==='string'&&Number.isFinite(Date.parse(e.at))))))}
export function validStored(value:unknown):value is Project[]{
 return Array.isArray(value)&&value.length===seed.length&&seed.every(s=>value.filter(p=>p?.id===s.id).length===1)&&value.every(p=>(p.salesReview===undefined||(p.salesReview&&typeof p.salesReview.url==='string'&&(!p.salesReview.url||safeUrl(p.salesReview.url))&&typeof p.salesReview.scanned==='boolean'&&Array.isArray(p.salesReview.checks)&&p.salesReview.checks.length===4&&p.salesReview.checks.every((x:unknown)=>typeof x==='boolean')&&typeof p.salesReview.approved==='boolean'&&(!p.salesReview.approved||p.salesReview.checks.every(Boolean))))&&(p.shots===undefined||(Array.isArray(p.shots)&&p.shots.length===4&&p.shots.every((x:unknown)=>typeof x==='boolean')))&&(p.channelUrls===undefined||(Array.isArray(p.channelUrls)&&p.channelUrls.length===3&&p.channelUrls.every((x:unknown)=>typeof x==='string'&&(!x||safeUrl(x)))))&&(p.recheck===undefined||(Array.isArray(p.recheck)&&p.recheck.length===3&&p.recheck.every((x:unknown)=>typeof x==='boolean')))&&(p.photoReviews===undefined||(Array.isArray(p.photoReviews)&&p.photoReviews.every((r:PhotoReviewRecord)=>r&&Number.isInteger(r.index)&&r.index>=0&&r.index<photoList(p).length&&typeof r.note==='string'&&typeof r.resolved==='boolean'&&validReviewEvents(r.events))))&&typeof p.name==='string'&&typeof p.region==='string'&&typeof p.type==='string'&&typeof p.note==='string'&&typeof p.date==='string'&&typeof p.due==='string'&&typeof p.time==='string'&&typeof p.owner==='string'&&Number.isInteger(p.stage)&&p.stage>=0&&p.stage<6&&Number.isInteger(p.cover)&&p.cover>=0&&p.cover<images.length&&Number.isInteger(p.photos)&&p.photos>=0&&Array.isArray(p.channels)&&p.channels.length===3&&p.channels.every((c:unknown)=>typeof c==='boolean')&&(p.stage===5?p.channels.every(Boolean):true)&&(!p.uploads||(Array.isArray(p.uploads)&&p.uploads.every((f:{name:unknown;url:unknown;category?:unknown})=>typeof f.name==='string'&&typeof f.url==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(f.url)&&(f.category===undefined||(typeof f.category==='string'&&shotNames.includes(f.category))))))&&(!p.history||(Array.isArray(p.history)&&p.history.every((h:unknown)=>typeof h==='string'))));
}
