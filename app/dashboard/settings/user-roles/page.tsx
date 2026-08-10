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
import {
  createUserRole,
  deleteUserRole,
  editUserRole,
  getUserRoleDetails,
  getUserRoles,
} from "@/services/user-roles.service";
import UserRoleFormDrawer from "@/components/Form-drawer-user-roles";

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

export default function UserRolesPage() {
  const [data, setData] = useState([]);
  const [filters, dispatch] = useReducer(reducer, initialState);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const loadUserRoles = async () => {
    try {
      setLoading(true);
      const result = await getUserRoles();

      setData(result);
    } catch (error) {
      console.error(error);
      message.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserRole = async (values: any) => {
    try {
      await editUserRole(userDetails.id, values);

      loadUserRoles();

      message.success("User roles updated successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to update user role");
    }
  };

  const handleGetUserRoleDetails = async (id: string) => {
    setLoading(true);
    try {
      const result = await getUserRoleDetails(id);
      setUserDetails(result);
      setIsEdit(true);
      setOpen(true);
      setLoading(false);
      return result;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCreateUserRole = async (values: any) => {
    try {
      await createUserRole(values);

      loadUserRoles();
      setOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUserRole(id);

      loadUserRoles();

      message.success("User role deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete user role");
    }
  };

  const resetFilter = () => {
    dispatch({ type: "RESET_FILTER" });
    loadUserRoles();
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...data];

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.label?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.code?.toLowerCase().includes(filters.search.toLowerCase()),
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
    loadUserRoles();
  }, []);

  return (
    <Card title="User Roles">
      {/* Filters */}
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
          Add User Role
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
          <span className=" text-gray-600">Search Label, Code </span>
          <Input
            placeholder="Search Label, Code"
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
          columns={columns(handleGetUserRoleDetails, handleDeleteUser)}
          dataSource={filteredUsers}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 1280,
          }}
        />
        <UserRoleFormDrawer
          title={isEdit ? "Edit User Roles" : "Add User Roles"}
          open={open}
          setOpen={setOpen}
          onSubmit={isEdit ? handleEditUserRole : handleCreateUserRole}
          setIsEdit={setIsEdit}
          data={isEdit ? userDetails : undefined}
        />
      </Spin>
    </Card>
  );
}
