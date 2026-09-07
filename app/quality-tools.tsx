'use client';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { shotNames, photoList, safeUrl, stages, reviewEvents, type PhotoReviewRecord, type Project, type Action } from './projects';
type Props={project:Project;onAction:(a:Action)=>boolean};
export function ShotChecklist({project:p,onAction}:Props){
 const [suggested,setSuggested]=useState(false);
 const missing=shotNames.filter((_,i)=>!p.shots?.[i]);
 if(p.stage>=2){const categories=Array.from(new Set(photoList(p).map(photo=>photo.category).filter(Boolean)));return <section className="shot-summary"><span><strong>✓</strong></span><div><strong>촬영 항목 확인 완료</strong><p>사진 업로드 단계에서 확인했습니다: {categories.join(' · ')||'분류 정보 없음'}</p></div></section>}
 return <section className="quality-panel"><h3>필수 촬영 컷 확인 <span className="demo-pill">담당자 확인</span></h3><p>사진을 분류하면 해당 항목이 자동으로 확인되고, 직접 체크할 수도 있습니다. 사진을 추가·삭제하면 분류 기준으로 다시 계산합니다.</p><div className="shot-checks">{shotNames.map((name,i)=><label key={name}><Checkbox checked={!!p.shots?.[i]} disabled={p.stage!==1||!p.photos} onCheckedChange={v=>onAction({type:'shot',index:i,checked:v===true})}/>{name}</label>)}</div><p className={missing.length?'quality-warning':''} role="status">{missing.length?'미확인: '+missing.join(' · '):'필수 촬영 컷을 모두 확인했습니다.'}</p><button className="secondary-button" disabled={!p.photos} onClick={()=>setSuggested(true)}>AI 분류 예시 보기</button>{suggested&&<div className="quality-demo"><strong>시뮬레이션 · 객실 후보 / 욕실·외관·편의시설 확인 필요</strong><p>고정 예시이며 실제 사진 분석 결과가 아닙니다. 자동으로 체크하지 않으므로 담당자가 직접 확인해 주세요.</p></div>}<small>{missing.length?'미확인 항목이 있으면 보정 단계로 이동할 수 없습니다.':'필수 항목 확인이 완료되어 보정 단계로 이동할 수 있습니다.'}</small></section>
}
export function PhotoReviews({project:p,onAction,selectedIndex,onSelect,onlyPending,onFilter}:Props&{selectedIndex:number|null;onSelect:(index:number)=>void;onlyPending:boolean;onFilter:(value:boolean)=>void}){
 const photos=photoList(p);
 const pending=(p.photoReviews??[]).filter(r=>!r.resolved);
 return <section className="quality-panel"><h3>사진별 수정·재검수 <span className="demo-pill">{pending.length}장 재검수 필요</span></h3><p>수정 요청을 저장해도 현재 숙소 화면은 유지되며, 작업 상태만 보정 중으로 변경됩니다. 사진을 누르면 메모 입력창이 열리고, 아래에서 원본과 조절 미리보기를 확인하실 수 있습니다. 다시 누르면 선택이 해제됩니다. 재검수 완료한 메모는 사진별 수정 이력에 보관됩니다.</p><div className="review-context"><div><span>현재 작업 중인 숙소</span><strong>{p.name}</strong></div><span className={`status s${p.stage}`}>{stages[p.stage]}</span></div><label className="pending-toggle"><Checkbox checked={onlyPending} onCheckedChange={v=>onFilter(v===true)}/>재검수 필요한 사진만</label><div className="review-grid">{photos.map((photo,index)=>({photo,index,review:p.photoReviews?.find(r=>r.index===index)})).filter(({index})=>!onlyPending||pending.some(r=>r.index===index)).map(({photo,index,review})=><button type="button" key={index} className={`review-tile ${selectedIndex===index?'is-active':''} ${review&&!review.resolved?'is-pending':''}`} aria-pressed={selectedIndex===index} onClick={()=>onSelect(index)}><img src={photo.url} alt={photo.name}/><span className="review-tile-label"><b>{photo.category??'미분류'}</b>{photo.name}</span>{review&&<i className={review.resolved?'done':'pending'}>{review.resolved?'재검수 완료':'재검수 필요'}</i>}</button>)}</div>{onlyPending&&!pending.length&&<p>재검수할 사진이 없습니다.</p>}{selectedIndex!==null&&photos[selectedIndex]?<PhotoReview key={selectedIndex+':'+String(p.photoReviews?.find(r=>r.index===selectedIndex)?.resolved)} photo={photos[selectedIndex]} index={selectedIndex} review={p.photoReviews?.find(r=>r.index===selectedIndex)} selected onSelect={()=>onSelect(selectedIndex)} onAction={onAction}/>:<p className="review-hint">사진을 선택하면 수정 메모를 남기고 아래에서 원본과 비교할 수 있습니다.</p>}<details className="photo-review-history"><summary>사진별 수정 이력 · {(p.photoReviews??[]).reduce((sum,review)=>sum+reviewEvents(review).length,0)}건</summary><p>요청과 재검수 완료 기록입니다. 위 사진 필터와 관계없이 확인하실 수 있습니다.</p>{(p.photoReviews??[]).length?(p.photoReviews??[]).map(review=><section key={review.index}><h4>{review.index+1}. {photos[review.index]?.category??'미분류'} · {photos[review.index]?.name}</h4>{reviewEvents(review).map((event,i)=><article key={i}><div><strong>{event.resolved?'재검수 완료':'수정 요청'}</strong><time>{event.at?new Date(event.at).toLocaleString('ko-KR'):'이전 기록 · 시간 정보 없음'}</time></div><p>{event.note}</p></article>)}</section>):<p>아직 저장된 수정 이력이 없습니다.</p>}</details></section>
}
function PhotoReview({photo,index,review,onAction,selected,onSelect}:{photo:{name:string;url:string;category?:string};index:number;review?:PhotoReviewRecord;onAction:Props['onAction'];selected:boolean;onSelect:()=>void}){
 const [note,setNote]=useState(review&&!review.resolved?review.note:'');
 const expanded=true;void selected;
 return <article className={`photo-review ${selected?'comparison-selected':''} ${expanded?'':'is-compact'}`}><button type="button" className="review-photo-select" aria-pressed={selected} onClick={onSelect}><img src={photo.url} alt={photo.name}/><span>{selected?'수정 중':'수정 선택'}</span></button><div><strong>{photo.category??'미분류'} · {photo.name}</strong><p>{review?(review.resolved?'재검수 완료':'재검수 필요'):'수정 요청 없음'}</p>{expanded&&<><label>사진 수정 메모<textarea maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder={review?.resolved?'새 수정 요청이 있으면 입력해 주세요.':'예: 창가 노출을 낮춰 주세요.'}/></label><div className="quality-buttons"><button className="secondary-button" disabled={!note.trim()} onClick={()=>onAction({type:'photo-review',index,note,resolved:false})}>수정 요청 저장</button>{review&&!review.resolved&&<button className="primary-button" disabled={note.trim()!==review.note} onClick={()=>{if(onAction({type:'photo-review',index,note:review.note,resolved:true}))setNote('')}}>확인 · 재검수 완료</button>}</div></>}</div></article>
}
export function ChannelUrl({project:p,index,onAction}:{project:Project;index:number;onAction:Props['onAction']}){
 const [url,setUrl]=useState(p.channelUrls?.[index]??'');
 const [error,setError]=useState('');
 return <form className="channel-url" onSubmit={e=>{e.preventDefault();if(!safeUrl(url.trim())){setError('http 또는 https 주소를 입력해 주세요.');return}if(onAction({type:'url',index,url}))setError('')}}><label>게시물 URL<input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…"/></label><button className="secondary-button" type="submit">URL 저장</button>{p.recheck?.[index]&&<span className="quality-warning">재확인 필요</span>}{error&&<p role="alert">{error}</p>}</form>
}
export function AxGuide(){
 const rows=[
  ['01 촬영 일정','촬영 일정이 지역·담당자별로 흩어져 이동 시간이 낭비됨','같은 날·같은 지역 촬영을 묶어 동선을 제안하고, 담당자 중복 배정을 경고','규칙 기반 제안 구현 / 지도·이동시간 API는 미연동','촬영 1건당 이동 시간, 일정 변경 횟수'],
  ['01 촬영 일정','숙소 유형마다 찍어야 할 컷이 달라 누락 발생','숙소 유형별 촬영 체크리스트 자동 생성, D-1 알림','유형별 리스트 고정 예시 / 알림 발송은 미연동','재촬영 건수'],
  ['02 사진 업로드','업로드 후 공간별 분류에 시간이 걸림','이미지 인식으로 객실·욕실·외관·편의시설 분류 제안','분류 UI 구현 / AI 결과는 고정 예시','분류 소요 시간, 분류 수정률'],
  ['02 사진 업로드','필수 사진 누락을 뒤늦게 발견','분류 결과와 촬영 체크리스트를 대조해 누락 후보 표시','체크리스트·누락 경고 구현','누락 재촬영 건수'],
  ['02 사진 업로드','중복·흔들림 컷을 사람이 일일이 골라냄','유사 컷 묶기, 흔들림·노출 이상 사전 필터','설명만 반영 / 실제 분석 미구현','보정 대상 선별 시간'],
  ['03 보정·검수','보정 톤이 담당자마다 달라 브랜드 일관성 부족','승인된 콘텐츠의 보정값으로 유형별 프리셋 1차 적용','미리보기 밝기·대비 조절만 구현','보정 소요 시간, 재보정 횟수'],
  ['03 보정·검수','어떤 사진을 수정해야 하는지 불명확','사진별 수정 메모와 재검수 대상 모아 보기, 보정 지시서 자동 정리','구현 / 버전 비교·복원은 향후 확장','검수 재요청 횟수, 수정 소요 시간'],
  ['03 보정·검수','검수자가 기술 결함까지 눈으로 확인','흐림·노출·수평 사전 검수 후 주의 항목만 표시','시뮬레이션 버튼 구현 / 실제 분석 미구현','검수 1건당 소요 시간'],
  ['04 채널 게시','채널마다 사진 규격과 문안을 따로 준비','채널별 규격 자동 변환, 캡션·해시태그·본문 초안 생성','설명·규격표 반영 / 생성은 미구현','채널당 게시 준비 시간'],
  ['04 채널 게시','판매 채널의 상품 정보·사진이 원본과 불일치','채널 등록본과 승인 원본 비교, 중복·누락 후보 제안','검수 흐름 구현 / 비교 결과는 고정 예시','등록 오류율, 채널별 검수 시간'],
  ['04 채널 게시','완료 표시와 실제 게시물이 불일치','게시 URL 저장, 수정 이후 재확인 표시, URL 상태 자동 점검','URL 저장·재확인 구현 / 자동 점검은 미연동','게시 누락 건수, 확인 소요 시간'],
  ['완료 이후','게시 후 성과가 콘텐츠와 연결되지 않음','채널별 조회·문의 수를 자동 수집해 콘텐츠 리포트로 정리, 재촬영 시점 제안','설명만 반영','콘텐츠당 문의 전환, 리프레시 주기'],
 ];
 return <details className="quality-panel ax-guide"><summary>AX 개선 아이디어 · 구현 범위 보기</summary>
  <div className="ax-roadmap"><div><b>1단계 · 규칙 기반</b><p>일정 동선 묶기, 필수 컷 대조, URL 재확인처럼 데이터만으로 되는 자동화. 이 목업에서 실제 동작합니다.</p></div><div><b>2단계 · 비전·언어 모델</b><p>공간 분류, 결함 검출, 보정 프리셋, 캡션 초안. 목업에서는 고정 예시·시뮬레이션으로 표시합니다.</p></div><div><b>3단계 · 채널 연동</b><p>채널 API 게시, 게시물 상태 점검, 성과 수집. 사내 인증·채널 계정 연동이 필요해 범위 밖입니다.</p></div></div>
  <div className="ax-table-wrap"><table><thead><tr><th>단계</th><th>업무 문제</th><th>개선 방식</th><th>목업 범위</th><th>검증할 지표</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
  <p>AI는 확인 대상을 제안하고, 담당자가 최종 판단합니다. 효과 수치는 아직 측정하지 않았으며 실제 도입 시 파일럿으로 검증합니다. 입력 내용은 이 브라우저에만 저장됩니다.</p></details>
}
