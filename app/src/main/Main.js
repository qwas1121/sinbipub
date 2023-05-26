import React, { useEffect, useState } from "react";
import axios from "axios";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";

import "./main.css";
Chart.register(ChartDataLabels);

const Main = () => {
  //그래프
  const [dailySales, setDailySales] = useState({
    food: {},
    drink: {},
    total: {},
  });
  async function fetchSalesData() {
    try {
      const response = await axios.get("/api/sales");
      //console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  }

  function calculateDailySales(salesData) {
    const currentDate = new Date();
    const oneWeekAgo = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
    );
    const dailySales = {
      food: {},
      drink: {},
      total: {},
    };

    salesData.forEach((sale) => {
      const saleDate = new Date(sale.sale_date);
      if (saleDate >= oneWeekAgo && saleDate <= currentDate) {
        const dateString = saleDate.toISOString().split("T")[0];
        if (!dailySales.food[dateString]) {
          dailySales.food[dateString] = 0;
        }
        if (!dailySales.drink[dateString]) {
          dailySales.drink[dateString] = 0;
        }
        if (!dailySales.total[dateString]) {
          dailySales.total[dateString] = 0;
        }

        if (sale.category === "안주") {
          dailySales.food[dateString] += sale.amount;
        } else if (sale.category === "주류") {
          dailySales.drink[dateString] += sale.amount;
        }

        dailySales.total[dateString] += sale.amount; // 총 매출액을 계산
      }
    });

    return dailySales;
  }

  async function displayDailySales() {
    const salesData = await fetchSalesData();
    const dailySales = calculateDailySales(salesData);

    setDailySales(dailySales);
  }

  const chartData = {
    labels: Object.keys(dailySales.food).map((dateString) => {
      const date = new Date(dateString);
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
    }),
    datasets: [
      {
        label: "안주",
        data: Object.values(dailySales.food),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        stack: "combined",
      },
      {
        label: "주류",
        data: Object.values(dailySales.drink),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        stack: "combined",
      },
    ],
  };
  const chartOptions = {
    plugins: {
      datalabels: {
        color: "#000",
        font: {
          size: 20,
        },
        formatter: (value, context) => {
          if (context.datasetIndex === 0) {
            const date = context.chart.data.labels[context.dataIndex];
            return dailySales.total[date];
          } else {
            return null;
          }
        },
        anchor: "end",
        align: "top",
        offset: 2,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 16,
          },
        },
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  //결제수단별
  const [paymentData, setPaymentData] = useState({
    card_quantity: {},
    card_amount: {},
    cash_quantity: {},
    cash_amount: {},
    transfer_quantity: {},
    transfer_amount: {},
  });

  function calculatePaymentStats(salesData) {
    const currentDate = new Date();
    const oneWeekAgo = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
    );
    const paymentStats = {};

    salesData.forEach((sale) => {
      const saleDate = new Date(sale.sale_date);
      if (saleDate >= oneWeekAgo && saleDate <= currentDate) {
        const dateString = saleDate.toISOString().split("T")[0];
        if (!paymentStats[dateString]) {
          paymentStats[dateString] = {
            cardCount: 0,
            cardAmount: 0,
            cashCount: 0,
            cashAmount: 0,
            transferCount: 0,
            transferAmount: 0,
          };
        }

        paymentStats[dateString].cardCount += sale.card_quantity;
        paymentStats[dateString].cardAmount += sale.card_amount;
        paymentStats[dateString].cashCount += sale.cash_quantity;
        paymentStats[dateString].cashAmount += sale.cash_amount;
        paymentStats[dateString].transferCount += sale.transfer_quantity;
        paymentStats[dateString].transferAmount += sale.transfer_amount;
      }
    });

    return paymentStats;
  }
  async function displayPaymentData() {
    const salesData = await fetchSalesData();
    const paymentData = calculatePaymentStats(salesData);
    setPaymentData(paymentData);
  }

  useEffect(() => {
    displayDailySales();
    displayPaymentData();
  }, []);

  return (
    <div id="content">
      <div className="cont_title">
        <h1>신비한펍 메인</h1>
        <p>최근 일주일간의 매출현황을 간략하게 확인할 수 있는 페이지입니다.</p>
      </div>

      <div id="graph">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div id="payment">
        <h2>결제수단별 매출현황</h2>

        <table>
          <thead>
            <tr>
              <th rowSpan={2} className="title">
                구분
              </th>
              {Object.entries(paymentData)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([date]) => (
                  <th className="date" colSpan={2} key={date}>
                    {date}
                  </th>
                ))}
            </tr>
            <tr>
              {Object.entries(paymentData)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map((_, index) => (
                  <React.Fragment key={`count-amount-${index}`}>
                    <th className="title">건수</th>
                    <th className="title">금액</th>
                  </React.Fragment>
                ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="title">신용카드</td>
              {Object.entries(paymentData)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([_, stats], index) => (
                  <React.Fragment key={`card-${index}`}>
                    <td>{stats.cardCount}</td>
                    <td>{stats.cardAmount}</td>
                  </React.Fragment>
                ))}
            </tr>
            <tr>
              <td className="title">현금</td>
              {Object.entries(paymentData)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([_, stats], index) => (
                  <React.Fragment key={`cash-${index}`}>
                    <td>{stats.cashCount}</td>
                    <td>{stats.cashAmount}</td>
                  </React.Fragment>
                ))}
            </tr>
            <tr>
              <td className="title">계좌이체</td>
              {Object.entries(paymentData)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([_, stats], index) => (
                  <React.Fragment key={`transfer-${index}`}>
                    <td>{stats.transferCount}</td>
                    <td>{stats.transferAmount}</td>
                  </React.Fragment>
                ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Main;
