"use client";

import React, { useEffect, useState } from "react";
import { Drawer, Form, Input, Switch, Button, Divider } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface UserRoleDrawerProps {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit?: (values: any) => void;
  data?: any;
  setIsEdit?: (value: boolean) => void;
}

const permissionGroups = [
  {
    key: "audit_logs",
    label: "Audit Logs",
    permissions: [
      {
        code: "audit_logs.read",
        label: "Read audit logs",
      },
    ],
  },
  {
    key: "auth_sessions",
    label: "Auth Sessions",
    permissions: [
      {
        code: "auth_sessions.delete",
        label: "Delete auth sessions",
      },
      {
        code: "auth_sessions.read",
        label: "Read auth sessions",
      },
      {
        code: "auth_sessions.revoke",
        label: "Revoke auth sessions",
      },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    permissions: [
      {
        code: "clients.write",
        label: "Add or Edit clients",
      },
      {
        code: "clients.delete",
        label: "Delete clients",
      },
      {
        code: "clients.read",
        label: "Read clients",
      },
    ],
  },
  {
    key: "genders",
    label: "Genders",
    permissions: [
      {
        code: "genders.write",
        label: "Add or Edit genders",
      },
      {
        code: "genders.delete",
        label: "Delete genders",
      },
      {
        code: "genders.read",
        label: "Read genders",
      },
    ],
  },
  {
    key: "invoices",
    label: "Invoices",
    permissions: [
      {
        code: "invoices.write",
        label: "Add or Edit invoices",
      },
      {
        code: "invoices.delete",
        label: "Delete invoices",
      },
      {
        code: "invoices.uploads.manage",
        label: "Manage all invoices uploads",
      },
      {
        code: "invoices.read",
        label: "Read invoices",
      },
    ],
  },
  {
    key: "providers",
    label: "Providers",
    permissions: [
      {
        code: "providers.write",
        label: "Add or Edit providers",
      },
      {
        code: "providers.delete",
        label: "Delete providers",
      },
      {
        code: "providers.read",
        label: "Read providers",
      },
    ],
  },
  {
    key: "rate_sets",
    label: "Rate Sets",
    permissions: [
      {
        code: "rate_sets.write",
        label: "Add or Edit rate sets",
      },
      {
        code: "rate_sets.delete",
        label: "Delete rate sets",
      },
      {
        code: "rate_sets.import",
        label: "Import rate sets",
      },
      {
        code: "rate_sets.read",
        label: "Read rate sets",
      },
    ],
  },
  {
    key: "user_roles",
    label: "User Roles",
    permissions: [
      {
        code: "user_roles.write",
        label: "Add or Edit user roles",
      },
      {
        code: "user_roles.delete",
        label: "Delete user roles",
      },
      {
        code: "user_roles.read",
        label: "Read user roles",
      },
    ],
  },
  {
    key: "users",
    label: "Users",
    permissions: [
      {
        code: "users.write",
        label: "Add or Edit users",
      },
      {
        code: "users.delete",
        label: "Delete users",
      },
      {
        code: "users.read",
        label: "Read users",
      },
    ],
  },
];

export default function UserRoleFormDrawer({
  title,
  open,
  setOpen,
  onSubmit,
  data,
  setIsEdit,
}: UserRoleDrawerProps) {
  const [form] = Form.useForm();
  const permissionGroupValues = Form.useWatch("permissions", form);

  const [selectedGroup, setSelectedGroup] = useState("audit_logs");
  const [permissionValues, setPermissionValues] = useState<
    Record<string, boolean>
  >({});

  const currentGroup = permissionGroups.find(
    (group) => group.key === selectedGroup,
  );

  const allPermissions = permissionGroups.flatMap((group) => group.permissions);

  const currentGroupAllChecked =
    currentGroup?.permissions?.length > 0 &&
    currentGroup?.permissions?.every(
      (permission) => permissionGroupValues?.[permission.code] === true,
    );

  const closeDrawer = () => {
    setOpen(false);
    setIsEdit?.(false);
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    try {
      const permissionCodes = Object.entries(permissionValues)
        .filter(([_, checked]) => checked)
        .map(([code]) => code);

      onSubmit?.({
        ...values,
        permissions: permissionCodes,
      });

      setOpen(false);
      form.resetFields();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!data) return;

    const values = Object.fromEntries(
      allPermissions.map((permission) => [
        permission.code,
        data.permissions.some((p: any) => p.code === permission.code),
      ]),
    );

    setPermissionValues(values);

    form.setFieldsValue({
      label: data.label,
      code: data.code,
      permissions: values,
    });
  }, [data, form]);

  return (
    <Drawer
      open={open}
      placement="right"
      size="100%"
      closable={false}
      mask={false}
      styles={{
        body: {
          padding: 0,
          background: "#111111",
        },
      }}
    >
      <div className="flex h-full flex-col bg-[#111111] text-white">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#222222] px-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center text-xl text-gray-400 hover:text-white"
            >
              <CloseOutlined />
            </button>

            <h2 className="m-0 text-[16px] font-semibold">{title}</h2>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={closeDrawer}
              className="h-9.5! border-[#333]! bg-[#111]! px-5! text-white!"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={form.submit}
              className="h-9.5! px-5!"
            >
              Save
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-7">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              active: true,
            }}
            onFinish={handleSave}
          >
            {/* Basic information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Form.Item
                name="label"
                label="Label"
                rules={[
                  {
                    required: true,
                    message: "Please enter label",
                  },
                ]}
              >
                <Input
                  placeholder="e.g., Billing Officer"
                  onChange={(e) => {
                    const code = e.target.value
                      .trim()
                      .toUpperCase()
                      .replace(/\s+/g, "_");

                    form.setFieldValue("code", code);
                  }}
                />
              </Form.Item>

              <Form.Item
                name="code"
                label="Code"
                rules={[
                  {
                    required: true,
                    message: "Please enter code",
                  },
                ]}
              >
                <Input placeholder="e.g., BILLING_OFFICER" />
              </Form.Item>

              <Form.Item name="active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item label="Set all permissions" valuePropName="checked">
                <Switch
                  onChange={(checked) => {
                    const permissionValues = Object.fromEntries(
                      permissionGroups
                        .flatMap((group) => group.permissions)
                        .map((permission) => [permission.code, checked]),
                    );

                    form.setFieldsValue({
                      permissions: permissionValues,
                    });
                  }}
                />
              </Form.Item>
            </div>

            {/* Permissions */}
            <div className="mt-4">
              <div className="mb-3 text-sm font-medium">Permissions</div>

              <div className="flex min-h-135 border-b border-[#333]">
                {/* Left menu */}
                <div className="w-38.75 shrink-0 border-r border-[#333]">
                  {permissionGroups.map((group) => {
                    const active = selectedGroup === group.key;

                    return (
                      <button
                        key={group.key}
                        type="button"
                        onClick={() => setSelectedGroup(group.key)}
                        className={`
                          relative flex w-full items-center
                          px-6 py-4.5
                          text-left text-sm
                          transition
                          ${
                            active
                              ? "text-[#1677ff]"
                              : "text-gray-200 hover:text-white"
                          }
                        `}
                      >
                        {active && (
                          <span className="absolute right-0 top-0 h-full w-0.75 bg-[#1677ff]" />
                        )}

                        {group.label}
                      </button>
                    );
                  })}
                </div>

                {/* Right permissions */}
                <div className="flex-1 px-7 pb-2">
                  <Form.Item label="Set all permissions">
                    <Switch
                      checked={currentGroupAllChecked}
                      onChange={(checked) => {
                        const currentPermissions =
                          form.getFieldValue("permissions") || {};

                        const updatedPermissions = {
                          ...currentPermissions,
                          ...Object.fromEntries(
                            (currentGroup?.permissions || []).map(
                              (permission) => [permission.code, checked],
                            ),
                          ),
                        };

                        form.setFieldValue("permissions", updatedPermissions);
                      }}
                    />
                  </Form.Item>
                  {currentGroup?.permissions.map((permission) => (
                    <div
                      key={permission.code}
                      className="mb-4 flex items-center justify-between rounded-lg border border-[#3a3a3a] bg-[#111111] px-4 py-4"
                    >
                      <div>
                        <div className="text-[16px] font-semibold text-white">
                          {permission.label}
                        </div>

                        <div className="mt-1 text-sm text-gray-500">
                          {permission.code}
                        </div>
                      </div>

                      <Form.Item
                        name={["permissions", permission.code]}
                        valuePropName="checked"
                        noStyle
                      >
                        <Switch
                          onChange={(checked) => {
                            setPermissionValues((prev) => ({
                              ...prev,
                              [permission.code]: checked,
                            }));
                          }}
                        />
                      </Form.Item>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Drawer>
  );
}
