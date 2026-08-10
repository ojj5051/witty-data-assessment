import { Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export function columns(
  handleEdit: (record: any) => void,
  handleDelete: (record: any) => void,
) {
  return [
    {
      title: "Participent",
      dataIndex: "client_id",
      key: "client_id",
    },
    {
      title: "Provider",
      dataIndex: "provider_id",
      key: "provider_id",
    },
    {
      title: "Invoice Number",
      dataIndex: "invoice_number",
      key: "invoice_number",
    },
    {
      title: "Source",
      dataIndex: "status",
      key: "status",
      render: (source) => {
        if (source === "drafted") {
          return "Drated";
        }
        if (source === "completed") {
          return "Uploaded";
        }
        return "-";
      },
    },
    {
      title: "Invoice Date",
      dataIndex: "invoice_date",
      key: "invoice_date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (amount ? `$${Number(amount).toFixed(2)}` : "-"),
    },
    {
      title: "Expected Amount",
      dataIndex: "expected_amount",
      key: "expected_amount",
      render: (expected_amount) =>
        expected_amount ? `$${Number(expected_amount).toFixed(2)}` : "-",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record.id)}>
            Edit
          </Button>

          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];
}
