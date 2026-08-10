"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  SettingOutlined,
  FileOutlined,
  TagOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/dashboard/participants",
      icon: <UserOutlined />,
      label: "Participants",
    },
    {
      key: "/dashboard/providers",
      icon: <ShoppingOutlined />,
      label: "Providers",
    },
    {
      key: "/dashboard/invoices",
      icon: <FileOutlined />,
      label: "Invoices",
    },
    {
      key: "/dashboard/rate-sets",
      icon: <TagOutlined />,
      label: "Rate Sets",
    },
    {
      icon: <SettingOutlined />,
      label: "Settings",
      children: [
        {
          key: "/dashboard/settings/users",
          label: "Users",
        },
        {
          key: "/dashboard/settings/user-roles",
          label: "User Roles",
        },
        {
          key: "/dashboard/settings/auth-sessions",
          label: "Auth Sessions",
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    router.push(key);
  };

  return (
    <Sider
      collapsible
      trigger={null} // Hide Ant Design's default trigger
      collapsed={collapsed}
      width={240}
      collapsedWidth={80}
      theme="dark"
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: collapsed ? 18 : 22,
          fontWeight: "bold",
        }}
      >
        {collapsed ? "NDIS" : "My NDIS Portal"}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={items}
        onClick={handleMenuClick}
      />
    </Sider>
  );
}
