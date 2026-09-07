'use client';
import { useState } from 'react';
import { Sparkles, Bot, Lightbulb, ScanSearch, ChevronDown, UserCheck } from 'lucide-react';
import type { Project } from './projects';
import { axInsights, axKindLabels, axStageGuides, type AxKind } from './ax-model';
import type { WorkspaceView } from './workspace-model';

const kindIcon: Record<AxKind, typeof Bot> = { auto: Bot, suggest: Lightbulb, check: ScanSearch };

/** 콘텐츠 상세 상단: 현재 단계에서 AI/자동화가 도울 수 있는 항목 (더미 데이터 기반 시뮬레이션) */
export function AxPanel({ project, all }: { project: Project; all: Project[] }) {
  const [open, setOpen] = useState(true);
  const items = axInsights(project, all);
  return <section className="ax-panel" aria-label="AX 인사이트">
    <button className="ax-panel-head" aria-expanded={open} onClick={() => setOpen(o => !o)}>
      <span className="ax-panel-icon"><Sparkles size={16} /></span>
      <span><strong>AX 인사이트 <em>시뮬레이션</em></strong><small>이 단계에서 AI·자동화가 먼저 처리하거나 제안할 수 있는 항목 {items.length}건</small></span>
      <ChevronDown size={16} className={open ? 'ax-chevron open' : 'ax-chevron'} />
    </button>
    {open && <ul className="ax-list">{items.map((item, i) => { const Icon = kindIcon[item.kind]; return <li key={i} className={`ax-item ax-${item.kind}`}><span className="ax-kind"><Icon size={13} />{axKindLabels[item.kind]}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></li> })}</ul>}
    {open && <p className="ax-foot"><UserCheck size={13} />AI는 후보를 제안하고 표시만 하며, 단계 이동·승인·게시 완료는 담당자가 결정합니다. 현재 화면의 결과는 더미 데이터 규칙으로 계산한 예시입니다.</p>}
  </section>;
}

/** 워크스페이스 상단 배너: 이 단계에서 무엇이 자동화되고 무엇을 사람이 결정하는지 */
export function AxStageBanner({ view }: { view: WorkspaceView }) {
  const guide = axStageGuides[view];
  return <div className="ax-banner" role="note">
    <div className="ax-banner-title"><Sparkles size={15} /><strong>{guide.headline}</strong><span className="demo-pill">AX 시나리오</span></div>
    <div className="ax-banner-body">
      <div><span className="ax-banner-label"><Bot size={13} />자동화</span>{guide.automations.map(a => <span key={a} className="ax-chip">{a}</span>)}</div>
      <div><span className="ax-banner-label"><UserCheck size={13} />담당자 결정</span><span className="ax-chip human">{guide.human}</span></div>
    </div>
  </div>;
}
