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
import FormDrawer from "../../../components/Form-drawer";
import {
  createProvider,
  deleteProvider,
  editProvider,
  getProviderById,
  getProviders,
} from "@/services/provider.service";
import { providerFormFields } from "./form";

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

export default function ProvidersPage() {
  const [data, setData] = useState([]);
  const [filters, dispatch] = useReducer(reducer, initialState);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [providerDetails, setProviderDetails] = useState(null);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const result = await getProviders();
      setData(result);
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProvider = async (values: any) => {
    try {
      await editProvider(providerDetails.id, values);

      loadProviders();

      message.success("Provider updated successfully");
    } catch (error) {
      console.error(error.message);
      message.error(error.message);
    }
  };

  const getProviderDetail = async (id: string) => {
    setLoading(true);
    try {
      const result = await getProviderById(id);
      setProviderDetails({
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

  const handleCreateProvider = async (values: any) => {
    try {
      await createProvider(values);
      loadProviders();

      message.success("Provider created successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to create provider");
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      await deleteProvider(id);

      loadProviders();

      message.success("Provider deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete provider");
    }
  };

  const resetFilter = () => {
    dispatch({ type: "RESET_FILTER" });
    loadProviders();
  };

  const filteredProviders = useMemo(() => {
    let filtered = [...data];

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.abn?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.email?.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    if (filters.activeFilter !== undefined) {
      filtered = filtered.filter(
        (item) => !item.deactivated_at === filters.activeFilter,
      );
    }

    return filtered;
  }, [data, filters]);

  useEffect(() => {
    loadProviders();
  }, []);

  return (
    <Card title="Providers">
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
          Add Provider
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
          <span className=" text-gray-600">Search ABN, Name, Email </span>
          <Input
            placeholder="Search ABN, Name, Email"
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
          columns={columns(getProviderDetail, handleDeleteProvider)}
          dataSource={filteredProviders}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 1280,
          }}
        />
        <FormDrawer
          title={isEdit ? "Edit Provider" : "Add Provider"}
          open={open}
          setOpen={setOpen}
          fields={providerFormFields}
          onSubmit={isEdit ? handleEditProvider : handleCreateProvider}
          setIsEdit={setIsEdit}
          data={isEdit ? providerDetails : null}
        />
      </Spin>
    </Card>
  );
}
