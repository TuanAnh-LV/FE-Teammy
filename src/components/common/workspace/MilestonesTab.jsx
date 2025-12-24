import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Plus,
  MoreVertical,
  Calendar,
  Trash2,
  Edit2,
  Link,
  Target,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  Button,
  DatePicker,
  Dropdown,
  Input,
  Modal,
  Select,
  Tag,
  notification,
  Progress,
} from "antd";
import dayjs from "dayjs";
import { MilestoneService } from "../../../services/milestone.service";
import { BacklogService } from "../../../services/backlog.service";
import { useTranslation } from "../../../hook/useTranslation";

const statusColors = {
  planned: "default",
  in_progress: "blue",
  done: "green",
  completed: "green",
};

const formatDate = (value) => {
  if (!value) return "--";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD/MM/YYYY") : "--";
};

export default function MilestonesTab({ groupId, readOnly = false, groupStatus = "" }) {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [assignMilestoneId, setAssignMilestoneId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    targetDate: null,
    status: "planned",
    completedAt: null,
  });
  const [backlogOptions, setBacklogOptions] = useState([]);
  const [assignBacklogIds, setAssignBacklogIds] = useState([]);
  const fetchedRef = useRef(null);

  const isGroupClosed = () => {
    if (!groupStatus) return false;
    const statusLower = (groupStatus || "").toLowerCase();
    return statusLower.includes("closed");
  };

  const fetchMilestones = async () => {
    if (!groupId || isGroupClosed()) return;
    setLoading(true);
    try {
      const res = await MilestoneService.list(groupId);
      const payload = res?.data ?? res;
      const items = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : payload?.items || [];
      setList(items);
    } catch (err) {

      notification.warning({
        message: t("error") || "Error",
        description: t("failedLoadMilestones") || "Failed to load milestones",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBacklogOptions = async () => {
    if (!groupId || isGroupClosed()) return;
    try {
      const res = await BacklogService.getBacklog(groupId);
      const payload = res?.data ?? res;
      const items = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : payload?.items || [];
      const options = items
        .filter((item) => (item.status || "").toLowerCase() !== "ready")
        .map((item) => ({
          value: item.backlogItemId || item.id || item._id,
          label: item.title || "Backlog item",
        }));
      setBacklogOptions(options);
    } catch (err) {

    }
  };

  useEffect(() => {
    if (!groupId || fetchedRef.current === groupId || isGroupClosed()) return;
    fetchedRef.current = groupId;
    fetchMilestones();
    fetchBacklogOptions();
  }, [groupId, groupStatus]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      targetDate: null,
      status: "planned",
      completedAt: null,
    });
    setSelectedMilestone(null);
  };

  const openCreate = () => {
    if (readOnly) return;
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item) => {
    if (readOnly) return;
    setSelectedMilestone(item);
    setForm({
      name: item?.name || "",
      description: item?.description || "",
      targetDate: item?.targetDate ? dayjs(item.targetDate) : null,
      status: item?.status || "planned",
      completedAt: item?.completedAt ? dayjs(item.completedAt) : null,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (readOnly || !groupId || isGroupClosed()) return;
    if (!form.name.trim()) {
      notification.warning({
        message: t("validationError") || "Validation error",
        description: t("pleaseEnterTitle") || "Please enter title",
      });
      return;
    }

    // Validate target date: cannot be in the past
    if (form.targetDate && dayjs(form.targetDate).isBefore(dayjs().startOf("day"))) {
      notification.warning({
        message: t("validationError") || "Validation error",
        description: t("dueDateCannotBePast") || "Due date cannot be in the past.",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: (form.description || "").trim(),
      targetDate: form.targetDate ? dayjs(form.targetDate).format("YYYY-MM-DD") : null,
    };
    if (selectedMilestone) {
      payload.status = form.status || "planned";
      payload.completedAt = form.completedAt ? dayjs(form.completedAt).toISOString() : null;
    }
    try {
      if (selectedMilestone) {
        const id = selectedMilestone.milestoneId || selectedMilestone.id;
        await MilestoneService.update(groupId, id, payload);
        notification.success({ message: t("updated") || "Updated" });
      } else {
        await MilestoneService.create(groupId, payload);
        notification.success({ message: t("created") || "Created" });
      }
      setModalOpen(false);
      resetForm();
      fetchMilestones();
    } catch (err) {

      notification.warning({
        message: t("actionFailed") || "Action failed",
        description: err?.response?.data?.message || t("pleaseTryAgain") || "Please try again.",
      });
    }
  };

  const handleDelete = (item) => {
    if (readOnly || isGroupClosed()) return;
    const id = item?.milestoneId || item?.id;
    if (!id) return;
    let inputValue = "";
    Modal.confirm({
      title: t("delete") || "Delete",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {t("typeDeleteToConfirm") || "Type 'delete' to confirm."}
          </p>
          <Input
            placeholder={t("deletePlaceholder") || "delete"}
            onChange={(ev) => {
              inputValue = ev.target.value;
            }}
          />
        </div>
      ),
      okText: t("delete") || "Delete",
      cancelText: t("cancel") || "Cancel",
      onOk: async () => {
        if (inputValue.toLowerCase() !== "delete") {
          notification.warning({
            message: t("validationError") || "Validation Error",
            description: t("mustTypeDelete") || "You must type 'delete' to confirm.",
          });
          return Promise.reject();
        }
        try {
          await MilestoneService.remove(groupId, id);
          notification.success({ message: t("deleted") || "Deleted" });
          fetchMilestones();
        } catch (err) {

          notification.warning({
            message: t("actionFailed") || "Action failed",
            description: err?.response?.data?.message || t("pleaseTryAgain") || "Please try again.",
          });
        }
      },
    });
  };

  const openAssign = (item) => {
    if (readOnly) return;
    setAssignMilestoneId(item?.milestoneId || item?.id);
    setAssignBacklogIds([]);
    setAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (readOnly || !groupId || !assignMilestoneId || !assignBacklogIds.length || isGroupClosed()) {
      notification.warning({
        message: t("validationError") || "Validation error",
        description: t("pleaseSelectItems") || "Please select backlog items.",
      });
      return;
    }
    try {
      await MilestoneService.assignBacklogItems(groupId, assignMilestoneId, assignBacklogIds);
      notification.success({ message: t("updated") || "Updated" });
      setAssignModalOpen(false);
      setAssignBacklogIds([]);
      fetchMilestones();
    } catch (err) {

      notification.warning({
        message: t("actionFailed") || "Action failed",
        description: err?.response?.data?.message || t("pleaseTryAgain") || "Please try again.",
      });
    }
  };

  const handleRemoveItem = (milestoneId, backlogItemId) => {
    if (readOnly || isGroupClosed()) return;
    if (!groupId || !milestoneId || !backlogItemId) return;
    Modal.confirm({
      title: t("confirm") || "Confirm",
      content: t("remove") || "Remove?",
      okText: t("remove") || "Remove",
      cancelText: t("cancel") || "Cancel",
      onOk: async () => {
        try {
          await MilestoneService.removeBacklogItem(groupId, milestoneId, backlogItemId);
          notification.success({ message: t("deleted") || "Deleted" });
          fetchMilestones();
          fetchBacklogOptions();
        } catch (err) {

          notification.warning({
            message: t("actionFailed") || "Action failed",
            description: err?.response?.data?.message || t("pleaseTryAgain") || "Please try again.",
          });
        }
      },
    });
  };

  const statusTag = (value) => {
    const key = (value || "").toLowerCase();
    const color = statusColors[key] || "default";
    return <Tag color={color}>{value || "planned"}</Tag>;
  };

  const listToShow = useMemo(() => list || [], [list]);

  const isTaskDone = (item) => {
    const st = (item.status || "").toLowerCase();
    return st === "done" || st === "completed";
  };

  const statusBadge = (status) => {
    const key = (status || "").toLowerCase();
    const colorClass =
      key === "done" || key === "completed"
        ? "bg-emerald-100 text-emerald-700"
        : key === "in_progress"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700";
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
        {status || "planned"}
      </span>
    );
  };

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              {t("milestones") || "Milestones"}
            </h3>
          </div>
          <p className="text-sm text-gray-500">
            {listToShow.length} {t("items") || "items"}
          </p>
        </div>
        {!readOnly && (
          <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
            {t("newMilestone") || "New Milestone"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">{t("loading") || "Loading..."}</div>
      ) : listToShow.length ? (
        <div className="space-y-4">
          {listToShow.map((item) => {
            const mId = item.milestoneId || item.id;
            const assignedItems = item.items || [];
            const progress = {
              percent: item.completionPercent || 0,
              done: item.completedItems || 0,
              total: item.totalItems || 0,
            };
            return (
              <div key={mId} className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-3 flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {item.name || "Untitled milestone"}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(item.targetDate)}</span>
                      {statusBadge(item.status)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                        <span>{t("progress") || "Progress"}</span>
                        <span>{progress.percent}%</span>
                      </div>
                      <Progress percent={progress.percent} showInfo={false} />
                      <p className="text-xs text-gray-500">
                        {progress.done}/{progress.total} {t("items") || "items"} {t("done") || "done"}
                      </p>
                    </div>

                    {assignedItems.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {t("backlogItems") || "Backlog items"}:
                        </p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {assignedItems.map((bi) => {
                            const done = isTaskDone(bi);
                            const backlogId = bi.backlogItemId || bi.id || bi._id;
                            return (
                              <li
                                key={backlogId}
                                className="flex items-center gap-2"
                              >
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-300" />
                                )}
                                <span className={done ? "text-gray-800" : "text-gray-700"}>
                                  {bi.title || "Backlog item"}
                                </span>
                                {!readOnly && (
                                  <Button
                                    size="small"
                                    type="text"
                                    danger
                                    onClick={() => handleRemoveItem(mId, backlogId)}
                                  >
                                    {t("remove") || "Remove"}
                                  </Button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  {!readOnly && (
                    <Dropdown
                      trigger={["click"]}
                      menu={{
                        items: [
                          {
                            key: "assign",
                            label: (
                              <span className="flex items-center gap-2">
                                <Link size={14} /> {t("assignBacklog") || "Assign backlog"}
                              </span>
                            ),
                            onClick: () => openAssign(item),
                          },
                          {
                            key: "edit",
                            label: (
                              <span className="flex items-center gap-2">
                                <Edit2 size={14} /> {t("edit") || "Edit"}
                              </span>
                            ),
                            onClick: () => openEdit(item),
                          },
                          {
                            key: "delete",
                            label: (
                              <span className="flex items-center gap-2 text-red-600">
                                <Trash2 size={14} /> {t("delete") || "Delete"}
                              </span>
                            ),
                            danger: true,
                            onClick: () => handleDelete(item),
                          },
                        ],
                      }}
                    >
                      <Button shape="circle" icon={<MoreVertical size={16} />} />
                    </Dropdown>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 p-6 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
          <p className="text-gray-600">
            {t("milestonesPlaceholder") || "Milestones view coming soon"}
          </p>
        </div>
      )}

      {!readOnly && (
      <Modal
        title={
          selectedMilestone
            ? t("editMilestone") || "Edit Milestone"
            : t("createMilestone") || "Create Milestone"
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => {
          setModalOpen(false);
          resetForm();
        }}
        okText={t("save") || "Save"}
        cancelText={t("cancel") || "Cancel"}
        destroyOnClose
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              {t("title") || "Title"}
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t("enterTitle") || "Enter title"}
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              {t("description") || "Description"}
            </label>
            <Input.TextArea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t("enterDescription") || "Enter description"}
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              {t("targetDate") || "Target date"}
            </label>
            <DatePicker
              className="w-full"
              value={form.targetDate}
              inputReadOnly
              disabledDate={(current) => current && current < dayjs().startOf("day")}
              onChange={(value) => setForm((prev) => ({ ...prev, targetDate: value }))}
            />
          </div>
          {selectedMilestone && (
            <>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">
                  {t("status") || "Status"}
                </label>
                <Select
                  value={form.status}
                  onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                  options={[
                    { value: "planned", label: "Planned" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "done", label: "Done" },
                  ]}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">
                  {t("completedAt") || "Completed at"}
                </label>
                <DatePicker
                  className="w-full"
                  value={form.completedAt}
                  inputReadOnly
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  onChange={(value) => setForm((prev) => ({ ...prev, completedAt: value }))}
                />
              </div>
            </>
          )}
        </div>
      </Modal>
      )}

      {!readOnly && (
        <Modal
          title={t("assignBacklog") || "Assign Backlog"}
          open={assignModalOpen}
          onOk={handleAssign}
          onCancel={() => setAssignModalOpen(false)}
          okText={t("save") || "Save"}
          cancelText={t("cancel") || "Cancel"}
          destroyOnClose
        >
          <div className="space-y-3">
            <label className="text-sm text-gray-700 mb-1 block">
              {t("backlogItems") || "Backlog items"}
            </label>
            <Select
              mode="multiple"
              className="w-full"
              value={assignBacklogIds}
              onChange={setAssignBacklogIds}
              options={backlogOptions}
              placeholder={t("selectItems") || "Select items"}
            />
            <p className="text-xs text-gray-500">
              {t("assignBacklogHint") || "Select backlog items to link with this milestone."}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

