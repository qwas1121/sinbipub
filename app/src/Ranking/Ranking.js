import React, { useEffect, useState } from "react";
import { DatePicker, Table, Button } from "antd";
import axios from "axios";
import moment from "moment";
import "./rangking.css"; // Import the CSS file

const { RangePicker } = DatePicker;

const SalesRanking = () => {
  const [sales, setSales] = useState([]);
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    fetchSales(dateRange);
  }, [dateRange]);

  const fetchSales = async (dateRange) => {
    let url = "/api/sales";

    if (dateRange.length === 2) {
      url = `/api/sales2?start_date=${dateRange[0].format(
        "YYYY-MM-DD"
      )}&end_date=${dateRange[1].format("YYYY-MM-DD")}`;
    }

    try {
      const response = await axios.get(url);
      const salesData = response.data;
      const aggregatedSales = aggregateSales(salesData);
      setSales(
        aggregatedSales.sort((a, b) => b.total_quantity - a.total_quantity)
      );
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const aggregateSales = (salesData) => {
    const aggregatedSales = {};

    salesData.forEach((sale) => {
      const total_quantity =
        sale.cash_quantity + sale.card_quantity + sale.transfer_quantity;

      if (!aggregatedSales[sale.id]) {
        aggregatedSales[sale.id] = {
          product_id: sale.id,
          total_quantity: 0,
          menu_name: sale.menu_name,
          card: sale.card_quantity,
          cash: sale.cash_quantity,
          transfer: sale.transfer_quantity,
        };
      }
      aggregatedSales[sale.id].total_quantity += total_quantity;
    });

    return Object.values(aggregatedSales);
  };

  const columns = [
    {
      title: "순위",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "메뉴",
      dataIndex: "menu_name",
      key: "menu_name",
    },
    {
      title: "카드",
      dataIndex: "card",
      key: "card",
    },
    {
      title: "현금",
      dataIndex: "cash",
      key: "cash",
    },

    {
      title: "계좌이체",
      dataIndex: "transfer",
      key: "transfer",
    },

    {
      title: "총 판매량",
      dataIndex: "total_quantity",
      key: "total_quantity",
      sorter: (a, b) => a.total_quantity - b.total_quantity,
      defaultSortOrder: "descend",
    },
  ];

  const onDateChange = (dates) => {
    setDateRange(dates);
  };

  const showAllTimeRanking = () => {
    setDateRange([]);
  };

  const paginationSettings = {
    pageSize: 10, // 한 페이지에 표시할 항목 수 (기본값: 10)
  };

  return (
    <div id="content">
      <div className="cont_title">
        <h1>인기메뉴(판매순위)</h1>
      </div>
      <div className="header">
        <RangePicker onChange={onDateChange} />
        <Button onClick={showAllTimeRanking} className="bestData">
          전체 기간
        </Button>
      </div>
      <Table
        dataSource={sales}
        columns={columns}
        rowKey="product_id"
        pagination={paginationSettings}
        className="salesRankingTable"
      />
    </div>
  );
};

export default SalesRanking;
