import React, { useState, useEffect } from "react";
import { Card, Select, DatePicker, Button, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "../../hook/useTranslation";
import { MajorService } from "../../services/major.service";
import { SemesterService } from "../../services/semester.service";
import { AdminService } from "../../services/admin.service";
import { notification } from "antd";
const { Option } = Select;

const Reports = () => {
  const { t } = useTranslation();

  const [majors, setMajors] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [filters, setFilters] = useState({
    majorId: null,
    semesterId: null,
    startDate: null,
    endDate: null,
  });
  const [reportFilter, setReportFilter] = useState(null);
  const [reportMetrics, setReportMetrics] = useState([]);

  // Gọi API lấy major + semester
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // majors
        const majorRes = await MajorService.getMajors();
        const majorList = majorRes?.data || majorRes || [];
        setMajors(majorList);

        // semesters
        const semesterRes = await SemesterService.list();
        const semesterList = semesterRes?.data || semesterRes || [];
        setSemesters(semesterList);

        // set default nếu có dữ liệu
        if (majorList.length && !filters.majorId) {
          filters.majorId = majorList[0].id;
        }
        if (semesterList.length && !filters.semesterId) {
          filters.semesterId = semesterList[0].id;
        }
        setFilters({ ...filters });
      } catch (err) {
        console.error("Failed to fetch majors/semesters", err);
      }
    };

    fetchFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    try {
      if (!filters.semesterId || !filters.majorId) {
        notification.warning({
          message: "Please select semester and major first",
        });
        return;
      }

      const payload = {
        semesterId: filters.semesterId,
        majorId: filters.majorId,
        startDate: filters.startDate
          ? filters.startDate.format("YYYY-MM-DD")
          : null,
        endDate: filters.endDate ? filters.endDate.format("YYYY-MM-DD") : null,
      };

      const res = await AdminService.exportReport(payload, true);

      let blob = res;
      let fileName = "teammy-report.xlsx";
      if (res && res.data) {
        blob = res.data;

        const disposition =
          res.headers?.["content-disposition"] ||
          res.headers?.["Content-Disposition"];

        if (disposition) {
          const match = disposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1].replace(/['"]/g, ""));
          }
        }
      }

      const url = window.URL.createObjectURL(
        new Blob([blob], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      notification.error({ message: "Export report failed" });
    }
  };

  useEffect(() => {
    const fetchReportOptions = async () => {
      if (!filters.semesterId || !filters.majorId) return;

      try {
        const res = await AdminService.getReportOptions(
          {
            semesterId: filters.semesterId,
            majorId: filters.majorId,
          },
          true
        );

        const payload = res?.data || res || {};
        setReportFilter(payload.filter || null);
        setReportMetrics(payload.metrics || []);
      } catch (err) {
        console.error("Failed to fetch report options", err);
      }
    };

    fetchReportOptions();
  }, [filters.semesterId, filters.majorId]);

  const selectedSemester = semesters.find(
    (s) => s.semesterId === filters.semesterId
  );

  const desiredMin = selectedSemester?.policy?.desiredGroupSizeMin;
  const desiredMax = selectedSemester?.policy?.desiredGroupSizeMax;

  // Nếu muốn có “average group size” thì:
  const averageGroupSize =
    desiredMin && desiredMax
      ? ((desiredMin + desiredMax) / 2).toFixed(1) // ví dụ 4–6 => 5.0
      : null;

  const columns = [
    {
      title: t("metric"),
      dataIndex: "metric",
      key: "metric",
      render: (text) => (
        <span className="font-semibold text-gray-800">{text}</span>
      ),
    },
    {
      title: t("count"),
      dataIndex: "count",
      key: "count",
      render: (num) => (
        <span className="text-[#FF7A00] font-semibold">{num}</span>
      ),
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="inline-block text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            {t("reportAndExport")}
          </h1>
        </div>

        <Button
          icon={<UploadOutlined />}
          onClick={handleExport}
          className="!border-gray-300 hover:!border-orange-400  hover:!text-orange-400 transition-all !py-5"
        >
          <span className="hidden sm:inline">{t("exportCSV")}</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6">
        <Card
          className="shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <h3 className="font-semibold text-gray-800 mb-3">
            {t("reportFilters")}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {t("customizeScopeAndTimeframe")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Major */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("major")}</p>
              <Select
                value={filters.majorId}
                onChange={(v) => setFilters({ ...filters, majorId: v })}
                className="w-full"
                placeholder={t("selectMajor")}
                allowClear
              >
                {majors.map((m) => (
                  <Option key={m.majorId} value={m.majorId}>
                    {m.majorName}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Term / Semester */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("term")}</p>
              <Select
                value={filters.semesterId}
                onChange={(v) => setFilters({ ...filters, semesterId: v })}
                className="w-full"
                placeholder={t("selectSemester")}
                allowClear
              >
                {semesters.map((s) => (
                  <Option key={s.semesterId} value={s.semesterId}>
                    {/* Ví dụ: FALL 2025 (Active) */}
                    {`${s.season} ${s.year}${s.isActive ? " (Active)" : ""}`}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("startDate")}</p>
              <DatePicker
                placeholder="mm/dd/yyyy"
                value={filters.startDate}
                onChange={(date) =>
                  setFilters({
                    ...filters,
                    startDate: date,
                  })
                }
                className="w-full"
              />
            </div>

            {/* End Date */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("endDate")}</p>
              <DatePicker
                placeholder="mm/dd/yyyy"
                value={filters.endDate}
                onChange={(date) =>
                  setFilters({
                    ...filters,
                    endDate: date,
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Report Summary */}
        <Card
          className="shadow-sm border-gray-100 rounded-lg mt-2"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <h3 className="font-semibold text-gray-800 mb-3">
            {t("reportSummary")}
          </h3>

          {reportFilter && (
            <p className="text-gray-500 text-sm mb-4">
              {t("filter")}:{" "}
              <span className="font-medium text-gray-700">
                {reportFilter.semester} · {reportFilter.major}
              </span>
            </p>
          )}

          <Table
            columns={columns}
            dataSource={reportMetrics.map((m, idx) => ({
              key: idx,
              ...m,
            }))}
            pagination={false}
            bordered
            scroll={{ x: "max-content" }}
            className="rounded-lg mb-6"
            style={{ backgroundColor: "white" }}
          />

          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>
              {desiredMin && desiredMax
                ? `Recommended group size: ${desiredMin}-${desiredMax} members`
                : "Recommended group size: N/A"}
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
