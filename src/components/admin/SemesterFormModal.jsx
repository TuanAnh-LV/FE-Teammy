import React from "react";
import { Modal, Form, Input, DatePicker, InputNumber, Select } from "antd";
import { useTranslation } from "../../hook/useTranslation";
import dayjs from "dayjs";

const SemesterFormModal = ({
  open,
  mode = "create",
  form,
  onSubmit,
  onCancel,
  disableStartDate,
  disableEndDate,
  okLoading = false,
  width = 600,
  existingSemesters = [],
  currentSemesterId,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={
        mode === "create"
          ? t("createSemester") || "Create Semester"
          : t("editSemester") || "Edit Semester"
      }
      open={open}
      onOk={onSubmit}
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
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        onValuesChange={(changed) => {
          if (Object.prototype.hasOwnProperty.call(changed, "year")) {
            form.setFieldsValue({ startDate: null, endDate: null });
          }
        }}
      >
        <Form.Item
          label={t("season") || "Season"}
          name="season"
          rules={[
            {
              required: true,
              message: t("pleaseSelectSeason") || "Please select season",
            },
          ]}
        >
          <Select
            placeholder={t("pleaseSelectSeason") || "Please select season"}
          >
            <Select.Option value="Fall">{t("fall") || "Fall"}</Select.Option>
            <Select.Option value="Spring">
              {t("spring") || "Spring"}
            </Select.Option>
            <Select.Option value="Summer">
              {t("summer") || "Summer"}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("year") || "Year"}
          name="year"
          dependencies={["season"]}
          rules={[
            {
              required: true,
              message: t("pleaseEnterYear") || "Please enter year",
            },

            ({ getFieldValue }) => ({
              validator: (_, value) => {
                const season = getFieldValue("season");
                if (!value || !season) return Promise.resolve();

                const yearNum = Number(value);
                const seasonNorm = String(season).toLowerCase();

                const isDuplicate = (existingSemesters || []).some((s) => {
                  const sameSeason =
                    String(s.season || "").toLowerCase() === seasonNorm;
                  const sameYear = Number(s.year) === yearNum;
                  const notSelf =
                    !currentSemesterId || s.semesterId !== currentSemesterId;
                  return sameSeason && sameYear && notSelf;
                });

                if (isDuplicate) {
                  return Promise.reject(
                    new Error(
                      t("semesterAlreadyExists") ||
                        `Semester ${season} ${yearNum} already exists`
                    )
                  );
                }

                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label={t("startDate") || "Start Date"}
          name="startDate"
          rules={[
            {
              required: true,
              message: t("pleaseSelectStartDate") || "Please select start date",
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                const year = form.getFieldValue("year");
                if (year && value.year() !== year) {
                  return Promise.reject(
                    new Error(
                      t("startDateMustBeInYear") ||
                        `Start date must be in year ${year}`
                    )
                  );
                }

                if (value.isBefore(dayjs(), "day")) {
                  return Promise.reject(
                    new Error(
                      t("startDateCannotBeInThePast") ||
                        "Start date cannot be a past date"
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
            format="DD/MM/YYYY"
            disabledDate={disableStartDate}
          />
        </Form.Item>

        <Form.Item
          label={t("endDate") || "End Date"}
          name="endDate"
          rules={[
            {
              required: true,
              message: t("pleaseSelectEndDate") || "Please select end date",
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                const year = form.getFieldValue("year");
                if (year && value.year() !== year) {
                  return Promise.reject(
                    new Error(
                      t("endDateMustBeInYear") ||
                        `End date must be in year ${year}`
                    )
                  );
                }

                const startDate = form.getFieldValue("startDate");
                if (startDate && value.isBefore(startDate, "day")) {
                  return Promise.reject(
                    new Error(
                      t("endDateCannotBeBeforeStartDate") ||
                        "End date cannot be before start date"
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
            format="DD/MM/YYYY"
            disabledDate={disableEndDate}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SemesterFormModal;
