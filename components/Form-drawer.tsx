import { getRateSetItems, uploadRateSet } from "@/services/rate-sets.service";
import { changeUserPassword } from "@/services/user.service";
import { KeyOutlined, LockOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Space,
  Upload,
  message,
} from "antd";
import { useEffect, useState } from "react";

interface Field {
  name: string;
  label: string;
  rules?: any[];
  component: React.ReactNode;
}

interface FormDrawerProps {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  fields: Field[];
  onSubmit: (values: any) => void;
  onUpload?: () => void;
  setFile?: (file: File) => void;
  showUpload?: boolean;
  data?: any;
  isAuthSessions?: boolean;
  hasPassword?: boolean;
  setIsEdit?: (isEdit: boolean) => void;
}

export default function FormDrawer({
  title,
  open,
  setOpen,
  fields,
  onSubmit,
  setFile,
  showUpload = false,
  data,
  isAuthSessions = false,
  hasPassword = false,
  setIsEdit,
}: FormDrawerProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (data) {
      console.log(data)
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const closeDrawer = () => {
    setOpen(false);
    setFile?.(null);
    setFileList([]);
    setIsEdit?.(false);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    onSubmit(values);
    closeDrawer();
  };

  return (
    <Drawer
      title={title}
      placement="right"
      open={open}
      onClose={closeDrawer}
      footer={
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          {hasPassword && (
            <Button
              icon={<LockOutlined />}
              onClick={() => setChangePasswordOpen(true)}
            >
              Change Password
            </Button>
          )}
          <Button onClick={closeDrawer}>Cancel</Button>
          <Button
            type={isAuthSessions ? "default" : "primary"}
            style={{
              backgroundColor: isAuthSessions ? "#e43e53" : undefined,
              color: isAuthSessions ? "white" : undefined,
            }}
            onClick={() => {
              if (isAuthSessions) {
                onSubmit({ id: data.id });
                closeDrawer();
              } else {
                form.submit();
              }
            }}
          >
            {isAuthSessions ? "Delete" : "Save"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ active: true }}
      >
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules}
          >
            {field.component}
          </Form.Item>
        ))}
      </Form>
      {showUpload && (
        <div style={{ marginTop: 24 }}>
          <span>Upload NDIS Pricing Arrangements and Price Limits Excel</span>

          <div className="flex gap-2 mt-2">
            <Upload
              accept=".xlsx,.xls"
              maxCount={1}
              beforeUpload={(file) => {
                setFile?.(file);
                setFileList([file]);
                return false; // Prevent automatic upload
              }}
              onRemove={() => {
                setFile?.(null);
                setFileList([]);
              }}
              fileList={fileList}
            >
              <Button icon={<UploadOutlined />}>Select Excel</Button>
            </Upload>
          </div>
        </div>
      )}
      <Modal
        title="Change Password"
        open={changePasswordOpen}
        onCancel={() => setChangePasswordOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={async (values) => {
            try {
              await changeUserPassword(data.id, { password: values.password });

              message.success("Password changed successfully");

              setChangePasswordOpen(false);
            } catch (error: any) {
              message.error(
                error.response?.data?.message ||
                  error.message ||
                  "Failed to change password",
              );
            }
          }}
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              {
                required: true,
                message: "Please enter new password",
              },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
            ]}
          >
            <Input.Password placeholder="New Password" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please confirm your password",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>

            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </div>
        </Form>
      </Modal>
    </Drawer>
  );
}
