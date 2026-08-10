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
  DatePicker,
  message,
} from "antd";

import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { columns } from "./columns";
import FormDrawer from "../../../components/Form-drawer";
import EditFormDrawer from "../../../components/Form-drawer-rate-sets";
import { rateSetFormFields } from "./form";
import {
  createRateSet,
  deleteRateSet,
  getRateSetItems,
  getRateSets,
  uploadRateSet,
} from "@/services/rate-sets.service";
import dayjs from "dayjs";

const initialState = {
  search: "",
  period: "",
  activeFilter: undefined,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "SET_PERIOD":
      return { ...state, period: action.payload };

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

export default function RateSetsPage() {
  const [data, setData] = useState([]);
  const [file, setFile] = useState<File | null>(null);

  const [rateSetID, setRateSetID] = useState<string | undefined>(undefined);

  const [filters, dispatch] = useReducer(reducer, initialState);

  const { RangePicker } = DatePicker;

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const loadRateSets = async () => {
    setLoading(true);

    try {
      const result = await getRateSets();
      setData(
        result.map((item: any) => {
          return {
            ...item,
            deactivated_at: !item.deactivated_at,
          };
        }),
      );

    } catch (error) {
      message.error("Failed to load rate sets.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (rate_set_id: number) => {
    if (!file) {
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("rate_set_id", rate_set_id.toString());

    try {
      await uploadRateSet(formData);

      message.success("Excel uploaded successfully.");
    } catch (error: any) {
      console.log(error.message);
      message.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRateSet = async (values: any) => {
    try {
      const result = await createRateSet(values);
      await handleUpload(result.id);

      loadRateSets();

      message.success("Rate set created successfully.");
    } catch (error: any) {
      console.log(error.message);
      message.error(error.message || "Something went wrong.");
    }
  };

  const handleDeleteRateSet = async (id: string) => {
    try {
      await deleteRateSet(id);
      loadRateSets();
      message.success("Rate set deleted successfully.");
    } catch (error: any) {
       console.error(error);
      message.error(error.message || "Something went wrong.");
    }
  };

  const handleEditRateSet = async (rateSet_id: string) => {
    setLoading(true);
    setRateSetID(rateSet_id);
    setEditOpen(true);
  };

  const resetFilter = () => {
    dispatch({ type: "RESET_FILTER" });
    loadRateSets();
  };

  const filteredRateSets = useMemo(() => {
    let filtered = [...data];

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()),
      );
    }

    if (filters.period) {
      const [start, end] = filters.period;

      filtered = filtered.filter((item) => {
        const itemStart = dayjs(item.start_date, "DD-MM-YYYY");
        const itemEnd = dayjs(item.end_date, "DD-MM-YYYY");

        return (
          (itemStart.isAfter(start, "day") || itemStart.isSame(start, "day")) &&
          (itemEnd.isBefore(end, "day") || itemEnd.isSame(end, "day"))
        );
      });
    }

    if (filters.activeFilter !== undefined) {
      filtered = filtered.filter(
        (item) => (item.deactivated_at === null) === filters.activeFilter,
      );
    }

    return filtered;
  }, [data, filters]);

  useEffect(() => {
    loadRateSets();
  }, []);

  return (
    <Spin spinning={loading} description="Loading...">
      <Card title="Rate Sets">
        <div
          style={{
            paddingBottom: 16,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Button
            icon={<PlusOutlined />}
            style={{ backgroundColor: "#1890ff", color: "white" }}
            onClick={() => setOpen(true)}
          >
            Add Rate Set
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
            <span className=" text-gray-600">Name, Description</span>
            <Input
              placeholder="Search Name or Description"
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
            <span className="text-gray-600">Period</span>

            <RangePicker
              value={filters.period}
              onChange={(dates) =>
                dispatch({
                  type: "SET_PERIOD",
                  payload: dates,
                })
              }
              style={{
                width: 250,
              }}
              format="DD-MM-YYYY"
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
        <Table
          rowKey="id"
          columns={columns(handleEditRateSet, handleDeleteRateSet)}
          dataSource={filteredRateSets}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 1280,
          }}
        />
        {open && (
          <FormDrawer
            title="Add Rate Set"
            open={open}
            setOpen={setOpen}
            fields={rateSetFormFields}
            onSubmit={handleCreateRateSet}
            showUpload={true}
            setFile={setFile}
          />
        )}

        {editOpen && (
          <EditFormDrawer
            open={editOpen}
            setOpen={setEditOpen}
            rateSetID={rateSetID}
            setLoading={setLoading}
            loadRateSets={loadRateSets}
          />
        )}
      </Card>
    </Spin>
  );
}
