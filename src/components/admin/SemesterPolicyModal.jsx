import React from "react";
import { Modal, Form, DatePicker, InputNumber } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";

const SemesterPolicyModal = ({
  open,
  form,
  onSubmit,
  onCancel,
  okLoading = false,
  width = 700,
  semester = null,
}) => {
  const { t } = useTranslation();

  const handleSubmit = async () => {
    try {
      await onSubmit();
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      // Map các field name từ error message
      const fieldMapping = {
        teamSelfSelectStart: /teamselfselectstart|team self-select start/i,
        teamSelfSelectEnd: /teamselfselectend|team self-select end/i,
        teamSuggestStart: /teamsuggeststart|team suggest start/i,
        topicSelfSelectStart: /topicselfselectstart|topic self-select start/i,
        topicSelfSelectEnd: /topicselfselectend|topic self-select end/i,
        topicSuggestStart: /topicsuggeststart|topic suggest start/i,
        desiredGroupSizeMin: /desiredgroupsizemin|desired group size min/i,
        desiredGroupSizeMax: /desiredgroupsizemax|desired group size max/i,
      };

      // Tìm field tương ứng với lỗi
      let matchedField = null;
      for (const [field, pattern] of Object.entries(fieldMapping)) {
        if (pattern.test(errorMessage)) {
          matchedField = field;
          break;
        }
      }

      // Hiển thị lỗi dưới field tương ứng hoặc field đầu tiên
      if (matchedField) {
        form.setFields([
          {
            name: matchedField,
            errors: [errorMessage],
          },
        ]);
      } else {
        // Nếu không match được field cụ thể, hiển thị ở field đầu tiên
        form.setFields([
          {
            name: "teamSelfSelectStart",
            errors: [errorMessage],
          },
        ]);
      }
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <SettingOutlined />
          <span>{t("semesterPolicy") || "Semester Policy"}</span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={t("save") || "Save"}
      cancelText={t("cancel") || "Cancel"}
      confirmLoading={okLoading}
      okButtonProps={{
        className: "!bg-[#FF7A00] hover:!opacity-90 !text-white !border-none",
      }}
      cancelButtonProps={{
        className:
          "!border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all",
      }}
      width={width}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={t("teamSelfSelectStart") || "Team Self-Select Start"}
            name="teamSelfSelectStart"
            rules={[
              { required: true, message: "Please select start date" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (semester?.year && value.year() !== semester.year) {
                    return Promise.reject(
                      new Error("TeamSelfSelectStart must be semester year.")
                    );
                  }
                  if (
                    semester?.startDate &&
                    value.isAfter(dayjs(semester.startDate), "day")
                  ) {
                    return Promise.reject(
                      new Error(
                        t("dateMustBeBeforeSemesterStart") ||
                          "Date must be before semester start date"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                if (!current) return false;
                if (semester?.year && current.year() !== semester.year) {
                  return true;
                }
                if (semester?.startDate) {
                  return current.isAfter(dayjs(semester.startDate), "day");
                }
                return false;
              }}
            />
          </Form.Item>

          <Form.Item
            label={t("teamSelfSelectEnd") || "Team Self-Select End"}
            name="teamSelfSelectEnd"
            rules={[
              { required: true, message: "Please select end date" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (semester?.year && value.year() !== semester.year) {
                    return Promise.reject(
                      new Error("TeamSelfSelectEnd must be semester year.")
                    );
                  }
                  const startDate = form.getFieldValue("teamSelfSelectStart");
                  if (startDate && value.isBefore(startDate, "day")) {
                    return Promise.reject(
                      new Error(
                        t("endDateCannotBeBeforeStartDate") ||
                          "End date cannot be before start date"
                      )
                    );
                  }
                  if (
                    semester?.startDate &&
                    value.isAfter(dayjs(semester.startDate), "day")
                  ) {
                    return Promise.reject(
                      new Error(
                        t("dateMustBeBeforeSemesterStart") ||
                          "Date must be before semester start date"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                if (!current) return false;
                if (semester?.year && current.year() !== semester.year) {
                  return true;
                }
                if (semester?.startDate) {
                  return current.isAfter(dayjs(semester.startDate), "day");
                }
                return false;
              }}
            />
          </Form.Item>
        </div>

        <Form.Item
          label={t("teamSuggestStart") || "Team Suggest Start"}
          name="teamSuggestStart"
          rules={[
            { required: true, message: "Please select date" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (semester?.year && value.year() !== semester.year) {
                  return Promise.reject(
                    new Error("TeamSuggestStart must be semester year.")
                  );
                }
                if (
                  semester?.startDate &&
                  value.isAfter(dayjs(semester.startDate), "day")
                ) {
                  return Promise.reject(
                    new Error(
                      t("dateMustBeBeforeSemesterStart") ||
                        "Date must be before semester start date"
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              if (!current) return false;
              if (semester?.year && current.year() !== semester.year) {
                return true;
              }
              if (semester?.startDate) {
                return current.isAfter(dayjs(semester.startDate), "day");
              }
              return false;
            }}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={t("topicSelfSelectStart") || "Topic Self-Select Start"}
            name="topicSelfSelectStart"
            rules={[
              { required: true, message: "Please select start date" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (semester?.year && value.year() !== semester.year) {
                    return Promise.reject(
                      new Error("TopicSelfSelectStart must be semester year.")
                    );
                  }
                  if (
                    semester?.startDate &&
                    value.isAfter(dayjs(semester.startDate), "day")
                  ) {
                    return Promise.reject(
                      new Error(
                        t("dateMustBeBeforeSemesterStart") ||
                          "Date must be before semester start date"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                if (!current) return false;
                if (semester?.year && current.year() !== semester.year) {
                  return true;
                }
                if (semester?.startDate) {
                  return current.isAfter(dayjs(semester.startDate), "day");
                }
                return false;
              }}
            />
          </Form.Item>

          <Form.Item
            label={t("topicSelfSelectEnd") || "Topic Self-Select End"}
            name="topicSelfSelectEnd"
            rules={[
              { required: true, message: "Please select end date" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (semester?.year && value.year() !== semester.year) {
                    return Promise.reject(
                      new Error("TopicSelfSelectEnd must be semester year.")
                    );
                  }
                  const startDate = form.getFieldValue("topicSelfSelectStart");
                  if (startDate && value.isBefore(startDate, "day")) {
                    return Promise.reject(
                      new Error(
                        t("endDateCannotBeBeforeStartDate") ||
                          "End date cannot be before start date"
                      )
                    );
                  }
                  if (
                    semester?.startDate &&
                    value.isAfter(dayjs(semester.startDate), "day")
                  ) {
                    return Promise.reject(
                      new Error(
                        t("dateMustBeBeforeSemesterStart") ||
                          "Date must be before semester start date"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                if (!current) return false;
                if (semester?.year && current.year() !== semester.year) {
                  return true;
                }
                if (semester?.startDate) {
                  return current.isAfter(dayjs(semester.startDate), "day");
                }
                return false;
              }}
            />
          </Form.Item>
        </div>

        <Form.Item
          label={t("topicSuggestStart") || "Topic Suggest Start"}
          name="topicSuggestStart"
          rules={[
            { required: true, message: "Please select date" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (semester?.year && value.year() !== semester.year) {
                  return Promise.reject(
                    new Error("TopicSuggestStart must be semester year.")
                  );
                }
                if (
                  semester?.startDate &&
                  value.isAfter(dayjs(semester.startDate), "day")
                ) {
                  return Promise.reject(
                    new Error(
                      t("dateMustBeBeforeSemesterStart") ||
                        "Date must be before semester start date"
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              if (!current) return false;
              if (semester?.year && current.year() !== semester.year) {
                return true;
              }
              if (semester?.startDate) {
                return current.isAfter(dayjs(semester.startDate), "day");
              }
              return false;
            }}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={t("desiredGroupSizeMin") || "Desired Group Size Min"}
            name="desiredGroupSizeMin"
            rules={[{ required: true, message: "Please enter min size" }]}
          >
            <InputNumber min={1} max={20} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label={t("desiredGroupSizeMax") || "Desired Group Size Max"}
            name="desiredGroupSizeMax"
            rules={[{ required: true, message: "Please enter max size" }]}
          >
            <InputNumber min={1} max={50} style={{ width: "100%" }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default SemesterPolicyModal;
