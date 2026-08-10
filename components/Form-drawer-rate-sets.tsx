"use client";

import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Slider,
  Space,
  Spin,
  Switch,
  Table,
  Upload,
} from "antd";
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import {
  getRateSet,
  getRateSetItems,
  updateRateSet,
  uploadRateSet,
} from "@/services/rate-sets.service";
import dayjs, { Dayjs } from "dayjs";
import {
  getAllSupportItemDropdown,
  getSupportCategoryDropdown,
  getSupportTypeDropdown,
} from "@/services/dropdown.service";
import { useDebounce } from "use-debounce";

interface RateSetsDrawerProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  rateSetID?: string;
  setLoading: (value: boolean) => void;
  loadRateSets: () => void;
}

type Filters = {
  support_category_name: string | null;
  support_item_number: string | null;
  start_date: Dayjs | null;
  end_date: Dayjs | null;
  type: string | null;
};

const regions = [
  "ACT",
  "NSW",
  "NT",
  "QLD",
  "SA",
  "TAS",
  "VIC",
  "WA",
  "REMOTE",
  "VERY_REMOTE",
];

export default function EditRateSetsDrawer({
  open,
  setOpen,
  rateSetID,
  setLoading,
  loadRateSets,
}: RateSetsDrawerProps) {
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [form] = Form.useForm();
  const [rateSetItems, setRateSetItems] = useState([]);

  const [file, setFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  const [filters, setFilters] = useState<Filters>({
    support_category_name: null,
    support_item_number: null,
    start_date: null,
    end_date: null,
    type: null,
  });

  const [typeDropdown, setTypeDropdown] = useState([]);
  const [supportCategoryDropdown, setSupportCategoryDropdown] = useState([]);
  const [supportItemDropdown, setSupportItemDropdown] = useState([]);

  const [unitPriceRange, setUnitPriceRange] = useState<[number, number]>([
    0, 0,
  ]);

  const [debouncedUnitPriceRange, setDebouncedUnitPriceRange] =
    useState(unitPriceRange);

  const maxUnitPrice = useMemo(() => {
    const prices = rateSetItems
      .flatMap((item) => [
        item.ACT,
        item.NSW,
        item.NT,
        item.QLD,
        item.SA,
        item.TAS,
        item.VIC,
        item.WA,
        item.REMOTE,
        item.VERY_REMOTE,
      ])
      .filter((price) => price != null)
      .map(Number);

    return prices.length ? Math.max(...prices) : 0;
  }, [rateSetItems]);

  useEffect(() => {
    if (maxUnitPrice > 0) {
      setUnitPriceRange([0, maxUnitPrice]);
    }
  }, [maxUnitPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUnitPriceRange(unitPriceRange);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [unitPriceRange]);

  const loadRateSet = async (id: string) => {
    try {
      const result = await getRateSet(id);

      form.setFieldsValue({
        name: result.name,
        description: result.description,
        start_date: result.start_date ? dayjs(result.start_date) : "",
        end_date: result.end_date ? dayjs(result.end_date) : "",
        active: result.active,
      });
    } catch (error) {
      message.error("Failed to load user rate set.");
    }
  };

  const loadUserRateSetItems = async (id: string) => {
    setLoadingEdit(true);
    try {
      const result = await getRateSetItems(id);

      const formattedItems = result.map((item) => ({
        ...item,
        start_date: item.start_date
          ? dayjs(item.start_date).format("DD/MM/YYYY")
          : "",
        end_date: item.end_date
          ? dayjs(item.end_date).format("DD/MM/YYYY")
          : "",
      }));

      setRateSetItems(formattedItems);
    } catch (error) {
      message.error("Failed to load user rate sets items.");
    } finally {
      setLoadingEdit(false);
    }
  };

  const loadDropdown = async () => {
    try {
      const typeResult = await getSupportTypeDropdown();
      const categoryResult = await getSupportCategoryDropdown();
      const itemResult = await getAllSupportItemDropdown();

      const formattedTypeResult = typeResult.map((item: any) => ({
        value: item.label,
        label: item.label,
      }));

      const formattedCategoryResult = categoryResult.map((item: any) => ({
        value: item.category_name,
        label: `${item.category_number} - ${item.category_name}`,
      }));

      const formattedItemResult = itemResult.map((item: any) => ({
        value: item.item_number,
        label: `${item.item_number} - ${item.item_name}`,
      }));

      setTypeDropdown(formattedTypeResult);
      setSupportCategoryDropdown(formattedCategoryResult);
      setSupportItemDropdown(formattedItemResult);
    } catch (error) {
      message.error("Failed to load type dropdown.");
    }
  };

  const filteredRateSetsItems = useMemo(() => {
    let filtered = [...rateSetItems];

    if (filters.support_category_name) {
      filtered = filtered.filter(
        (item) => item.support_category_name === filters.support_category_name,
      );
    }

    if (filters.support_item_number) {
      filtered = filtered.filter(
        (item) => item.support_item_number === filters.support_item_number,
      );
    }

    if (filters.start_date) {
      filtered = filtered.filter(
        (item) =>
          item.start_date === dayjs(filters.start_date).format("DD/MM/YYYY"),
      );
    }

    if (filters.end_date) {
      filtered = filtered.filter(
        (item) =>
          item.end_date === dayjs(filters.end_date).format("DD/MM/YYYY"),
      );
    }

    if (filters.type) {
      filtered = filtered.filter((item) => item.type === filters.type);
    }

    if (debouncedUnitPriceRange) {
      const [minPrice, maxPrice] = debouncedUnitPriceRange;

      filtered = filtered.filter((item) => {
        const prices = regions
          .map((region) => Number(item[region]))
          .filter((price) => !isNaN(price));

        if (prices.length === 0) return false;

        return prices.some((price) => price >= minPrice && price <= maxPrice);
      });
    }

    return filtered;
  }, [rateSetItems, filters, debouncedUnitPriceRange]);

  useEffect(() => {
    loadDropdown();
  }, []);

  useEffect(() => {
    if (rateSetID && open) {
      loadUserRateSetItems(rateSetID);
      loadRateSet(rateSetID);
    }
  }, [rateSetID, open]);

  const handleSubmit = async (values: any) => {
    handleUpdateRateSetItems();
    handleUpdateRateSet(values);
  };

  const handleUpdateRateSetItems = async () => {
    if (!file || !rateSetID) {
      return;
    }

    setLoadingEdit(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("rate_set_id", rateSetID);

    try {
      await uploadRateSet(formData);

      message.success("Excel uploaded successfully.");

      loadRateSets();
      closeDrawer();
    } catch (error: any) {
      console.log(error.response.data.error);
      message.error(
        error.response?.data?.error?.details[0] || "Something went wrong.",
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleUpdateRateSet = async (values: any) => {
    setLoadingEdit(true);
    try {
      await updateRateSet(rateSetID, values);
      message.success("Rate set updated successfully.");

      if (!file) {
        loadRateSets();
        closeDrawer();
      }
    } catch (error: any) {
      console.log(error.response.data.error);
      message.error(
        error.response?.data?.error?.details[0] || "Something went wrong.",
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  const closeDrawer = () => {
    setOpen(false);
    setLoading(false);
    setFile(null);
    setFileList([]);
    form.resetFields();
  };

  return (
    <Drawer
      open={open}
      placement="right"
      size="100%"
      closable={false}
      onClose={closeDrawer}
      styles={{
        body: {
          padding: 0,
        },
      }}
      destroyOnHidden
    >
      <Spin spinning={loadingEdit} description="Loading...">
        <div className="min-h-screen bg-[#111] text-white">
          <div className="flex justify-between items-center px-5 py-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <CloseOutlined className="cursor-pointer" onClick={closeDrawer} />

              <h2 className="text-lg font-semibold">Edit Rate Set</h2>
            </div>

            <Space>
              <Button onClick={closeDrawer}>Cancel</Button>

              <Button>Save as Draft</Button>

              <Button type="primary" onClick={() => form.submit()}>
                Save
              </Button>
            </Space>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-6 gap-5">
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter name",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item name="description" label="Description">
                  <Input />
                </Form.Item>

                <Form.Item
                  name="start_date"
                  label="Start Date"
                  rules={[
                    {
                      required: true,
                      message: "Please enter start date",
                    },
                  ]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item
                  name="end_date"
                  label="End Date"
                  rules={[
                    {
                      required: true,
                      message: "Please enter end date",
                    },
                  ]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item name="deactivated_at" label="Active">
                  <Switch defaultChecked />
                </Form.Item>
              </div>

              <div>
                <span>
                  Upload NDIS Pricing Arrangements and Price Limits Excel
                </span>

                <div className="mt-3 mb-5">
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

              <div className="grid grid-cols-6 gap-5">
                <Form.Item name="support_category" label="Support Category">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select"
                    options={supportCategoryDropdown}
                    onChange={(value) => {
                      setFilters((prev) => ({
                        ...prev,
                        support_category_name: value,
                      }));
                    }}
                  />
                </Form.Item>

                <Form.Item name="support_item" label="Support Item">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select"
                    options={supportItemDropdown}
                    onChange={(value) => {
                      setFilters((prev) => ({
                        ...prev,
                        support_item_number: value,
                      }));
                    }}
                  />
                </Form.Item>

                <Form.Item name="start_date_filter" label="Start Date">
                  <DatePicker
                    className="w-full"
                    onChange={(value) => {
                      setFilters((prev) => ({
                        ...prev,
                        start_date: value,
                      }));
                    }}
                  />
                </Form.Item>

                <Form.Item name="end_date_filter" label="End Date">
                  <DatePicker
                    className="w-full"
                    onChange={(value) => {
                      setFilters((prev) => ({
                        ...prev,
                        end_date: value,
                      }));
                    }}
                  />
                </Form.Item>

                <Form.Item name="type" label="Type">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select"
                    options={typeDropdown}
                    onChange={(value) => {
                      setFilters((prev) => ({
                        ...prev,
                        type: value,
                      }));
                    }}
                  />
                </Form.Item>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span className="text-gray-600">Unit Price</span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <InputNumber
                    min={0}
                    value={unitPriceRange[0]}
                    onChange={(value) => {
                      setUnitPriceRange([value, unitPriceRange[1]]);
                    }}
                    style={{ width: 200 }}
                  />

                  <Slider
                    range
                    min={0}
                    max={maxUnitPrice}
                    step={0.01}
                    value={unitPriceRange}
                    onChange={(value) => {
                      setUnitPriceRange(value as [number, number]);
                    }}
                    style={{ flex: 1 }}
                  />

                  <InputNumber
                    min={0}
                    value={unitPriceRange[1]}
                    onChange={(value) => {
                      setUnitPriceRange([unitPriceRange[0], value]);
                    }}
                    style={{ width: 200 }}
                  />
                </div>
              </div>

              <div className="mt-8">
                <Table
                  rowKey="support_item_number"
                  dataSource={filteredRateSetsItems}
                  scroll={{
                    x: 2400,
                  }}
                  columns={[
                    {
                      title: "Support Item Number",
                      dataIndex: "support_item_number",
                      key: "support_item_number",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Support Item Name",
                      dataIndex: "support_item_name",
                      key: "support_item_name",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Support Category Number",
                      dataIndex: "support_category_number",
                      key: "support_category_number",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Support Category Name",
                      dataIndex: "support_category_name",
                      key: "support_category_name",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Unit",
                      dataIndex: "unit",
                      key: "unit",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Quote",
                      dataIndex: "IS_QUOTE_REQUIRED",
                      key: "IS_QUOTE_REQUIRED",
                      render: (value: boolean) => (value ? "Yes" : "No"),
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Start Date",
                      dataIndex: "start_date",
                      key: "start_date",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "End Date",
                      dataIndex: "end_date",
                      key: "end_date",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "ACT",
                      dataIndex: "ACT",
                      key: "ACT",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "NSW",
                      dataIndex: "NSW",
                      key: "NSW",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "NT",
                      dataIndex: "NT",
                      key: "NT",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "QLD",
                      dataIndex: "QLD",
                      key: "QLD",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "SA",
                      dataIndex: "SA",
                      key: "SA",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "TAS",
                      dataIndex: "TAS",
                      key: "TAS",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "VIC",
                      dataIndex: "VIC",
                      key: "VIC",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "WA",
                      dataIndex: "WA",
                      key: "WA",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Remote",
                      dataIndex: "REMOTE",
                      key: "REMOTE",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Very Remote",
                      dataIndex: "VERY_REMOTE",
                      key: "VERY_REMOTE",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Non-Face-to-Face Support Provision",
                      dataIndex: "Non-Face-to-Face Support Provision",
                      key: "Non-Face-to-Face Support Provision",
                      render: (value: boolean) => (value ? "Yes" : "No"),
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Provider Travel",
                      dataIndex: "Provider Travel",
                      key: "Provider Travel",
                      render: (value: boolean) => (value ? "Yes" : "No"),
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Short Notice Cancellations",
                      dataIndex: "Short Notice Cancellations",
                      key: "Short Notice Cancellations",
                      render: (value: boolean) => (value ? "Yes" : "No"),
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "NDIA Requested Reports",
                      dataIndex: "NDIA Requested Reports",
                      key: "NDIA Requested Reports",
                      render: (value: boolean) => (value ? "Yes" : "No"),
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Irregular SIL Supports",
                      dataIndex: "Irregular SIL Supports",
                      key: "Irregular SIL Supports",
                      render: (value: boolean) => (value ? "Yes" : "No"),
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                    {
                      title: "Type",
                      dataIndex: "type",
                      key: "type",
                      onHeaderCell: () => ({
                        style: {
                          whiteSpace: "nowrap",
                        },
                      }),
                    },
                  ]}
                />
              </div>
            </div>
          </Form>
        </div>
      </Spin>
    </Drawer>
  );
}
