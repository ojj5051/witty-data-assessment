import { pricingRegions } from "@/constants/pricing-regions";
import { Input, DatePicker, Select, Switch } from "antd";

export const invoiceFields = [
  {
    name: "first_name",
    label: "First Name",
    rules: [
      {
        required: true,
        validator: (_, value) =>
          value?.trim()
            ? Promise.resolve()
            : Promise.reject("First name is required"),
      },
    ],
    component: <Input placeholder="First Name" />,
  },
  {
    name: "last_name",
    label: "Last Name",
    rules: [
      {
        required: true,
        validator: (_, value) =>
          value?.trim()
            ? Promise.resolve()
            : Promise.reject("Last name is required"),
      },
    ],
    component: <Input placeholder="Last Name" />,
  },
  {
    name: "gender_id",
    label: "Gender",
    rules: [
      {
        required: true,
        message: "Gender is required",
      },
    ],
    component: (
      <Select
        options={[
          { label: "Male", value: 1 },
          { label: "Female", value: 2 },
        ]}
      />
    ),
  },
  {
    name: "dob",
    label: "Date of Birth",
    rules: [
      {
        required: true,
        message: "Date of birth is required",
      },
    ],
    component: <DatePicker placeholder="Date of Birth" />,
  },
  {
    name: "ndis_number",
    label: "NDIS Number",
    rules: [
      {
        required: true,
        message: "NDIS number is required",
      },
      {
        pattern: /^\d{1,16}$/,
        message: "NDIS number must contain digits only and max 16 digits",
      },
    ],
    component: <Input placeholder="NDIS Number" />,
  },
  {
    name: "email",
    label: "Email",
    rules: [
      {
        required: true,
        message: "Email is required",
      },
      {
        type: "email",
        message: "Please enter a valid email address",
      },
    ],
    component: <Input placeholder="Email" />,
  },
  {
    name: "phone_number",
    label: "Phone Number",
    rules: [
      {
        pattern: /^\d{3,16}$/,
        message: "Phone number must contain 3-16 digits",
      },
    ],
    component: <Input placeholder="Phone Number" />,
  },
  {
    name: "address",
    label: "Address",
    rules: [
      {
        validator: (_, value) =>
          value?.trim()
            ? Promise.resolve()
            : Promise.reject("Address is required"),
      },
    ],
    component: <Input placeholder="Address" />,
  },
  {
    name: "unit_building",
    label: "Unit/Building",
    rules: [
      {
        validator: (_, value) => {
          if (!value) return Promise.resolve();

          return value.trim()
            ? Promise.resolve()
            : Promise.reject("Unit/Building cannot be empty");
        },
      },
    ],
    component: <Input placeholder="Unit/Building" />,
  },
  {
    name: "pricing_region",
    label: "Pricing Region",
    rules: [{ required: true }],
    component: (
      <Select
        options={pricingRegions.map((item) => ({
          label: item.label,
          value: item.code,
        }))}
      />
    ),
  },
  {
    name: "active",
    label: "Active",
    component: <Switch defaultChecked />,
  },
];
