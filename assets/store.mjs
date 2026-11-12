import {STORAGE_KEY,freshState,validateState} from './core.mjs';
export class Store{
 constructor(storage=localStorage){this.storage=storage;}
 read(){const raw=this.storage.getItem(STORAGE_KEY);if(!raw)return freshState();try{return validateState(JSON.parse(raw));}catch{throw new Error('Saved attendance data cannot be read. Do not clear your browser data before attempting recovery.');}}
 write(value){const clean=validateState(value);this.storage.setItem(STORAGE_KEY,JSON.stringify(clean));return clean;}
 update(change){const source=this.read(),next=JSON.parse(JSON.stringify(source));change(next);next.revision=source.revision+1;return this.write(next);}
 restore(value){return this.write(validateState(value));}
}
