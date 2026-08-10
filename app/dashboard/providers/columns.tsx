import { Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export function columns(
  handleEdit: (record: any) => void,
  handleDelete: (record: any) => void,
) {
  return [
    {
      title: "ABN",
      dataIndex: "abn",
      key: "abn",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Unit/Building",
      dataIndex: "unit_building",
      key: "unit_building",
    },
    {
      title: "Active",
      dataIndex: "deactivated_at",
      key: "active",
      render: (deactivated_at) =>
        !deactivated_at ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      fixed: "right",
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record.id)}>
            Edit
          </Button>
          <Button type="link" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];
}
