import { Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export function columns(
  handleEdit: (record: any) => void,
  handleDelete: (record: any) => void,
) {
  return [
    {
      title: "User",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "Role",
      dataIndex: "role_name",
      key: "role_name",
    },
    {
      title: "User Agent",
      dataIndex: "user_agent",
      key: "user_agent",
    },
    {
      title: "IP",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "Expires At",
      dataIndex: "expires_at",
      key: "expires_at",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Revoked At",
      dataIndex: "revoked_at",
      key: "revoked_at",
      render: (text: string | null) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
     {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string | null) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      fixed: "right",
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record.id)}>
            View
          </Button>
          {!record.is_default && (
            <Button type="link" onClick={() => handleDelete(record.id)}>
              Revoke
            </Button>
          )}
        </>
      ),
    },
  ];
}
