"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { Table, Input, Select, Button, Space, Card, Spin, message } from "antd";

import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import FormDrawer from "../../../components/Form-drawer";
import { columns } from "./columns";
import {
  createParticipants,
  deleteParticipant,
  editParticipant,
  getParticipantById,
  getParticipants,
} from "@/services/participants.service";
import { participantFields } from "./form";
import { getPricingRegionDropdown } from "@/services/dropdown.service";
import dayjs from "dayjs";

const initialState = {
  search: "",
  genderFilter: 0,
  pricingRegionFilter: "",
  activeFilter: undefined,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "SET_GENDER":
      return { ...state, genderFilter: action.payload };

    case "SET_PRICING_REGION":
      return { ...state, pricingRegionFilter: action.payload };

    case "SET_ACTIVE":
      return { ...state, activeFilter: action.payload };

    case "RESET_FILTER":
      return {
        ...state,
        search: "",
        genderFilter: "",
        pricingRegionFilter: "",
        activeFilter: "",
      };

    default:
      return state;
  }
}

export default function ParticipantsPage() {
  const [data, setData] = useState([]);

  const [filters, dispatch] = useReducer(reducer, initialState);
  const [pricingRegionOptions, setPricingRegionOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [participantDetails, setParticipantDetails] = useState<any>(null);

  const loadParticipants = async () => {
    setLoading(true);
    const result = await getParticipants();

    setData(result);
    setLoading(false);
  };

  const handleGetParticipantDetails = async (id: string) => {
    setLoading(true);
    const result = await getParticipantById(id);
    setParticipantDetails({
      ...result,
      dob: result.dob ? dayjs(result.dob) : null,
      deactivated_at: !result.deactivated_at,
    });
    setIsEdit(true);
    setOpen(true);
    setLoading(false);
    return result;
  };

  const handleDeleteParticipant = async (id: string) => {
    try {
      setLoading(true);
      await deleteParticipant(id);
      message.success("Participant deleted successfully");
      loadParticipants();
    } catch (error) {
      console.error("Error deleting participant", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDropdown = async () => {
      try {
        const result = await getPricingRegionDropdown();

        setPricingRegionOptions(
          result.map((item) => ({
            label: item.label,
            value: item.code,
          })),
        );
      } catch (error) {
        console.error("Error loading dropdown", error);
      }
    };

    loadDropdown();
  }, []);

  const handleCreateParticipant = async (values: any) => {
    try {
      setLoading(true);
      await createParticipants(values);

      message.success("Participant created successfully");
      loadParticipants();
    } catch (error) {
      console.error("Error creating participant", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditParticipant = async (values: any) => {
    try {
      setLoading(true);
      await editParticipant(participantDetails.id, values);

      message.success("Participant edited successfully");
      loadParticipants();
    } catch (error) {
      console.error("Error editing participant", error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => {
    dispatch({ type: "RESET_FILTER" });
    loadParticipants();
  };

  const filteredParticipants = useMemo(() => {
    let filtered = [...data];

    if (filters.search) {
      filtered = filtered.filter((item) =>
        item.invoice_number
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()),
      );
    }

    if (filters.genderFilter) {
      filtered = filtered.filter(
        (item) => item.gender_id === filters.genderFilter,
      );
    }

    if (filters.pricingRegionFilter) {
      filtered = filtered.filter(
        (item) => item.pricing_region === filters.pricingRegionFilter,
      );
    }

    if (filters.activeFilter !== undefined) {
      filtered = filtered.filter(
        (item) => item.active === filters.activeFilter,
      );
    }

    return filtered;
  }, [data, filters]);

  useEffect(() => {
    loadParticipants();
  }, []);

  return (
    <Card title="Participants">
      <Space
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
          Add Participants
        </Button>
        <Button icon={<ReloadOutlined />} onClick={resetFilter}>
          Reset
        </Button>
      </Space>
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
          <span className=" text-gray-600">
            Search First Name, Last Name, NDIS number, Email{" "}
          </span>
          <Input
            placeholder="Search First Name, Last Name, NDIS number, Email"
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
          <span className=" text-gray-600">Gender </span>
          <Select
            placeholder="Gender"
            allowClear
            value={filters.genderFilter}
            onChange={(value) =>
              dispatch({ type: "SET_GENDER", payload: value })
            }
            style={{
              width: 150,
            }}
            options={[
              {
                label: "All",
                value: 0,
              },
              {
                label: "Male",
                value: 1,
              },
              {
                label: "Female",
                value: 2,
              },
            ]}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span className=" text-gray-600">Pricing Region </span>
          <Select
            placeholder="Pricing Region"
            allowClear
            value={filters.pricingRegionFilter}
            onChange={(value) =>
              dispatch({ type: "SET_PRICING_REGION", payload: value })
            }
            style={{
              width: 150,
            }}
            options={pricingRegionOptions}
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
            allowClear
            value={filters.activeFilter}
            onChange={(value) =>
              dispatch({ type: "SET_ACTIVE", payload: value })
            }
            style={{
              width: 150,
            }}
            options={[
              {
                label: "All",
                value: undefined,
              },
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

      {/* Table */}
      <Spin spinning={loading} description="Loading...">
        <Table
          rowKey="id"
          columns={columns(
            handleGetParticipantDetails,
            handleDeleteParticipant,
          )}
          dataSource={filteredParticipants}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 1280,
          }}
        />
        <FormDrawer
          title={isEdit ? "Edit Participant" : "Add Participant"}
          open={open}
          setOpen={setOpen}
          fields={participantFields(pricingRegionOptions)}
          onSubmit={isEdit ? handleEditParticipant : handleCreateParticipant}
          setIsEdit={setIsEdit}
          data={isEdit ? participantDetails : undefined}
        />
      </Spin>
    </Card>
  );
}
