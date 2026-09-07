import type { Project } from './projects';

export type DetailTab = 'schedule' | 'photos' | 'channels';
export const boardFilterLabels:Record<string,string>={'all':'모든 단계','active':'진행 중만','overdue':'마감 지연만','0':'촬영 예정','1':'사진 업로드','2':'보정 중','3':'검수 대기','4':'채널 게시','5':'완료'};

export function defaultDetailTab(stage: number): DetailTab {
  return stage === 0 ? 'schedule' : stage >= 4 ? 'channels' : 'photos';
}

export const boardActions = [
  { label: '촬영 일정 관리', hint: '일정 확인 후 촬영 완료로 표시하세요.' },
  { label: '사진 업로드', hint: '촬영 원본을 추가하고 보정을 시작하세요.' },
  { label: '보정 사진 확인', hint: '보정을 마쳤다면 검수를 요청하세요.' },
  { label: '사진 검수 · 승인', hint: '사진을 확인하고 승인 또는 수정 요청하세요.' },
  { label: '채널별 게시 관리', hint: '각 채널의 게시 완료 여부를 표시하세요.' },
  { label: '게시 결과 확인', hint: '모든 채널 게시가 완료되었습니다.' },
];

export function boardColumns(items: Project[], filter: string, query: string) {
  const search = query.trim().toLocaleLowerCase();
  const stages = ['all','active','overdue'].includes(filter) ? [0, 1, 2, 3, 4, 5] : [Number(filter)];
  return stages.filter(stage => Number.isInteger(stage) && stage >= 0 && stage < 6)
    .map(stage => ({
      stage,
      projects: items.filter(p => p.stage === stage &&
        (filter !== 'active' || p.stage < 5) &&
        (filter !== 'overdue' || (p.stage < 5 && p.due < '2026-09-04')) &&
        `${p.name} ${p.region} ${p.owner}`.toLocaleLowerCase().includes(search)),
    }));
}
