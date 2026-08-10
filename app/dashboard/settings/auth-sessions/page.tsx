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
  DatePicker,
} from "antd";

import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { columns } from "./columns";
import FormDrawer from "../../../../components/Form-drawer";
import { authSessionsFormFields } from "./form";
import {
  deleteAuthSession,
  getAuthSessionDetails,
  getAuthSessions,
  revokeAuthSession,
} from "@/services/auth-sessions.service";
import dayjs from "dayjs";
import { getRoleDropdown, getUserDropdown } from "@/services/dropdown.service";

const initialState = {
  userFilter: "",
  roleFilter: undefined,
  expireDateFilter: undefined,
  revokeDateFilter: undefined,
  createdAtFilter: undefined,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER_FILTER":
      return { ...state, userFilter: action.payload };

    case "SET_ROLE_FILTER":
      return { ...state, roleFilter: action.payload };

    case "SET_EXPIRE_AT_FILTER":
      return { ...state, expireDateFilter: action.payload };

    case "SET_REVOKE_AT_FILTER":
      return { ...state, revokeDateFilter: action.payload };

    case "SET_CREATED_AT_FILTER":
      return { ...state, createdAtFilter: action.payload };

    case "RESET_FILTER":
      return {
        ...state,
        userFilter: "",
        roleFilter: "",
        expireDateFilter: "",
        revokeDateFilter: "",
        createdAtFilter: "",
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
  const [authSessonDetails, setAuthSessionDetails] = useState(null);

  const [userDropdown, setUserDropdown] = useState([]);
  const [roleDropdown, setRoleDropdown] = useState([]);

  const { RangePicker } = DatePicker;

  const loadDropdown = async () => {
    const user = await getUserDropdown();
    const role = await getRoleDropdown();
    setUserDropdown(
      user.map((item) => ({
        label: item.full_name + " " + `(${item.email})`,
        value: item.id,
      })),
    );
    setRoleDropdown(
      role.map((item) => ({
        label: item.label,
        value: item.id,
      })),
    );
  };

  const loadAuthSessions = async () => {
    try {
      setLoading(true);
      const result = await getAuthSessions();
      setData(result);
    } catch (error) {
      console.error(error);
      message.error("Failed to load auth sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleGetAuthSessionDetails = async (id: string) => {
    setLoading(true);
    try {
      const result = await getAuthSessionDetails(id);
      setAuthSessionDetails({
        ...result,
        expires_at: result.expires_at
          ? dayjs(result.expires_at).format("YYYY-MM-DD HH:mm:ss")
          : null,
        revoked_at: result.revoked_at
          ? dayjs(result.revoked_at).format("YYYY-MM-DD HH:mm:ss")
          : null,
      });
      setOpen(true);
      setLoading(false);
      return result;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleRevokeAuthSessions = async (id: string) => {
    try {
      await revokeAuthSession(id);

      loadAuthSessions();

      message.success("Auth Session revoked successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to revoke session");
    }
  };

  const handleDeleteAuthSessions = async (values: any) => {
    try {
      await deleteAuthSession(values.id);

      loadAuthSessions();

      message.success("Auth Session deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete user");
    }
  };

  const resetFilter = () => {
    dispatch({ type: "RESET_FILTER" });
    loadAuthSessions();
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...data];

    if (filters.userFilter) {
      filtered = filtered.filter((item) =>
        item.user_name
          ?.toLowerCase()
          .includes(filters.userFilter.toLowerCase()),
      );
    }

    if (filters.roleFilter) {
      filtered = filtered.filter((item) => item.role_id === filters.roleFilter);
    }

    if (filters.expireDateFilter) {
      const [start, end] = filters.expireDateFilter;

      filtered = filtered.filter((item) => {
        const itemStart = dayjs(item.expires_at);
        const itemEnd = dayjs(item.expires_at);

        return (
          (itemStart.isAfter(start) || itemStart.isSame(start)) &&
          (itemEnd.isBefore(end) || itemEnd.isSame(end))
        );
      });
    }

    if (filters.revokeDateFilter) {
      const [start, end] = filters.revokeDateFilter;

      filtered = filtered.filter((item) => {
        const itemStart = dayjs(item.revoked_at);
        const itemEnd = dayjs(item.revoked_at);

        return (
          (itemStart.isAfter(start) || itemStart.isSame(start)) &&
          (itemEnd.isBefore(end) || itemEnd.isSame(end))
        );
      });
    }

    if (filters.createdAtFilter) {
      const [start, end] = filters.createdAtFilter;

      filtered = filtered.filter((item) => {
        const itemStart = dayjs(item.created_at);
        const itemEnd = dayjs(item.created_at);

        return (
          (itemStart.isAfter(start) || itemStart.isSame(start)) &&
          (itemEnd.isBefore(end) || itemEnd.isSame(end))
        );
      });
    }

    return filtered;
  }, [data, filters]);

  useEffect(() => {
    loadDropdown();
    loadAuthSessions();
  }, []);

  return (
    <Card title="Auth Sessions">
      <div
        style={{
          paddingBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Button icon={<ReloadOutlined />} onClick={resetFilter}>
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span className=" text-gray-600">Users </span>
          <Input
            placeholder="Search User"
            prefix={<SearchOutlined />}
            value={filters.userFilter}
            onChange={(e) =>
              dispatch({ type: "SET_USER_FILTER", payload: e.target.value })
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span className=" text-gray-600">Role </span>
          <Select
            placeholder="Select Role"
            options={roleDropdown}
            value={filters.roleFilter}
            allowClear
            onChange={(value) =>
              dispatch({ type: "SET_ROLE_FILTER", payload: value })
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span className=" text-gray-600">Expires At </span>
          <RangePicker
            value={filters.expireDateFilter}
            onChange={(value) =>
              dispatch({ type: "SET_EXPIRE_AT_FILTER", payload: value })
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span className=" text-gray-600">Revoked At </span>
          <RangePicker
            value={filters.revokeDateFilter}
            onChange={(value) =>
              dispatch({ type: "SET_REVOKE_AT_FILTER", payload: value })
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span className=" text-gray-600">Created At </span>
          <RangePicker
            value={filters.createdAtFilter}
            onChange={(value) =>
              dispatch({ type: "SET_CREATED_AT_FILTER", payload: value })
            }
          />
        </div>
      </div>
      
      <Spin spinning={loading} description="Loading...">
        <Table
          rowKey="id"
          columns={columns(
            handleGetAuthSessionDetails,
            handleRevokeAuthSessions,
          )}
          dataSource={filteredUsers}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 1280,
          }}
        />
        <FormDrawer
          title="View Auth Session"
          open={open}
          setOpen={setOpen}
          fields={authSessionsFormFields(userDropdown, roleDropdown)}
          onSubmit={handleDeleteAuthSessions}
          data={authSessonDetails}
          isAuthSessions={true}
        />
      </Spin>
    </Card>
  );
}
