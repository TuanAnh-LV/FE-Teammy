import React, { useState } from "react";
import { Card, Select, DatePicker, Button, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const Reports = () => {
  const [filters, setFilters] = useState({
    faculty: "Engineering",
    term: "Spring 2025",
    dateRange: "Last 30 days",
    customDate: null,
  });

  const data = [
    {
      key: 1,
      metric: "Groups",
      count: 55,
      description: "Total number of study groups formed",
    },
    {
      key: 2,
      metric: "Members",
      count: 437,
      description: "Total active members across all groups",
    },
    {
      key: 3,
      metric: "Topics",
      count: 15,
      description: "Number of unique study topics",
    },
  ];

  const columns = [
    {
      title: "Metric",
      dataIndex: "metric",
      key: "metric",
      render: (text) => (
        <span className="font-semibold text-gray-800">{text}</span>
      ),
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      render: (num) => (
        <span className="text-[#FF7A00] font-semibold">{num}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="inline-block text-4xl font-extrabold"
            style={{
              backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Report & Export
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor system activities and user actions
          </p>
        </div>

        <Button
          icon={<UploadOutlined />}
          className="!border-gray-300 hover:!border-blue-400 transition-all"
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6">
        <Card
          className="shadow-sm border-gray-100 rounded-lg"
          bodyStyle={{ padding: "20px 24px" }}
        >
          <h3 className="font-semibold text-gray-800 mb-3">Report Filters</h3>
          <p className="text-gray-500 text-sm mb-4">
            Customize the scope and timeframe for your reports
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Faculty</p>
              <Select
                value={filters.faculty}
                onChange={(v) => setFilters({ ...filters, faculty: v })}
                className="w-full"
              >
                <Option>Engineering</Option>
                <Option>Business</Option>
                <Option>Information Systems</Option>
              </Select>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Term</p>
              <Select
                value={filters.term}
                onChange={(v) => setFilters({ ...filters, term: v })}
                className="w-full"
              >
                <Option>Spring 2025</Option>
                <Option>Fall 2024</Option>
                <Option>Summer 2024</Option>
              </Select>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Date Range</p>
              <Select
                value={filters.dateRange}
                onChange={(v) => setFilters({ ...filters, dateRange: v })}
                className="w-full"
              >
                <Option>Last 7 days</Option>
                <Option>Last 30 days</Option>
                <Option>Last 90 days</Option>
              </Select>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Custom Date</p>
              <DatePicker
                placeholder="mm/dd/yyyy"
                onChange={(date) =>
                  setFilters({ ...filters, customDate: date })
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
          <h3 className="font-semibold text-gray-800 mb-3">Report Summary</h3>
          <p className="text-gray-500 text-sm mb-4">
            Filter:{" "}
            <span className="font-medium text-gray-700">{filters.faculty}</span>
          </p>

          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            className="rounded-lg mb-6"
            style={{ backgroundColor: "white" }}
          />

          {/* Additional Insights */}
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-1">Additional Insights</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Average group size: 6 members</li>
              <li>Groups per topic: 4</li>
              <li>Member engagement rate: 94.2% active in last 30 days</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
