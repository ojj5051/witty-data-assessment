import { Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export function columns(
  handleEdit: (record: any) => void,
  handleDelete: (record: any) => void,
) {
  return [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Full Name",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Active",
      dataIndex: "deactivated_at",
      key: "deactivated_at",
      render: (deactivated_at: string | null) =>
        !deactivated_at ? (
          <CheckCircleOutlined style={{ color: "green" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "red" }} />
        ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
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
          {!record.is_default && (
            <Button type="link" onClick={() => handleDelete(record.id)}>
              Delete
            </Button>
          )}
        </>
      ),
    },
  ];
}
