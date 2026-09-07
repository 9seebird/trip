'use client';
import { useState, useEffect } from 'react';
import { Camera, CalendarDays, Upload, SlidersHorizontal, CheckCheck, Globe, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { stages, images, type Project } from './projects';
import { boardColumns, boardActions, boardFilterLabels } from './board-model';

const icons = [CalendarDays, Upload, SlidersHorizontal, CheckCheck, Globe, CheckCheck];
export function ContentBoard({ items, filter, query, onFilter, onQuery, onClear, onOpen, onAdvance }: {
  items: Project[];
  filter: string;
  query: string;
  onFilter: (value: string) => void;
  onQuery: (value: string) => void;
  onClear: () => void;
  onOpen: (project: Project) => void;
  onAdvance: (project: Project) => void;
}) {
  const columns = boardColumns(items, filter, query);
  const firstFilled=(columns.find(c=>c.projects.length)??columns[0])?.stage;
  const [mobileStage,setMobileStage]=useState<number|undefined>(firstFilled);
  useEffect(()=>{setMobileStage(firstFilled)},[filter,query,firstFilled]);
  const shownStage=columns.some(c=>c.stage===mobileStage)?mobileStage:firstFilled;
  const total = columns.reduce((count, column) => count + column.projects.length, 0);
  const filtered = filter !== 'all' || !!query.trim();
  return <section className="panel board-panel">
    <div className="board-toolbar">
      <div><h2>{filtered ? '필터된 콘텐츠' : '전체 콘텐츠'} <span className="count">{total}건</span></h2>
        <p className="board-description">{filtered?'선택한 조건의 콘텐츠입니다.':'완료 포함 · 모든 콘텐츠입니다.'} 카드에서 작업을 진행하세요.</p></div>
      <input aria-label="콘텐츠 검색" placeholder="숙소, 지역, 담당자 검색" value={query} onChange={e => onQuery(e.target.value)} />
      <Select value={filter} onValueChange={value => value && onFilter(value)}>
        <SelectTrigger aria-label="콘텐츠 단계 필터"><SelectValue>{boardFilterLabels[filter]??'모든 단계'}</SelectValue></SelectTrigger>
        <SelectContent><SelectItem value="all">모든 단계</SelectItem><SelectItem value="active">진행 중만</SelectItem><SelectItem value="overdue">마감 지연만</SelectItem>
          {stages.map((stage, i) => <SelectItem key={stage} value={String(i)}>{stage}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    {filtered && <div className="board-filter-notice" role="status">
      <span>{boardFilterLabels[filter]??'모든 단계'}{query.trim() && ` · 검색 “${query.trim()}”`} · {total}건 표시 중</span>
      <button onClick={onClear}><X size={15} />필터 해제 · 전체 보기</button>
    </div>}
    <div className="mobile-stage-picker" aria-label="표시할 제작 단계">{columns.map(c=><button key={c.stage} aria-pressed={shownStage===c.stage} onClick={()=>setMobileStage(c.stage)}>{stages[c.stage]} <b>{c.projects.length}</b></button>)}</div>
    <div className={['all','active','overdue'].includes(filter) ? 'board' : 'board board-focused'}>
      {columns.map(({ stage, projects }) => {
        const Icon = icons[stage];
        return <section className="board-column" data-mobile-visible={stage===shownStage} key={stage} aria-label={stages[stage]}>
          <h3><span className={`stage-dot dot-${stage}`} />{stages[stage]}<span>{projects.length}</span></h3>
          <p className="column-hint">{boardActions[stage].hint}</p>
          {projects.length === 0 && <div className="board-empty">{query.trim() ? '검색 결과가 없습니다.' : '이 단계의 콘텐츠가 없습니다.'}</div>}
          {projects.map(p => <article className="board-card" key={p.id}>
            <button className="board-card-open" onClick={() => onOpen(p)} aria-label={`${p.name} 상세 열기`}>
              <img src={p.uploads?.[0]?.url ?? images[p.cover]} alt={p.uploads?.length ? '업로드한 촬영 사진' : '참고용 숙소 사진'} />
              <strong>{p.name}<ArrowUpRight size={15} /></strong><p>{p.region}</p>
            </button>
            <div className="board-card-meta"><span>{p.owner}</span><span className={p.stage < 5 && p.due < '2026-09-04' ? 'overdue' : ''}>{p.due.slice(5).replace('-', '.')} 마감</span></div>
            <div className="board-photo-count"><Camera size={14} />{p.photos}장{p.stage >= 4 && <span>{p.channels.filter(Boolean).length}/3 채널 완료</span>}</div>
            {p.note && <p className="board-revision">수정 요청: {p.note}</p>}
            <button className={`board-action board-action-${stage}`} onClick={() => onOpen(p)} aria-label={`${p.name} ${boardActions[stage].label}`}><Icon size={16} />{boardActions[stage].label}<ArrowRight size={15} /></button>
            {(stage === 0 || stage === 2) && <button className="board-secondary-action" onClick={() => onAdvance(p)} aria-label={`${p.name} ${stage === 0 ? '촬영 완료 후 업로드' : '보정 완료 후 검수 요청'}`}><CheckCheck size={15} />{stage === 0 ? '촬영 완료 → 업로드' : '보정 완료 → 검수 요청'}</button>}
          </article>)}
        </section>;
      })}
    </div>
  </section>;
}
