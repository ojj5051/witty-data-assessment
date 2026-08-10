import { Input, Select, Switch } from "antd";

export const userFormFields = [
  {
    name: "email",
    label: "Email",
    rules: [{ required: true }],
    component: <Input placeholder="Email" type="email" />,
  },
  {
    name: "full_name",
    label: "Full Name",
    rules: [{ required: true }],
    component: <Input placeholder="Full Name" />,
  },
  {
    name: "role_id",
    label: "Role",
    rules: [{ required: true }],
    component: (
      <Select
        placeholder="Select Role"
        options={[
          { value: 1, label: "Super Admin" },
          { value: 2, label: "Billing Officer" },
          { value: 3, label: "Date Entry" },
          { value: 4, label: "Auditor" },
        ]}
      />
    ),
  },
  {
    name: "deactivated_at",
    label: "Active",
    valuePropName: "checked",
    getValueProps: (value) => {
      return {
        checked: !value,
      };
    },
    component: <Switch />,
  },
];
