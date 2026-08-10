import { Input, Switch } from "antd";

export const providerFormFields = [
  {
    name: "abn",
    label: "ABN",
    rules: [{ required: true }],
    component: <Input placeholder="ABN" />,
  },
  {
    name: "name",
    label: "Name",
    rules: [{ required: true }],
    component: <Input placeholder="Name" />,
  },
  {
    name: "email",
    label: "Email",
    component: <Input placeholder="Email" />,
  },
  {
    name: "phone_number",
    label: "Phone Number",
    component: <Input placeholder="Phone Number" />,
  },
  {
    name: "address",
    label: "Address",
    component: <Input placeholder="Address" />,
  },
  {
    name: "unit_building",
    label: "Unit/Building",
    component: <Input placeholder="Unit/Building" />,
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
    component: <Switch defaultChecked/>,
  },
];
