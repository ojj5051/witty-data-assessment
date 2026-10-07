"use client";

import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  Select,
  Space,
} from "antd";
import {
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  getParticipantDropdown,
  getProviderDropdown,
} from "@/services/dropdown.service";
import { getInvoiceItems } from "@/services/invoices.service";
import dayjs, { Dayjs } from "dayjs";

function regionPrice(
  prices: Record<string, unknown> | null | undefined,
  region: string | null,
) {
  if (!prices || !region || prices[region] == null || prices[region] === "") {
    return null;
  }

  const number = Number(prices[region]);
  return Number.isFinite(number) ? number : null;
}

function lineAmount(unit: unknown, rate: unknown) {
  const value = (Number(unit) || 0) * (Number(rate) || 0);
  return Math.round(value * 100) / 100;
}

function syncAmounts(form: {
  getFieldValue: (name: unknown) => any;
  setFieldValue: (name: unknown, value: unknown) => void;
}) {
  const items = form.getFieldValue("items") || [];
  let total = 0;

  items.forEach((item: any, index: number) => {
    const amount = lineAmount(item?.unit, item?.input_rate);
    form.setFieldValue(["items", index, "amount"], amount);
    total += amount;
  });

  form.setFieldValue("amount", Math.round(total * 100) / 100);
}

function asDate(value: any) {
  if (value && typeof value.format === "function") {
    return value.format("YYYY-MM-DD");
  }

  return value;
}

interface InvoiceItem {
  id: number;
}

interface ParticipantOption {
  label: string;
  value: string;
  pricingRegion: string | null;
}

interface InvoiceDrawerProps {
  title: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  onSubmit: (values: any, id?: string) => void | Promise<void>;
  data?: any;
  setIsEdit?: (value: boolean) => void;
}

export default function InvoiceFormDrawer({
  title,
  open,
  setOpen,
  onSubmit,
  data,
  setIsEdit,
}: InvoiceDrawerProps) {
  const [form] = Form.useForm();
  const formItems = Form.useWatch("items", form) || [];

  const [items, setItems] = useState<InvoiceItem[]>([{ id: 1 }]);

  const [invoiceItemsByRow, setInvoiceItemsByRow] = useState<
    Record<number, any[]>
  >({});

  const [participantsDropdown, setParticipantsDropdown] = useState<
    ParticipantOption[]
  >([]);
  const [providersDropdown, setProvidersDropdown] = useState([]);
  const [participantRegion, setParticipantRegion] = useState<string | null>(
    null,
  );

  const handleGetInvoiceItems = async (
    index: number,
    startDate: Dayjs,
    endDate: Dayjs,
  ) => {
    try {
      const result = await getInvoiceItems(
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD"),
      );

      setInvoiceItemsByRow((prev) => ({
        ...prev,
        [index]: result,
      }));

      return result;
    } catch (error: any) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    if (!data) return;

    form.setFieldsValue(data);
    setItems(data.items ?? []);

    data.items?.forEach(async (item: any, index: number) => {
      if (!item.start_date || !item.end_date) return;

      await handleGetInvoiceItems(index, item.start_date, item.end_date);
    });
  }, [data]);

  useEffect(() => {
    if (!data?.client_id || participantsDropdown.length === 0) return;

    const selected = participantsDropdown.find(
      (participant) => participant.value === data.client_id,
    );

    if (selected) {
      setParticipantRegion(selected.pricingRegion);
    }
  }, [data, participantsDropdown]);

  useEffect(() => {
    if (!participantRegion) return;

    Object.entries(invoiceItemsByRow).forEach(([index, rows]) => {
      const supportId = form.getFieldValue([
        "items",
        Number(index),
        "support_item_id",
      ]);
      const supportItem = rows.find((row) => row.id === supportId);

      if (!supportItem) return;

      form.setFieldValue(
        ["items", Number(index), "max_rate"],
        regionPrice(supportItem.prices, participantRegion),
      );
    });
  }, [participantRegion, invoiceItemsByRow, form]);

  useEffect(() => {
    const loadDropdown = async () => {
      try {
        const resultParticipant = await getParticipantDropdown();
        const resultProvider = await getProviderDropdown();

        const participantOptions = resultParticipant.map(
          (participant: any) => ({
            label: participant.name,
            value: participant.id,
            pricingRegion: participant.pricing_region ?? null,
          }),
        );

        const providerOptions = resultProvider.map((provider: any) => ({
          label: provider.name,
          value: provider.id,
        }));

        setParticipantsDropdown(participantOptions);
        setProvidersDropdown(providerOptions);
      } catch (error: any) {
        console.error(error);
      }
    };

    loadDropdown();
  }, []);

  const handleSubmit = async (values: any, drafted = false) => {
    const updatedItems = (values.items ?? []).map((item: any, index: number) => {
      const rowInvoiceItems = invoiceItemsByRow[index] || [];

      const supportItem = rowInvoiceItems.find(
        (invoiceItem: any) => invoiceItem.id === item.support_item_id,
      );

      return {
        ...item,
        start_date: asDate(item.start_date),
        end_date: asDate(item.end_date),
        rate_set_id: supportItem?.rate_set_id ?? null,
      };
    });

    const payload = {
      ...values,
      invoice_date: asDate(values.invoice_date),
      items: updatedItems,
      status: drafted ? "draft" : "completed",
    };

    try {
      if (data?.id) {
        await onSubmit(payload, data.id);
      } else {
        await onSubmit(payload);
      }

      closeDrawer();
    } catch (error) {
      console.error(error);
    }
  };

  const closeDrawer = () => {
    setIsEdit?.(false);
    setOpen(false);
    form.resetFields();
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
      },
    ]);
  };

  const removeItem = (id: number) => {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return;

    const currentItems = form.getFieldValue("items") || [];
    form.setFieldValue(
      "items",
      currentItems.filter((_: unknown, itemIndex: number) => itemIndex !== index),
    );

    setInvoiceItemsByRow((prev) => {
      const next: Record<number, any[]> = {};
      let nextIndex = 0;

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        if (itemIndex === index) continue;
        next[nextIndex] = prev[itemIndex] || [];
        nextIndex++;
      }

      return next;
    });

    setItems(items.filter((item) => item.id !== id));
    syncAmounts(form);
  };

  const duplicateItem = (id: number) => {
    const index = items.findIndex((x) => x.id === id);

    if (index === -1) return;

    const currentItems = form.getFieldValue("items") || [];
    const originalItem = currentItems[index];

    const newItem = {
      ...originalItem,
      id: Date.now(),
    };

    setItems((prev) => [...prev, newItem]);

    form.setFieldValue("items", [...currentItems, newItem]);

    setInvoiceItemsByRow((prev) => ({
      ...prev,
      [items.length]: prev[index] || [],
    }));

    syncAmounts(form);
  };

  return (
    <Drawer
      title={title}
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
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="min-h-screen bg-[#111] text-white">
          <div className="flex justify-between items-center px-5 py-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <CloseOutlined className="cursor-pointer" onClick={closeDrawer} />
            </div>

            <Space>
              <Button onClick={closeDrawer}>Cancel</Button>

              {!data && (
                <Button
                  onClick={() => handleSubmit(form.getFieldsValue(), true)}
                >
                  Save as Draft
                </Button>
              )}

              <Button type="primary" onClick={() => form.submit()}>
                Save
              </Button>
            </Space>
          </div>

          <div className="p-5 overflow-y-auto">
            <div className="grid grid-cols-6 gap-5">
              <Form.Item
                name="client_id"
                label="Participant"
                rules={[
                  {
                    required: true,
                    message: "Please select participant",
                  },
                ]}
              >
                <Select
                  allowClear
                  placeholder="Select"
                  options={participantsDropdown}
                  onChange={(value) => {
                    const selected = participantsDropdown.find(
                      (participant) => participant.value === value,
                    );
                    setParticipantRegion(selected?.pricingRegion ?? null);
                  }}
                />
              </Form.Item>

              <Form.Item
                name="provider_id"
                label="Provider"
                rules={[
                  {
                    required: true,
                    message: "Please select provider",
                  },
                ]}
              >
                <Select
                  allowClear
                  placeholder="Select"
                  options={providersDropdown}
                />
              </Form.Item>

              <Form.Item
                name="invoice_number"
                label="Invoice Number"
                rules={[
                  {
                    required: true,
                    message: "Please enter invoice number",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="invoice_date"
                label="Invoice Date"
                rules={[
                  {
                    required: true,
                    message: "Please enter invoice date",
                  },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>

              <Form.Item
                name="expected_amount"
                label="Expected Amount"
                dependencies={["amount"]}
                rules={[
                  {
                    required: true,
                    message: "Please enter expected amount",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const amount = getFieldValue("amount");

                      if (Number(value) === Number(amount)) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error("Expected Amount must equal Amount"),
                      );
                    },
                  }),
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="amount" label="Amount">
                <Input disabled />
              </Form.Item>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Items ({items.length})
              </h2>

              {items.map((item, index) => {
                const rowInvoiceItems = invoiceItemsByRow[index] || [];

                const supportCategoryOptions = Array.from(
                  new Map(
                    rowInvoiceItems.map((invoiceItem: any) => [
                      invoiceItem.category_id,
                      {
                        label: `${invoiceItem.category_number} - ${invoiceItem.category_name}`,
                        value: invoiceItem.category_id,
                      },
                    ]),
                  ).values(),
                );

                const categoryId = formItems[index]?.category_id;

                const supportItemOptions = rowInvoiceItems
                  .filter(
                    (invoiceItem: any) =>
                      invoiceItem.category_id === categoryId,
                  )
                  .map((invoiceItem: any) => ({
                    label: `${invoiceItem.item_number} - ${invoiceItem.item_name}`,
                    value: invoiceItem.id,
                  }));

                return (
                  <Card
                    key={item.id}
                    title={`#${index + 1}`}
                    style={{ marginBottom: "20px" }}
                    extra={
                      <>
                        <CopyOutlined
                          className="cursor-pointer"
                          onClick={() => duplicateItem(item.id)}
                        />

                        <DeleteOutlined
                          className="cursor-pointer"
                          onClick={() => removeItem(item.id)}
                        />
                      </>
                    }
                  >
                    <div className="grid grid-cols-4 gap-5">
                      <Form.Item
                        name={["items", index, "start_date"]}
                        label="Service Start Date"
                        rules={[
                          {
                            required: true,
                            message: "Required",
                          },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          onChange={(value) => {
                            const endDate = form.getFieldValue([
                              "items",
                              index,
                              "end_date",
                            ]);

                            if (!value || !endDate) return;

                            handleGetInvoiceItems(index, value, endDate);
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={["items", index, "end_date"]}
                        label="Service End Date"
                        rules={[
                          {
                            required: true,
                            message: "Required",
                          },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          onChange={(value) => {
                            const startDate = form.getFieldValue([
                              "items",
                              index,
                              "start_date",
                            ]);

                            if (!value || !startDate) return;

                            handleGetInvoiceItems(index, startDate, value);
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={["items", index, "category_id"]}
                        label="Support Category"
                        rules={[
                          {
                            required: true,
                            message: "Required",
                          },
                        ]}
                      >
                        <Select
                          options={supportCategoryOptions}
                          onChange={() => {
                            form.setFieldsValue({
                              items: {
                                [index]: {
                                  support_item_id: null,
                                },
                              },
                            });
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={["items", index, "support_item_id"]}
                        label="Support Item"
                      >
                        <Select
                          options={supportItemOptions}
                          onChange={(value) => {
                            const supportItem = rowInvoiceItems.find(
                              (item: any) => item.id === value,
                            );

                            form.setFieldValue(
                              ["items", index, "max_rate"],
                              supportItem
                                ? regionPrice(
                                    supportItem.prices,
                                    participantRegion,
                                  )
                                : null,
                            );
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={["items", index, "max_rate"]}
                        label="Max Rate"
                      >
                        <Input disabled />
                      </Form.Item>

                      <Form.Item
                        name={["items", index, "unit"]}
                        label="Unit"
                        rules={[
                          {
                            required: true,
                            message: "Required",
                          },
                        ]}
                      >
                        <Input
                          onChange={(e) => {
                            form.setFieldValue(
                              ["items", index, "unit"],
                              e.target.value,
                            );
                            syncAmounts(form);
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={["items", index, "input_rate"]}
                        label="Invoice Rate"
                        rules={[
                          {
                            required: true,
                            message: "Required",
                          },
                          {
                            validator(_, value) {
                              if (value === undefined || value === null || value === "") {
                                return Promise.resolve();
                              }

                              const maxRate = form.getFieldValue([
                                "items",
                                index,
                                "max_rate",
                              ]);

                              if (
                                maxRate === undefined ||
                                maxRate === null ||
                                maxRate === ""
                              ) {
                                return Promise.reject(
                                  new Error(
                                    "No price guide rate for this participant's region",
                                  ),
                                );
                              }

                              if (Number(value) > Number(maxRate)) {
                                return Promise.reject(
                                  new Error(
                                    "Invoice rate cannot exceed the price guide rate",
                                  ),
                                );
                              }

                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input
                          onChange={(e) => {
                            form.setFieldValue(
                              ["items", index, "input_rate"],
                              e.target.value,
                            );
                            syncAmounts(form);
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={["items", index, "amount"]}
                        label="Invoiced Amount"
                      >
                        <Input disabled />
                      </Form.Item>
                    </div>
                  </Card>
                );
              })}

              <Button icon={<PlusOutlined />} onClick={addItem}>
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </Drawer>
  );
}
