import { Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export function columns(
  handleEdit: (record: any) => void,
  handleDelete: (record: any) => void,
) {
  return [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Gender",
      dataIndex: "gender_id",
      key: "gender_id",
      render: (gender_id) =>
        gender_id === 1 ? "Male" : gender_id === 2 ? "Female" : "Other",
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      key: "dob",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "NDIS Number",
      dataIndex: "ndis_number",
      key: "ndis_number",
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
      render: (phone_number) => {
        if (!phone_number) return "-";
        return phone_number;
      },
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
      render: (unit_building) => {
        if (!unit_building) return "-";
        return unit_building;
      },
    },
    {
      title: "Pricing Region",
      dataIndex: "pricing_region",
      key: "pricingRegion",
    },
    {
      title: "Active",
      dataIndex: "deactivated_at",
      key: "deactivated_at",
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
