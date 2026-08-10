import { Input, Select, Switch } from "antd";

export const authSessionsFormFields = (
  userDropdown: any[],
  roleDropdown: any[],
) => [
  {
    name: "user_id",
    label: "User",
    rules: [{ required: true }],
    component: (
      <Select disabled placeholder="Select Role" options={userDropdown} />
    ),
  },
  {
    name: "role_id",
    label: "Role",
    rules: [{ required: true }],
    component: (
      <Select disabled placeholder="Select Role" options={roleDropdown} />
    ),
  },
  {
    name: "user_agent",
    label: "User Agent",
    rules: [{ required: true }],
    component: <Input placeholder="User Agent" disabled />,
  },
  {
    name: "ip",
    label: "IP",
    rules: [{ required: true }],
    component: <Input placeholder="IP" disabled />,
  },
  {
    name: "expires_at",
    label: "Expires At",
    rules: [{ required: true }],
    component: <Input placeholder="Expires At" disabled />,
  },
  {
    name: "revoked_at",
    label: "Revoked At",
    component: <Input placeholder="Revoked At" disabled />,
  },
];
