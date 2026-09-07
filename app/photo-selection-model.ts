import { photoList, type Project } from './projects.ts';
export function visiblePhotoSelection(project:Project,index:number|null,onlyPending:boolean):number|null {
 if(index===null||!photoList(project)[index])return null;
 return onlyPending&&!project.photoReviews?.some(r=>r.index===index&&!r.resolved)?null:index;
}
export function togglePhotoSelection(current:number|null,index:number):number|null{return current===index?null:index}
