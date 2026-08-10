"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Card,
  Spin,
  Switch,
  message,
} from "antd";

import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { columns } from "./columns";
import FormDrawer from "../../../../components/Form-drawer";
import { userFormFields } from "./form";
import {
  createUser,
  deleteUser,
  editUser,
  getUserDetails,
  getUsers,
} from "@/services/user.service";

const initialState = {
  search: "",
  activeFilter: undefined,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "SET_ACTIVE":
      return { ...state, activeFilter: action.payload };

    case "RESET_FILTER":
      return {
        ...state,
        search: "",
        activeFilter: "",
      };

    default:
      return state;
  }
}

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [filters, dispatch] = useReducer(reducer, initialState);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [userDetails, setUserDetails] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsers();

      setData(result);
    } catch (error) {
      console.error(error);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (values: any) => {
    try {
      await editUser(userDetails.id, values);

      loadUsers();

      message.success("User updated successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to update provider");
    }
  };

  const handleGetUserDetails = async (id: string) => {
    setLoading(true);
    try {
      const result = await getUserDetails(id);
      setUserDetails({
        ...result,
        deactivated_at: !result.deactivated_at,
      });
      setIsEdit(true);
      setOpen(true);
      setLoading(false);
      return result;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      await createUser(values);
      loadUsers();

      message.success("User created successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to create user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);

      loadUsers();

      message.success("User deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete user");
    }
  };

  const resetFilter = () => {
    dispatch({ type: "RESET_FILTER" });
    loadUsers();
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...data];

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.full_name?.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    if (filters.activeFilter !== undefined) {
      filtered = filtered.filter(
        (item) => (item.deactivated_at === null) === filters.activeFilter,
      );
    }

    return filtered;
  }, [data, filters]);

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Card title="Users">
      <div
        style={{
          paddingBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Button
          icon={<PlusOutlined />}
          style={{ backgroundColor: "#1890ff", color: "white" }}
          onClick={() => setOpen(true)}
        >
          Add User
        </Button>
        <Button icon={<ReloadOutlined />} onClick={resetFilter}>
          Reset
        </Button>
      </div>
      <Space
        style={{
          marginBottom: 16,
          alignItems: "flex-end",
        }}
        wrap
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span className=" text-gray-600">Search Email, Full Name </span>
          <Input
            placeholder="Search Email, Full Name"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) =>
              dispatch({ type: "SET_SEARCH", payload: e.target.value })
            }
            style={{
              width: 400,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span className=" text-gray-600">Active </span>
          <Select
            placeholder="Active"
            value={filters.activeFilter}
            onChange={(value) =>
              dispatch({ type: "SET_ACTIVE", payload: value })
            }
            allowClear
            style={{
              width: 150,
            }}
            options={[
              {
                label: "Active",
                value: true,
              },
              {
                label: "Inactive",
                value: false,
              },
            ]}
          />
        </div>
      </Space>

      <Spin spinning={loading} description="Loading...">
        <Table
          rowKey="id"
          columns={columns(handleGetUserDetails, handleDeleteUser)}
          dataSource={filteredUsers}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 1280,
          }}
        />
        <FormDrawer
          title={isEdit ? "Edit User" : "Add User"}
          open={open}
          setOpen={setOpen}
          fields={userFormFields(isEdit)}
          onSubmit={isEdit ? handleEditUser : handleCreateUser}
          setIsEdit={setIsEdit}
          data={isEdit ? userDetails : undefined}
          hasPassword={true}
        />
      </Spin>
    </Card>
  );
}
