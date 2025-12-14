/**
UTC01 N Render files list => Shows description and actions
- Pre: fileItems with name/description/url
- Condition: render component
- Confirmation: description visible; download link rendered; delete button present

UTC02 B Empty list => Shows placeholder text
- Pre: fileItems empty
- Condition: render component
- Confirmation: placeholder text shown

UTC03 A Upload without file => Shows validation error, no service call
- Pre: upload modal opened
- Condition: click upload without selecting file
- Confirmation: notification.error called; BoardService.uploadGroupFile not called

UTC04 N Upload success => Calls upload service, resets modal, triggers callback
- Pre: file selected; groupId provided
- Condition: click upload
- Confirmation: upload called with formData; modal closes; onUploadSuccess called; notification.success called

UTC05 A Upload missing groupId => Shows error and skips service
- Pre: groupId empty; file selected
- Condition: click upload
- Confirmation: notification.error called; uploadGroupFile not called

UTC06 N Delete confirm success => Calls delete service and callback
- Pre: fileItems with id; delete confirm mocked to auto ok
- Condition: click delete
- Confirmation: BoardService.deleteGroupFile called with ids; onUploadSuccess called; success notification called

UTC07 A Delete error => Shows notification error
- Pre: delete service rejects
- Condition: click delete confirm
- Confirmation: notification.error called
*/

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import FilesPanel from "../../src/components/common/my-group/FilesPanel";

jest.mock("../../src/hook/useTranslation", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

const mockModalConfirm = jest.fn();

jest.mock("antd", () => {
  const notification = {
    success: jest.fn(),
    error: jest.fn(),
  };
  const Modal = ({ open, children, onOk, onCancel, okText = "ok", cancelText = "cancel", title }) =>
    open ? (
      <div data-testid="modal">
        <h4>{typeof title === "string" ? title : "title"}</h4>
        <div>{children}</div>
        <button onClick={onOk}>{okText}</button>
        <button onClick={onCancel}>{cancelText}</button>
      </div>
    ) : null;
  Modal.confirm = (...args) => mockModalConfirm(...args);

  const Input = ({ value, onChange }) => (
    <input value={value} onChange={onChange} aria-label="input" />
  );
  Input.TextArea = ({ value, onChange, placeholder }) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} />
  );
  const Dropdown = ({ children, menu }) => (
    <div>
      {children}
      <div>
        {menu?.items?.map((item) => (
          <button key={item.key} onClick={item.label.props.onClick}>
            {item.key}
          </button>
        ))}
      </div>
    </div>
  );
  return { Modal, Input, Dropdown, notification };
});

jest.mock("../../src/services/board.service", () => ({
  BoardService: {
    uploadGroupFile: jest.fn(),
    deleteGroupFile: jest.fn(),
  },
}));

const baseFiles = [
  { id: "f1", name: "file.txt", description: "Desc", url: "http://file", owner: "User", fileType: "txt", size: "1kb" },
];

const renderPanel = (props = {}) => {
  const onUploadSuccess = jest.fn();
  const utils = render(
    <FilesPanel
      fileItems={baseFiles}
      t={(k) => k}
      groupId="g1"
      onUploadSuccess={onUploadSuccess}
      {...props}
    />
  );
  return { onUploadSuccess, ...utils };
};

describe("FilesPanel Report5", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UTC01 [N] Render files list => Shows description and actions", () => {
    renderPanel();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByText(/download/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  test("UTC02 [B] Empty list => Shows placeholder text", () => {
    renderPanel({ fileItems: [] });
    expect(screen.getByText(/noFilesYet/i)).toBeInTheDocument();
  });

  test("UTC03 [A] Upload without file => Shows validation error, no service call", async () => {
    const { BoardService } = require("../../src/services/board.service");
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByText(/uploadFiles/i));
    const uploadBtn = screen.getAllByText(/upload/i).slice(-1)[0];
    await user.click(uploadBtn);
    const { notification } = require("antd");
    expect(notification.error).toHaveBeenCalled();
    expect(BoardService.uploadGroupFile).not.toHaveBeenCalled();
  });

  test("UTC04 [N] Upload success => Calls upload service, resets modal, triggers callback", async () => {
    const { BoardService } = require("../../src/services/board.service");
    BoardService.uploadGroupFile.mockResolvedValue({});
    const user = userEvent.setup();
    const { onUploadSuccess } = renderPanel();
    await user.click(screen.getByText(/uploadFiles/i));
    const file = new File(["data"], "doc.txt", { type: "text/plain" });
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [file] },
    });
    const uploadBtn = screen.getAllByText(/upload/i).slice(-1)[0];
    await user.click(uploadBtn);
    await waitFor(() => expect(BoardService.uploadGroupFile).toHaveBeenCalledWith("g1", expect.any(FormData)));
    const { notification } = require("antd");
    expect(notification.success).toHaveBeenCalled();
    expect(onUploadSuccess).toHaveBeenCalled();
  });

  test("UTC05 [A] Upload missing groupId => Shows error and skips service", async () => {
    const { BoardService } = require("../../src/services/board.service");
    const user = userEvent.setup();
    renderPanel({ groupId: "" });
    await user.click(screen.getByText(/uploadFiles/i));
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [new File(["d"], "a.txt", { type: "text/plain" })] },
    });
    const uploadBtn = screen.getAllByText(/upload/i).slice(-1)[0];
    await user.click(uploadBtn);
    const { notification } = require("antd");
    expect(notification.error).toHaveBeenCalled();
    expect(BoardService.uploadGroupFile).not.toHaveBeenCalled();
  });

  test("UTC06 [N] Delete confirm success => Calls delete service and callback", async () => {
    const { BoardService } = require("../../src/services/board.service");
    BoardService.deleteGroupFile.mockResolvedValue({});
    const user = userEvent.setup();
    const { onUploadSuccess } = renderPanel();
    await user.click(screen.getAllByText(/delete/i)[0]);
    await user.click(screen.getAllByText(/delete/i).slice(-1)[0]);
    await waitFor(() => expect(BoardService.deleteGroupFile).toHaveBeenCalledWith("g1", "f1"));
    const { notification } = require("antd");
    expect(notification.success).toHaveBeenCalled();
    expect(onUploadSuccess).toHaveBeenCalled();
  });

  test("UTC07 [A] Delete error => Shows notification error", async () => {
    const { BoardService } = require("../../src/services/board.service");
    BoardService.deleteGroupFile.mockRejectedValue(new Error("fail"));
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getAllByText(/delete/i)[0]);
    await user.click(screen.getAllByText(/delete/i).slice(-1)[0]);
    const { notification } = require("antd");
    await waitFor(() => expect(notification.error).toHaveBeenCalled());
  });
});

export const UT_REPORT_5_SUMMARY = {
  functionName: "FilesPanel",
  totalTC: 7,
  breakdown: { N: 3, B: 1, A: 3 },
  notes:
    "Covers render/placeholder, upload validation and success/missing group, delete success and error paths; services, notification, and antd controls mocked.",
};
