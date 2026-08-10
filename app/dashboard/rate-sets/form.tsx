import { DatePicker, Input, Switch } from "antd";

export const rateSetFormFields = [
  {
    name: "name",
    label: "Name",
    rules: [{ required: true }],
    component: <Input placeholder="Name" />,
  },
  {
    name: "description",
    label: "Description",
    component: <Input placeholder="Description" />,
  },
  {
    name: "start_date",
    label: "Start Date",
    rules: [{ required: true }],
    component: <DatePicker placeholder="Start Date" />,
  },
  {
    name: "end_date",
    label: "End Date",
    rules: [{ required: true }],
    component: <DatePicker placeholder="End Date" />,
  },
  {
    name: "active",
    label: "Active",
    component: <Switch defaultChecked />,
  },
];
