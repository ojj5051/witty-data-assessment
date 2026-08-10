import { Input, Select, Switch } from "antd";

export const userFormFields = (isEdit: boolean) => [
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
  ...(!isEdit
    ? [
        {
          name: "password",
          label: "Password",
          rules: [
            {
              required: true,
              message: "Please enter new password",
            },
            {
              min: 8,
              message: "Password must be at least 8 characters",
            },
          ],
          component: <Input.Password placeholder="Enter new password" />,
        },
        {
          name: "confirm_password",
          label: "Confirm Password",
          rules: [
            {
              required: true,
              message: "Please confirm your password",
            },
            ({ getFieldValue }: { getFieldValue: any }) => ({
              validator(_: any, value: any) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ],
          component: <Input.Password placeholder="Confirm password" />,
        },
      ]
    : []),
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
