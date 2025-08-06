const KEY = import.meta.env.VITE_PARENT_STORAGE_KEY;

function _getArr() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("SessionStorage JSON parse error:", e);
    sessionStorage.removeItem(KEY);
    return [];
  }
}

function _saveArr(arr: unknown[]) {
  window.sessionStorage.setItem(KEY, JSON.stringify(arr));
}

export function getAll() {
  return _getArr();
}

export function getById(id: string) {
  const arr = _getArr();
  const idx = arr.findIndex((item: { id: string }) => item.id === id);

  return idx > -1 ? arr[idx] : undefined;
}

export function setConversationsHistory(
  id: string,
  conversationObj: { id: string }
) {
  const propName = "conversations";

  const arr = _getArr();
  const idx = arr.findIndex((item: { id: string }) => item.id === id);

  if (idx > -1) {
    const existing = arr[idx][propName];

    const updatedArr = [...existing, conversationObj];

    arr[idx][propName] = updatedArr;
  } else {
    const obj = { id, [propName]: [conversationObj] };

    arr.push(obj);
  }

  _saveArr(arr);
}

export function setQuizData(id: string, dataObj: { id: string }) {
  const propName = "quizData";

  const arr = _getArr();
  const idx = arr.findIndex((item: { id: string }) => item.id === id);

  if (idx > -1) {
    arr[idx][propName] = dataObj;
  } else {
    const obj = { id, [propName]: dataObj };

    arr.push(obj);
  }
  _saveArr(arr);
}
