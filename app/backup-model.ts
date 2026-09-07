import { validStored, type Project } from './projects.ts';
export const backupLimit=4*1024*1024;
export function makeBackup(projects:Project[]){return JSON.stringify({app:'stayflow',version:1,exportedAt:new Date().toISOString(),projects},null,2)}
export function readBackup(text:string):Project[]{
 if(new TextEncoder().encode(text).length>backupLimit)throw new Error('백업 파일은 4MB 이하로 선택해 주세요.');
 try{
  const data=JSON.parse(text);
  if(data?.app!=='stayflow'||data.version!==1||!validStored(data.projects))throw new Error();
  return data.projects;
 }catch{throw new Error('지원하는 Stayflow 백업 파일이 아닙니다. 기존 데이터는 변경하지 않았습니다.')}
}
