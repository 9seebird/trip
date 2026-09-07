'use client';
import { useState } from 'react';
import { ExternalLink, ScanSearch, Check, CircleAlert, Images, Tags, CheckCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { safeUrl, type Project, type Action } from './projects';
const fallback='https://minishop.gmarket.co.kr/trip11';
const checks=['상품명·지역 표기를 원본과 비교했습니다','가격·판매 조건을 운영 정보와 비교했습니다','누락·중복 의심 사진을 직접 확인했습니다','편의시설 태그·주의 표현을 확인했습니다'];
export function SalesChannelReview({project:p,onAction}:{project:Project;onAction:(a:Action)=>boolean}){
 const [url,setUrl]=useState(p.salesReview?.url??''),[error,setError]=useState('');
 const review=p.salesReview;
 const save=()=>{if(!safeUrl(url.trim())){setError('http 또는 https 상품 URL을 입력해 주세요.');return}if(onAction({type:'sales-url',url})){setError('')}};
 return <section className="sales-review">
  <div className="sales-title"><div><span className="sales-kicker">판매 채널 · 등록 검수</span><h3>G마켓 숙소 상품 검수 <span className="demo-pill">판매 채널 가정 목업</span></h3><p>승인된 숙소 정보와 판매 채널 등록본을 비교합니다.</p></div><span className={review?.approved?'sales-status approved':'sales-status'}>{review?.approved?<><Check size={14}/>검수 완료</>:review?.scanned?'확인 필요':'검수 전'}</span></div>
  <div className="sales-url-row"><label>등록 상품 URL<input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://item.gmarket.co.kr/…"/></label><button className="secondary-button" type="button" onClick={save}>URL 저장</button><a className="secondary-button" href={review?.url||fallback} target="_blank" rel="noopener noreferrer">등록 화면 열기<ExternalLink size={14}/></a></div>{error&&<p className="quality-warning" role="alert">{error}</p>}
  <div className="sales-source"><strong>승인 원본</strong><span>{p.name}</span><span>{p.region}</span><span>승인 사진 {p.photos}장</span><span>{p.type}</span></div>
  {!review?.scanned?<div className="sales-empty"><ScanSearch size={28}/><strong>등록본 비교를 시작해 주세요.</strong><p>실제 URL을 읽거나 사진을 분석하지 않고, 면접 시연을 위한 고정 결과를 보여줍니다.</p><button className="primary-button" disabled={p.stage<4} onClick={()=>onAction({type:'sales-scan'})}><ScanSearch size={16}/>AI 사전 검수 예시 실행</button>{p.stage<4&&<small>콘텐츠 검수 승인 후 실행할 수 있습니다.</small>}</div>:<>
   <div className="scan-summary"><div><strong>{Math.max(p.photos-3,0)} / {p.photos}</strong><span>등록 사진</span></div><div className="warn"><strong>3</strong><span>누락 의심</span></div><div className="warn"><strong>2</strong><span>중복 의심</span></div><div className="warn"><strong>2</strong><span>정보 확인</span></div></div>
   <div className="comparison-list"><article><Images/><div><strong>사진 구성</strong><p>승인본 대비 3장 누락, 유사도가 높은 반복 이미지 2장</p></div><span className="review-badge warning">확인 필요</span></article><article><Tags/><div><strong>상품명·지역</strong><p>{p.name} · {p.region} / 등록본의 지역 표기 형식 확인</p></div><span className="review-badge warning">확인 필요</span></article><article><CheckCheck/><div><strong>판매가·편의시설</strong><p>가격은 채널 화면에서 직접 확인 · 편의시설 태그 1개 불일치 예시</p></div><span className="review-badge warning">확인 필요</span></article><article><Check/><div><strong>대표 이미지</strong><p>승인된 대표 컷과 동일한 이미지로 추정</p></div><span className="review-badge">일치</span></article></div>
   <div className="sales-checks"><h4>담당자 최종 확인</h4>{checks.map((label,i)=><label key={label}><Checkbox checked={!!review.checks[i]} onCheckedChange={v=>onAction({type:'sales-check',index:i,checked:v===true})}/><span>{label}</span></label>)}</div>
   <button className="primary-button full" disabled={review.approved||!review.checks.every(Boolean)} onClick={()=>onAction({type:'sales-approve'})}>{review.approved?<><Check size={16}/>판매 채널 검수 완료</>:<>모든 항목 확인 후 검수 완료</>}</button>
   <p className="fineprint"><CircleAlert size={13}/>AI 결과와 수치는 고정된 시뮬레이션입니다. 실제 상품 정보·가격·이미지를 수집하거나 비교하지 않으며 최종 판단은 담당자가 합니다.</p>
  </>}
 </section>
}
