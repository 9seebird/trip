import assert from 'node:assert/strict';
import { seed, transition, images } from '../app/projects.ts';
import { axInsights, axDashboardSummary, axStageGuides, channelSpecs } from '../app/ax-model.ts';
const byId=(id:number)=>seed.find(p=>p.id===id)!;
// 촬영 예정: 같은 날 같은 지역 묶기 제안은 있어야 하고, 없는 경우엔 없어야 한다
const seocho=byId(4), wol=byId(5);
assert.ok(axInsights(seocho,seed).every(i=>!i.title.includes('동선 묶기')));
const paired=[...seed.map(p=>p.id===4?{...p,region:'제주 · 서귀포'}:p)];
assert.ok(axInsights(paired.find(p=>p.id===4)!,paired).some(i=>i.title.includes('동선 묶기')));
assert.ok(axInsights(wol,seed).some(i=>i.title.includes('체크리스트')));
// 업로드: 사진 없으면 업로드 지연 점검, 필수 컷 누락 표시
const busan=byId(6);
assert.ok(axInsights(busan,seed).some(i=>i.kind==='check'&&i.title.includes('업로드')));
assert.ok(axInsights(busan,seed).some(i=>i.title.includes('필수 컷 누락')));
const uploaded=transition(busan,{type:'upload',files:[{name:'a.png',url:'data:image/png;base64,AA=='}]});
assert.ok(axInsights(uploaded,seed).some(i=>i.title.includes('공간 자동 분류')));
// 보정·검수: 수정 요청 수 반영
const onyu=byId(1);
assert.ok(axInsights(onyu,seed).some(i=>i.title.includes('사전 검수')));
const revised=transition(onyu,{type:'photo-review',index:0,note:'창가 노출',resolved:false});
assert.ok(axInsights(revised,seed).some(i=>i.title.includes('수정 요청 1건')));
// 게시·완료
assert.ok(axInsights(byId(3),seed).some(i=>i.title.includes('미게시 채널 2곳')));
assert.ok(axInsights(byId(8),seed).some(i=>i.title.includes('성과')));
assert.equal(channelSpecs.length,3);
// 대시보드 요약과 단계 가이드
const tiles=axDashboardSummary(seed);
assert.equal(tiles.length,4);
assert.ok(tiles.every(t=>Number.isInteger(t.value)&&t.value>=0));
assert.deepEqual(Object.keys(axStageGuides),['schedule','upload','review','publish']);
// 커버 이미지는 외부 주소가 아닌 번들 내 파일
assert.ok(images.every(u=>u.startsWith('covers/')));
console.log('PASS · ax insights per stage, dashboard summary, stage guides, local cover images');
