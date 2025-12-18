import React from "react";
import { Modal } from "antd";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Column from "../kanban/Column";

export default function KanbanTab({
  kanbanLoading,
  kanbanError,
  hasKanbanData,
  filteredColumns,
  columnMeta,
  setSelectedTask,
  createTask,
  deleteColumn,
  moveColumn,
  handleDragOver,
  handleDragEnd,
  isColumnModalOpen,
  setIsColumnModalOpen,
  handleCreateColumn,
  t,
  normalizeTitle,
  readOnly = false,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  if (kanbanLoading) {
    return (
      <div className="text-sm text-gray-500">
        {t?.("loading") || "Loading..."}
      </div>
    );
  }

  if (kanbanError) {
    return (
      <div className="text-sm text-red-500">
        {kanbanError || t?.("error") || "Something went wrong"}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {hasKanbanData ? (
        <div className="mt-4 max-w-full overflow-x-auto pb-2 px-1 sm:px-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <div className="flex gap-6 min-w-min">
            {Object.entries(columnMeta || {})
            .sort((a, b) => (a[1]?.position || 0) - (b[1]?.position || 0))
            .map(([colId, meta]) => {
              const normalizedTitleValue = normalizeTitle(
                meta?.title || colId
              );
              const statusForColumn =
                normalizedTitleValue === "to_do" ? "todo" : normalizedTitleValue;

              return (
                <Column
                  key={colId}
                  id={colId}
                  meta={meta}
                  tasks={filteredColumns[colId] || []}
                  columnMeta={columnMeta}
                  onOpen={setSelectedTask}
                  onCreate={
                    !readOnly && typeof createTask === "function"
                      ? (quickPayload) => {
                          createTask({
                            columnId: colId,
                            title: quickPayload?.title || "New Task",
                            description: "",
                            priority: "medium",
                            status: statusForColumn,
                            dueDate: null,
                          });
                        }
                      : undefined
                  }
                  onMoveColumn={
                    !readOnly && moveColumn
                      ? () => moveColumn(colId, meta)
                      : undefined
                  }
                  onDelete={
                    !readOnly && deleteColumn
                      ? () => {
                          Modal.confirm({
                            title: t?.("deleteColumn") || "Delete Column",
                            content:
                              t?.("deleteColumnConfirm") ||
                              `${t?.("deleteColumn") || "Delete"} column "${columnMeta[colId]?.title || colId}"?`,
                            okText: t?.("ok") || "OK",
                            cancelText: t?.("cancel") || "Cancel",
                            onOk: () => deleteColumn(colId),
                          });
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-gray-500">
          {t?.("noBoardData") || "No board data available."}
        </div>
      )}
    </DndContext>
  );
}
