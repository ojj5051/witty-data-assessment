"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
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
import InvoiceFormDrawer from "../../../components/Form-drawer-invoice";
import { columns } from "./columns";
import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  editInvoice,
  getInvoiceById,
} from "@/services/invoices.service";
import {
  getParticipantDropdown,
  getProviderDropdown,
} from "@/services/dropdown.service";
import dayjs from "dayjs";

const initialState = {
  search: "",
  participantFilter: "",
  providerFilter: "",
  sourceFilter: "",
  invoiceDateFilter: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "SET_PROVIDER":
      return { ...state, providerFilter: action.payload };

    case "SET_PARTICIPANT":
      return { ...state, participantFilter: action.payload };

    case "SET_SOURCE":
      return { ...state, sourceFilter: action.payload };

    case "SET_DATE":
      return { ...state, invoiceDateFilter: action.payload };

    case "RESET_FILTER":
      return {
        ...state,
        search: "",
        participantFilter: "",
        providerFilter: "",
        sourceFilter: "",
        invoiceDateFilter: null,
      };

    default:
      return state;
  }
}

export default function InvoiceListPage() {
  const [data, setData] = useState([]);

  const [filters, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  const [participantsDropdown, setParticipantsDropdown] = useState([]);
  const [providersDropdown, setProvidersDropdown] = useState([]);

  useEffect(() => {
    const loadDropdown = async () => {
      try {
        const resultParticipant = await getParticipantDropdown();
        const resultProvider = await getProviderDropdown();

        const participantOptions = resultParticipant.map(
          (participant: any) => ({
            label: participant.name,
            value: participant.name,
          }),
        );

        const providerOptions = resultProvider.map((provider: any) => ({
          label: provider.name,
          value: provider.name,
        }));

        setParticipantsDropdown(participantOptions);
        setProvidersDropdown(providerOptions);
      } catch (error: any) {
        console.error(error.response.data.message);
      }
    };

    loadDropdown();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await getInvoices();
      setData(result);
    } catch (error: any) {
      console.error(error.response.data.message);
      message.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleGetInvoiceDetails = async (id: string) => {
    try {
      setLoading(true);

      const result = await getInvoiceById(id);

      if (result) {
        setInvoiceDetails({
          ...result,
          invoice_date: result.invoice_date ? dayjs(result.invoice_date) : null,
          items: result.items?.map((item) => ({
            ...item,
            start_date: item.start_date ? dayjs(item.start_date) : null,
            end_date: item.end_date ? dayjs(item.end_date) : null,
          })),
        });
        setIsEdit(true);
        setOpen(true);
      }

      return result;
    } catch (error: any) {
      console.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoice = async (invoiceData: any, id?: string) => {
    try {
      await editInvoice(id, invoiceData);
      loadInvoices();
      message.success("Invoice updated successfully");
    } catch (error: any) {
      console.error(error.response.data.message);
      message.error("Failed to update invoice");
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      setLoading(true);
      await deleteInvoice(id);
      loadInvoices();
    } catch (error: any) {
      console.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (values: any) => {
    setLoading(true);

    try {
      await createInvoice(values);
      loadInvoices();
      message.success("Invoice created successfully");
    } catch (error: any) {
      console.error(error.response.data.message);
      message.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => {
    dispatch({ type: "RESET_FILTER" });
    loadInvoices();
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

    if (filters.participantFilter) {
      filtered = filtered.filter(
        (item) => item.client_id === filters.participantFilter,
      );
    }

    if (filters.providerFilter) {
      filtered = filtered.filter(
        (item) => item.provider_id === filters.providerFilter,
      );
    }

    if (filters.sourceFilter) {
      filtered = filtered.filter(
        (item) => item.status === filters.sourceFilter,
      );
    }

    if (filters.invoiceDateFilter) {
      const dateStr = dayjs(filters.invoiceDateFilter).format("DD-MM-YYYY");
      filtered = filtered.filter((item) => item.invoice_date === dateStr);
    }

    return filtered;
  }, [data, filters]);

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <Spin spinning={loading} description="Loading...">
      <Card title="Invoices">
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
            type="primary"
            onClick={() => setOpen(true)}
          >
            Add Invoice
          </Button>

          <Button icon={<ReloadOutlined />} onClick={resetFilter}>
            Reset
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4 w-full">
          <div className="flex flex-col gap-2">
            <span className=" text-gray-600">Invoice Number </span>
            <Input
              placeholder="Invoice Number"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) =>
                dispatch({
                  type: "SET_SEARCH",
                  payload: e.target.value,
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className=" text-gray-600">Participant </span>
            <Select
              placeholder="Participant"
              allowClear
              value={filters.participantFilter}
              onChange={(value) =>
                dispatch({
                  type: "SET_PARTICIPANT",
                  payload: value,
                })
              }
              options={participantsDropdown}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className=" text-gray-600">Provider </span>
            <Select
              placeholder="Provider"
              allowClear
              value={filters.providerFilter}
              onChange={(value) =>
                dispatch({
                  type: "SET_PROVIDER",
                  payload: value,
                })
              }
              options={providersDropdown}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className=" text-gray-600">Invoice Date </span>
            <DatePicker
              placeholder="Invoice Date"
              allowClear
              value={filters.invoiceDateFilter}
              onChange={(value) =>
                dispatch({
                  type: "SET_DATE",
                  payload: value,
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className=" text-gray-600">Source </span>
            <Select
              placeholder="Source"
              allowClear
              value={filters.sourceFilter}
              onChange={(value) =>
                dispatch({
                  type: "SET_SOURCE",
                  payload: value,
                })
              }
              options={[
                {
                  label: "All",
                  value: "",
                },
                {
                  label: "Drafted",
                  value: "drafted",
                },
                {
                  label: "Uploaded",
                  value: "completed",
                },
              ]}
            />
          </div>
        </div>
        <Table
          rowKey="id"
          columns={columns(handleGetInvoiceDetails, handleDeleteInvoice)}
          dataSource={filteredParticipants}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 1280,
          }}
        />
        {open && (
          <InvoiceFormDrawer
            title={isEdit ? "Edit Invoice" : "Add Invoice"}
            open={open}
            setOpen={setOpen}
            onSubmit={isEdit ? handleUpdateInvoice : handleCreateInvoice}
            data={isEdit ? invoiceDetails : undefined}
            setIsEdit={setIsEdit}
          />
        )}
      </Card>
    </Spin>
  );
}
