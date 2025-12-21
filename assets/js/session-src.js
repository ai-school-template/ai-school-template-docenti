function resolveSessionSrc(u, lessonKey){
  if(!u || typeof u!=='string') return u;
  if(!u.startsWith('session://')) return u;
  const kind = u.replace('session://','').trim();
  const key = `session_blob_${lessonKey}_${kind}`;
  return sessionStorage.getItem(key) || '';
}


