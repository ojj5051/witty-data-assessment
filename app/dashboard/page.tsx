"use client";

import { Card, Row, Col, Statistic } from "antd";

import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  FileOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const cards = [
    {
      title: "Participants",
      value: "Manage Participant Records.",
      icon: <UserOutlined />,
      path: "/participants",
    },
    {
      title: "Providers",
      value: "Manage Provider Records.",
      icon: <ShoppingCartOutlined />,
      path: "/providers",
    },
    {
      title: "Rate Sets",
      value: "Manage rate sets.",
      icon: <DollarOutlined />,
      path: "/rate-sets",
    },
    {
      title: "Invoices",
      value: "Manage Invoices.",
      icon: <RiseOutlined />,
      path: "/invoices",
    },
    {
      title: "Users",
      value: "Manage Application Users.",
      icon: <FileOutlined />,
      path: "/settings/users",
    },
    {
      title: "User Roles",
      value: "Manage Application User Roles.",
      icon: <TeamOutlined />,
      path: "/settings/user-roles",
    },
    {
      title: "Auth Sessions",
      value: "Maintain Login Sessions",
      icon: <CheckCircleOutlined />,
      path: "/settings/auth-sessions",
    }
  ];

  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My NDIS Portal</h1>
      <p className="mb-6 text-gray-600">
        Use the cards below to access the modules available.!
      </p>
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col key={card.title} xs={24} sm={12} lg={8}>
            <Card
              style={{
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.08)";
              }}
              onClick={() => router.push(`/dashboard/${card.path}`)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    marginRight: 16,
                    fontSize: 32,
                    color: "rgba(0, 0, 0, 0.45)",
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(0, 0, 0, 0.65)" }}>
                    {card.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
