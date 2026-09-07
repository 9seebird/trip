import { shotNames, photoList, type Project } from './projects.ts';
import type { WorkspaceView } from './workspace-model.ts';

/** AX(AI Transformation) 관점의 개선 아이디어 모델.
 *  모든 결과는 더미 데이터 상태에서 규칙으로 계산한 "시뮬레이션"이며, 실제 AI 모델 호출은 없습니다.
 *  kind: auto = 사람 개입 없이 자동 처리 후보 / suggest = AI가 제안하고 담당자가 선택 / check = AI가 먼저 걸러주고 담당자가 최종 확인 */
export type AxKind = 'auto' | 'suggest' | 'check';
export interface AxItem { kind: AxKind; title: string; detail: string; source?: string }
export const axKindLabels: Record<AxKind, string> = { auto: '자동 처리', suggest: 'AI 제안', check: '사전 점검' };

export const channelSpecs = [
  { name: '자사 웹사이트', ratio: '16:9 · 1920px', copy: '숙소 소개문 2~3문단' },
  { name: '인스타그램', ratio: '4:5 · 1080px', copy: '캡션 + 해시태그 10개' },
  { name: '네이버 블로그', ratio: '3:2 · 1600px', copy: '본문 + 숙소 정보 표' },
];

const regionKey = (p: Project) => p.region.split('·')[0].trim();

function scheduleInsights(p: Project, all: Project[]): AxItem[] {
  const items: AxItem[] = [];
  const sameDay = all.filter(o => o.id !== p.id && o.stage === 0 && o.date === p.date && regionKey(o) === regionKey(p));
  if (sameDay.length) items.push({ kind: 'suggest', title: `같은 날 ${regionKey(p)} 촬영 ${sameDay.length + 1}건 · 동선 묶기`, detail: `${sameDay.map(o => o.name).join(', ')}와 같은 날 같은 지역입니다. 이동 순서와 시간을 한 담당자에게 묶어 배정하도록 제안합니다.` });
  const owner = all.filter(o => o.id !== p.id && o.stage === 0 && o.date === p.date && o.owner === p.owner);
  if (owner.length) items.push({ kind: 'check', title: `${p.owner} 담당 촬영이 같은 날 ${owner.length + 1}건`, detail: '이동 시간을 포함하면 일정이 겹칠 수 있습니다. 담당자 재배정 후보를 표시합니다.' });
  const extra = p.type.includes('오션') ? '노을·해변 컷' : p.type.includes('호텔') ? '로비·조식 공간 컷' : p.type.includes('프라이빗') ? '이용 동선·대관 세팅 컷' : '마당·창가 풍경 컷';
  items.push({ kind: 'auto', title: '촬영 체크리스트 자동 생성', detail: `${p.type} 기준 필수 4종(${shotNames.join('·')})에 ${extra}을 더한 촬영 리스트를 담당자에게 전달합니다.` });
  items.push({ kind: 'auto', title: '촬영 D-1 알림 · 호스트 확인 메시지', detail: `${p.date.slice(5).replace('-', '.')} ${p.time} 촬영 전날 담당자와 숙소 호스트에게 일정 확인 메시지를 자동 발송합니다.` });
  return items;
}

function uploadInsights(p: Project): AxItem[] {
  const items: AxItem[] = [];
  const photos = photoList(p);
  if (!photos.length) {
    items.push({ kind: 'check', title: '촬영 완료 후 업로드가 아직 없습니다', detail: `${p.date.slice(5).replace('-', '.')} 촬영분이 업로드되지 않았습니다. 담당자에게 업로드 요청 알림을 보냅니다.` });
  } else {
    const unclassified = photos.filter(f => !f.category).length;
    items.push({ kind: 'auto', title: `공간 자동 분류 · ${photos.length}장 중 ${photos.length - unclassified}장 분류됨`, detail: unclassified ? `${unclassified}장은 이미지 인식 결과(객실·욕실·외관·편의시설)를 제안하고 담당자가 확정합니다.` : '모든 사진에 공간 분류가 지정되어 있습니다. 분류 결과로 필수 컷 대조를 진행합니다.' });
  }
  const missing = shotNames.filter((_, i) => !p.shots?.[i]);
  if (missing.length) items.push({ kind: 'check', title: `필수 컷 누락 후보 ${missing.length}종`, detail: `${missing.join(' · ')} 컷이 확인되지 않았습니다. 재촬영이 필요한지 담당자가 판단합니다.` });
  items.push({ kind: 'auto', title: '중복 · 흔들림 · 노출 이상 사전 필터', detail: '유사 컷은 묶어서 대표 1장을 제안하고, 흔들림·과노출 의심 컷은 보정 대상에서 제외 후보로 표시합니다.' });
  return items;
}

function reviewInsights(p: Project): AxItem[] {
  const items: AxItem[] = [];
  const pending = (p.photoReviews ?? []).filter(r => !r.resolved).length;
  items.push({ kind: 'suggest', title: `${p.type} 톤 보정 프리셋 제안`, detail: `이전 승인된 ${p.type} 콘텐츠의 보정값(밝기·대비·화이트밸런스)을 기준으로 1차 보정을 자동 적용하고 담당자가 미세 조정합니다.` });
  items.push({ kind: 'check', title: 'AI 사전 검수 · 흐림 · 노출 · 수평', detail: '검수자가 보기 전에 기술 결함이 있는 사진을 먼저 걸러 주의 항목으로 표시합니다. 최종 승인은 검수자가 합니다.' });
  if (pending) items.push({ kind: 'auto', title: `수정 요청 ${pending}건 → 보정 작업 지시서 자동 정리`, detail: '사진별 수정 메모를 모아 보정 담당자에게 한 번에 전달하고, 재검수 대상만 다시 모아 보여줍니다.' });
  else items.push({ kind: 'auto', title: '수정 요청 메모 → 보정 지시서 자동 정리', detail: '수정 요청이 저장되면 사진별 메모를 모아 보정 담당자에게 전달하고, 재검수 대상만 다시 모아 보여줍니다.' });
  return items;
}

function publishInsights(p: Project): AxItem[] {
  const items: AxItem[] = [];
  const remaining = p.channels.filter(c => !c).length;
  items.push({ kind: 'auto', title: '채널별 규격 자동 변환', detail: channelSpecs.map(c => `${c.name} ${c.ratio}`).join(' / ') + ' 규격으로 승인 사진을 자동 리사이즈·크롭합니다.' });
  items.push({ kind: 'suggest', title: '채널별 캡션 · 해시태그 초안', detail: `${p.name}(${p.region}, ${p.type}) 정보와 승인 사진을 바탕으로 ${channelSpecs.map(c => c.copy).join(', ')} 초안을 생성하고 담당자가 편집합니다.` });
  if (p.salesReview && !p.salesReview.approved) items.push({ kind: 'check', title: '판매 채널 등록본 · 승인본 비교', detail: '채널에 등록된 사진과 승인된 원본을 대조해 누락·중복·순서 오류 후보를 표시합니다.' });
  if (remaining) items.push({ kind: 'auto', title: `미게시 채널 ${remaining}곳 · 게시 후 URL 자동 점검`, detail: '게시 URL이 저장되면 접속 가능 여부와 대표 이미지 일치 여부를 주기적으로 확인하고, 불일치 시 담당자에게 알립니다.' });
  else items.push({ kind: 'auto', title: '게시 URL 상태 자동 점검', detail: '저장된 게시 URL의 접속 가능 여부와 대표 이미지 일치 여부를 주기적으로 확인합니다.' });
  return items;
}

function doneInsights(p: Project): AxItem[] {
  return [
    { kind: 'auto', title: '채널별 성과 자동 수집', detail: '게시 URL 기준으로 조회·저장·문의 수를 모아 콘텐츠별 리포트로 정리합니다.' },
    { kind: 'suggest', title: '재촬영 · 리프레시 시점 제안', detail: `${p.name}은 게시 후 성과 추이와 시즌(성수기·계절 변화)을 기준으로 재촬영 권장 시점을 제안합니다.` },
  ];
}

export function axInsights(p: Project, all: Project[]): AxItem[] {
  switch (p.stage) {
    case 0: return scheduleInsights(p, all);
    case 1: return uploadInsights(p);
    case 2: case 3: return reviewInsights(p);
    case 4: return publishInsights(p);
    default: return doneInsights(p);
  }
}

export const axStageGuides: Record<WorkspaceView, { headline: string; automations: string[]; human: string }> = {
  schedule: { headline: '일정은 AI가 묶고, 배정은 담당자가 결정', automations: ['같은 날·같은 지역 촬영 동선 묶기', '숙소 유형별 촬영 체크리스트 생성', 'D-1 일정 알림 · 호스트 확인'], human: '촬영일 확정과 담당자 배정' },
  upload: { headline: '올리기만 하면 분류와 누락 점검은 자동', automations: ['공간 자동 분류(객실·욕실·외관·편의시설)', '필수 컷 누락 감지', '중복·흔들림·노출 이상 필터'], human: '분류 확정과 재촬영 여부 판단' },
  review: { headline: '1차 보정과 결함 검출은 AI, 승인은 사람', automations: ['숙소 유형별 보정 프리셋 적용', '흐림·노출·수평 사전 검수', '수정 요청 메모 → 보정 지시서 정리'], human: '검수 승인 · 수정 요청' },
  publish: { headline: '채널 규격과 문안 초안은 자동, 게시 확정은 담당자', automations: ['채널별 규격 리사이즈·크롭', '캡션·해시태그·본문 초안 생성', '게시 URL 상태 자동 점검'], human: '문안 확정과 게시 완료 표시' },
};

export interface AxSummaryTile { label: string; value: number; unit: string; hint: string; view: WorkspaceView }
export function axDashboardSummary(items: Project[]): AxSummaryTile[] {
  const active = items.filter(p => p.stage < 5);
  const sameDayGroups = new Set(active.filter(p => p.stage === 0).map(p => p.date + regionKey(p)));
  const bundles = active.filter(p => p.stage === 0).length - sameDayGroups.size;
  const classify = active.filter(p => p.stage === 1).reduce((n, p) => n + photoList(p).filter(f => !f.category).length, 0);
  const precheck = active.filter(p => p.stage === 2 || p.stage === 3).reduce((n, p) => n + (p.uploads?.length || p.photos), 0);
  const captions = active.filter(p => p.stage === 4).reduce((n, p) => n + p.channels.filter(c => !c).length, 0);
  return [
    { label: '동선 묶기 제안', value: bundles, unit: '건', hint: '같은 날 · 같은 지역 촬영', view: 'schedule' },
    { label: '자동 분류 대기', value: classify, unit: '장', hint: '업로드 사진 공간 분류', view: 'upload' },
    { label: 'AI 사전 검수 대상', value: precheck, unit: '장', hint: '보정·검수 단계 사진', view: 'review' },
    { label: '캡션 초안 생성 가능', value: captions, unit: '건', hint: '미게시 채널 기준', view: 'publish' },
  ];
}
