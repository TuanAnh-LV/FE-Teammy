// src/utils/kanbanUtils.js

export const ALL_COLUMN_IDS = ["todo", "inprogress", "review", "done"];

/**
 * Tìm cột chứa 1 task
 */
export function findColumnOfTask(columns, taskId, allColumnIds = ALL_COLUMN_IDS) {
  return allColumnIds.find((c) => columns[c].some((t) => t.id === taskId));
}

/**
 * Chèn item vào mảng tại index (không mutate arr gốc)
 */
export function insertAt(arr, index, item) {
  const copy = arr.slice();
  copy.splice(index, 0, item);
  return copy;
}

/**
 * Filter task theo search + tag
 */
export function filterColumns(columns, search, filterTag, allColumnIds = ALL_COLUMN_IDS) {
  const pass = (task) => {
    const matchText =
      !search ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag === "All" || task.tags.includes(filterTag);
    return matchText && matchTag;
  };

  const clone = {};
  for (const c of allColumnIds) {
    clone[c] = columns[c].filter(pass);
  }
  return clone;
}

/**
 * Kéo task sang cột khác (drag over)
 */
export function moveTaskAcrossColumns(
  columns,
  activeId,
  overId,
  allColumnIds = ALL_COLUMN_IDS
) {
  const fromCol = findColumnOfTask(columns, activeId, allColumnIds);
  const toCol =
    findColumnOfTask(columns, overId, allColumnIds) ||
    (allColumnIds.includes(overId) ? overId : null);

  if (!fromCol || !toCol || fromCol === toCol) return columns;

  const fromList = [...columns[fromCol]];
  const toList = [...columns[toCol]];

  const movingIndex = fromList.findIndex((t) => t.id === activeId);
  const moving = fromList[movingIndex];
  if (!moving) return columns;

  // Xoá khỏi cột cũ
  fromList.splice(movingIndex, 1);

  // Xác định vị trí chèn trong cột mới
  const overIsTaskInTo = findColumnOfTask(columns, overId, allColumnIds) === toCol;
  const overIndexInTo = overIsTaskInTo
    ? toList.findIndex((t) => t.id === overId)
    : toList.length;

  const newTo = insertAt(toList, overIndexInTo, moving);

  return {
    ...columns,
    [fromCol]: fromList,
    [toCol]: newTo,
  };
}
