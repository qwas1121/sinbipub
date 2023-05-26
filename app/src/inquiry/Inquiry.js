import ExportToExcel from "./ExportToExcel";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { DatePicker, Radio, Checkbox, Pagination } from "antd";
import dayjs from "dayjs";
import "./style.css";
const { RangePicker } = DatePicker;
const Inquiry = () => {
  //달력
  const [range, setRange] = useState([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [period, setPeriod] = useState("daily");

  const onPeriodChange = (e) => {
    setPeriod(e.target.value);
    switch (e.target.value) {
      case "daily":
        setRange([dayjs().startOf("day"), dayjs().endOf("day")]);
        break;
      case "monthly":
        setRange([dayjs().startOf("month"), dayjs().endOf("month")]);
        break;
      case "yearly":
        setRange([dayjs().startOf("year"), dayjs().endOf("year")]);
        break;
      default:
        break;
    }
  };

  const fetchSalesByPeriod = async (startDate, endDate) => {
    try {
      const response = await axios.get("/api/sales2", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      //console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const fetchSalesTableCount = async (startDate, endDate) => {
    try {
      const response = await axios.get("/api/sales_info2", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      //  console.log("API response (sales_table_count):", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales table count:", error);
    }
  };

  const fetchData = useCallback(async () => {
    const salesData = await fetchSalesByPeriod(
      range[0].format("YYYY-MM-DD"),
      range[1].format("YYYY-MM-DD")
    );
    const salesTableCountData = await fetchSalesTableCount(
      range[0].format("YYYY-MM-DD"),
      range[1].format("YYYY-MM-DD")
    );

    const salesTableCountByDate = salesTableCountData.reduce((acc, curr) => {
      if (!acc[curr.sale_date]) {
        acc[curr.sale_date] = {
          table_count: curr.table_count,
          location: curr.location,
        };
      } else {
        acc[curr.sale_date].table_count += curr.table_count;
      }

      return acc;
    }, {});

    // 날짜별로 정렬
    salesData.sort((a, b) => new Date(a.sale_date) - new Date(b.sale_date));

    // 여기서 salesData를 테이블에 표시
    setTableData(salesData);
    setSalesTableCountByDate(salesTableCountByDate);
  }, [range]);

  const [salesTableCountByDate, setSalesTableCountByDate] = useState({});

  // 데이터 출력
  const [tableData, setTableData] = useState([]);
  const groupByDateAndCategory = (data) => {
    const result = data.reduce((acc, curr) => {
      const date = curr.sale_date;
      const category = curr.category;

      if (!acc[date]) {
        acc[date] = {
          categories: {},
          sales_table_count: curr.sales_table_count,
        };
      }

      if (!acc[date].categories[category]) {
        acc[date].categories[category] = [];
      }

      acc[date].categories[category].push(curr);
      return acc;
    }, {});

    const sortedDates = Object.keys(result).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const sortedResult = {};
    for (const date of sortedDates) {
      sortedResult[date] = result[date];
    }

    return sortedResult;
  };

  const groupedData = useMemo(
    () => groupByDateAndCategory(tableData),
    [tableData]
  );

  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  //총합
  const calculateTotalAmounts = (data, salesTableCountByDate) => {
    const uniqueDates = new Set(data.map((row) => row.sale_date));

    const tableCountTotal = Array.from(uniqueDates).reduce((total, date) => {
      return total + (salesTableCountByDate[date]?.table_count || 0);
    }, 0);

    return data.reduce(
      (totals, row) => {
        totals.cardQuanTotal += row.card_quantity;
        totals.cashQuanTotal += row.cash_quantity;
        totals.transferQuanTotal += row.transfer_quantity;
        totals.QuanTotal +=
          row.card_quantity + row.cash_quantity + row.transfer_quantity;
        totals.cardTotal += row.card_amount;
        totals.cashTotal += row.cash_amount;
        totals.transferTotal += row.transfer_amount;
        totals.total += row.amount;
        return totals;
      },
      {
        cardQuanTotal: 0,
        cashQuanTotal: 0,
        transferQuanTotal: 0,
        QuanTotal: 0,
        cardTotal: 0,
        cashTotal: 0,
        transferTotal: 0,
        total: 0,
        tableCountTotal,
      }
    );
  };

  const totalAmounts = useMemo(
    () => calculateTotalAmounts(tableData, salesTableCountByDate),
    [tableData, salesTableCountByDate]
  );

  //체크박스 필터
  const [filters, setFilters] = useState({
    cardSales: true,
    cashSales: true,
    transferSales: true,
    totalSales: true,
    tableSales: true,
    placeInfo: true,
    filterQuan: true,
    filterAmount: true,
  });

  const options = [
    { label: "카드 판매정보", value: "cardSales" },
    { label: "현금 판매정보", value: "cashSales" },
    { label: "계좌이체 판매정보", value: "transferSales" },
    { label: "총 판매정보", value: "totalSales" },
    { label: "테이블 정보", value: "tableSales" },
    { label: "장소", value: "placeInfo" },
    { label: "판매량", value: "filterQuan" },
    { label: "판매금액", value: "filterAmount" },
  ];

  const checkedValues = Object.keys(filters).filter((key) => filters[key]);
  const handleFilterChange = (checkedValues) => {
    const newFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = checkedValues.includes(key);
      return acc;
    }, {});

    setFilters(newFilters);
  };
  const isAllChecked = Object.values(filters).every((val) => val);
  const handleAllChange = (e) => {
    setFilters(
      Object.keys(filters).reduce((acc, key) => {
        acc[key] = e.target.checked;
        return acc;
      }, {})
    );
  };

  // const handleFilterChange = (event) => {
  //   const { name, checked } = event.target;
  //   setFilters({ ...filters, [name]: checked });
  // };

  // 메뉴이름필터
  const [checkedMenus, setCheckedMenus] = React.useState({});
  // 체크박스의 변경을 처리하는 함수입니다.
  const handleCheckboxChange = (menuName) => {
    setCheckedMenus({
      ...checkedMenus,
      [menuName]: !checkedMenus[menuName],
    });
  };

  // groupedData를 변경하여 체크박스에 따라 데이터를 필터링합니다.
  const filteredData = React.useMemo(() => {
    return Object.entries(groupedData).reduce((acc, [date, dateData]) => {
      acc[date] = {
        categories: Object.entries(dateData.categories).reduce(
          (acc, [category, categoryData]) => {
            acc[category] = categoryData.filter(
              (data) => checkedMenus[data.menu_name] !== false
            );
            return acc;
          },
          {}
        ),
      };
      return acc;
    }, {});
  }, [groupedData, checkedMenus]);

  const menuOptions = Object.keys(groupedData).flatMap((date) => {
    const dateData = groupedData[date].categories;
    return Object.keys(dateData).flatMap((category) => {
      const categoryData = dateData[category];
      return categoryData.map((data) => {
        const menuName = data.menu_name;
        return { label: menuName, value: menuName };
      });
    });
  });

  const isAllSelected = Object.keys(checkedMenus).every(
    (menuName) => checkedMenus[menuName] !== false
  );

  const mergeData = (tableData, salesTableCountByDate) => {
    return tableData.map((item) => {
      const date = item.sale_date;
      const countData = salesTableCountByDate[date];
      return {
        ...item,
        table_count: countData ? countData.table_count : 0,
        location: countData ? countData.location : "",
      };
    });
  };

  let mergedDataForExcel = mergeData(tableData, salesTableCountByDate);
  //날짜
  const [order, setOrder] = useState("asc"); // 'asc'는 오름차순, 'desc'는 내림차순을 의미합니다.

  //페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setRowsPerPage(pageSize);
  };
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const transformData = (filteredData) => {
    let data = Object.keys(filteredData).flatMap((date) => {
      const dateData = filteredData[date].categories;
      return Object.keys(dateData).flatMap((category) => {
        const categoryData = dateData[category];
        return categoryData.map((data, index) => ({
          date,
          category,
          index,
          data,
        }));
      });
    });

    if (order === "asc") {
      data.sort((a, b) => (a.date > b.date ? 1 : -1));
    } else {
      data.sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    return data;
  };

  const yourData = transformData(filteredData);
  const paginatedData = yourData.slice(startIndex, endIndex);

  //날짜

  useEffect(() => {
    fetchData();
  }, [fetchData, period]);

  const toggleSortOrder = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  return (
    <div id="content" className="inquiry">
      <div className="cont_title">
        <h1>매출확인</h1>
        <p>
          기간별 매출확인을 할 수 있습니다. <br />
          왼쪽 버튼을 클릭하거나 오른쪽 달력을 통해 날짜별로 확인할 수 있습니다.
        </p>
      </div>
      <div className="header">
        <Radio.Group onChange={onPeriodChange} value={period}>
          <Radio.Button value="daily">일간 매출</Radio.Button>
          <Radio.Button value="monthly">월간 매출</Radio.Button>
          <Radio.Button value="yearly">연간 매출</Radio.Button>
        </Radio.Group>
        <RangePicker
          value={range}
          onChange={(dates) => setRange(dates)}
          format={
            period === "yearly"
              ? "YYYY"
              : period === "monthly"
              ? "YYYY-MM"
              : "YYYY-MM-DD"
          }
          mode={
            period === "yearly"
              ? ["year", "year"]
              : period === "monthly"
              ? ["month", "month"]
              : ["date", "date"]
          }
          onPanelChange={(dates, mode) => setRange(dates)}
        />
      </div>

      <div className="total_info">
        <h3>총 합</h3>
        <table>
          <thead>
            <tr>
              <th colSpan={9}>
                {range[0].format("YYYY-MM-DD")} -{" "}
                {range[1].format("YYYY-MM-DD")}
              </th>
            </tr>
            <tr>
              <th>카드판매량</th>
              <th>카드판매액</th>
              <th>현금판매량</th>
              <th>현금판매액</th>
              <th>계좌이체판매량</th>
              <th>계좌이체판매액</th>
              <th>총판매량</th>
              <th>총판매금</th>
              <th>판매 테이블수</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{numberWithCommas(totalAmounts.cardQuanTotal)}</td>
              <td>{numberWithCommas(totalAmounts.cardTotal)}</td>
              <td>{numberWithCommas(totalAmounts.cashQuanTotal)}</td>
              <td>{numberWithCommas(totalAmounts.cashTotal)}</td>
              <td>{numberWithCommas(totalAmounts.transferQuanTotal)}</td>
              <td>{numberWithCommas(totalAmounts.transferTotal)}</td>
              <td>{numberWithCommas(totalAmounts.transferTotal)}</td>
              <td>{numberWithCommas(totalAmounts.total)}</td>
              <td>{numberWithCommas(totalAmounts.tableCountTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="total_info pdbt mgt">
        <h3>세부정보</h3>

        <div className="exelWrap"></div>
        <div className="chkWrap">
          <p>필요없는 항목들을 체크해제 후 확인할 수 있습니다.</p>

          <div className="allck">
            <Checkbox
              className="allck"
              checked={isAllChecked}
              onChange={handleAllChange}
            >
              전체 선택
            </Checkbox>
          </div>

          <Checkbox.Group
            options={options}
            value={checkedValues}
            onChange={handleFilterChange}
            className="cateCk"
          />
        </div>
        <div className="chkWrap chkWrap2">
          <p>메뉴별로 확인할 수 있습니다.</p>

          <div className="allck">
            <Checkbox
              checked={isAllSelected}
              onChange={(e) => {
                const newCheckedMenus = { ...checkedMenus };
                menuOptions.forEach(({ value: menuName }) => {
                  newCheckedMenus[menuName] = e.target.checked;
                });
                setCheckedMenus(newCheckedMenus);
              }}
            >
              전체 선택
            </Checkbox>
          </div>
          <div className="ck">
            {Object.keys(groupedData).map((date) => {
              const dateData = groupedData[date].categories;
              return Object.keys(dateData).flatMap((category) => {
                const categoryData = dateData[category];
                return categoryData.map((data, index) => {
                  const menuName = data.menu_name;
                  return (
                    <React.Fragment
                      key={`${date}-${category}-${index}-${menuName}`}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={checkedMenus[menuName] !== false}
                          onChange={() => handleCheckboxChange(menuName)}
                        />
                        <span>{menuName}</span>
                      </label>
                    </React.Fragment>
                  );
                });
              });
            })}
          </div>
        </div>
        <ExportToExcel
          apiData={mergedDataForExcel}
          fileName={
            range[0].format("YYYY-MM-DD") === range[1].format("YYYY-MM-DD")
              ? range[0].format("YYYY-MM-DD")
              : `${range[0].format("YYYY-MM-DD")}-${range[1].format(
                  "YYYY-MM-DD"
                )}`
          }
        />

        <table>
          <thead>
            <tr>
              <th
                onClick={toggleSortOrder}
                rowSpan={filters.filterAmount ? 2 : 1}
                className="setorder"
              >
                날짜 {order === "asc" ? "▲" : "▼"}
              </th>
              <th rowSpan={filters.filterAmount ? 2 : 1}>분류</th>
              <th rowSpan={filters.filterAmount ? 2 : 1}>메뉴</th>
              <th rowSpan={filters.filterAmount ? 2 : 1}>금액</th>

              {filters.cardSales && (
                <th
                  rowSpan={filters.filterQuan && filters.filterAmount ? 1 : 2}
                >
                  {filters.filterQuan ? "카드 판매량" : "카드 판매액"}
                </th>
              )}
              {filters.cashSales && (
                <th
                  rowSpan={filters.filterQuan && filters.filterAmount ? 1 : 2}
                >
                  {filters.filterQuan ? "현금 판매량" : "현금 판매액"}
                </th>
              )}
              {filters.transferSales && (
                <th
                  rowSpan={filters.filterQuan && filters.filterAmount ? 1 : 2}
                >
                  {filters.filterQuan ? "계좌이체 판매량" : "계좌이체 판매액"}
                </th>
              )}
              {filters.totalSales && (
                <th
                  rowSpan={filters.filterQuan && filters.filterAmount ? 1 : 2}
                >
                  {filters.filterQuan ? "총 판매량" : "총 판매액"}
                </th>
              )}

              {filters.tableSales && (
                <th rowSpan={filters.filterAmount ? 2 : 1}>판매 테이블수</th>
              )}
              {filters.placeInfo && (
                <th rowSpan={filters.filterAmount ? 2 : 1}>장소</th>
              )}
            </tr>

            {filters.filterQuan && filters.filterAmount && (
              <tr>
                {filters.cardSales && <th>카드 판매액</th>}
                {filters.cashSales && <th>현금 판매액</th>}
                {filters.transferSales && <th>계좌이체 판매액</th>}
                {filters.totalSales && <th>총 판매액</th>}
              </tr>
            )}
          </thead>

          <tbody>
            {paginatedData.map(({ date, category, index, data }) => {
              const dateData = filteredData[date].categories;
              const shouldShowDate = index === 0;
              const shouldShowCategory = index === 0;

              let isFirstCategory = true;

              return Object.keys(dateData).flatMap((category) => {
                const categoryData = dateData[category];

                return categoryData.map((data, index) => {
                  const shouldShowDate = isFirstCategory && index === 0;
                  const shouldShowCategory = index === 0;
                  isFirstCategory = false;

                  return (
                    <React.Fragment key={`${date}-${category}-${index}`}>
                      <tr className={shouldShowDate ? "bd_double" : ""}>
                        {shouldShowDate && (
                          <td
                            rowSpan={Object.values(dateData).flat().length * 2}
                          >
                            {date}
                          </td>
                        )}
                        {shouldShowCategory && (
                          <td rowSpan={categoryData.length * 2}>{category}</td>
                        )}
                        <td rowSpan={2}>{data.menu_name}</td>
                        <td rowSpan={2}>{numberWithCommas(data.price)}</td>
                        {filters.cardSales && (
                          <td rowSpan={filters.filterQuan ? 1 : 2}>
                            {filters.filterQuan
                              ? numberWithCommas(data.card_quantity)
                              : numberWithCommas(data.card_amount)}
                          </td>
                        )}
                        {filters.cashSales && (
                          <td rowSpan={filters.filterQuan ? 1 : 2}>
                            {filters.filterQuan
                              ? numberWithCommas(data.cash_quantity)
                              : numberWithCommas(data.cash_amount)}
                          </td>
                        )}
                        {filters.transferSales && (
                          <td rowSpan={filters.filterQuan ? 1 : 2}>
                            {filters.filterQuan
                              ? numberWithCommas(data.transfer_quantity)
                              : numberWithCommas(data.transfer_amount)}
                          </td>
                        )}
                        {filters.totalSales && (
                          <td rowSpan={filters.filterQuan ? 1 : 2}>
                            {filters.filterQuan
                              ? numberWithCommas(
                                  data.card_quantity +
                                    data.cash_quantity +
                                    data.transfer_quantity
                                )
                              : numberWithCommas(data.amount)}
                          </td>
                        )}
                        {filters.tableSales && shouldShowDate && (
                          <td
                            rowSpan={Object.values(dateData).flat().length * 2}
                          >
                            {numberWithCommas(
                              salesTableCountByDate[date]?.table_count || 0
                            )}
                          </td>
                        )}
                        {filters.placeInfo && shouldShowDate && (
                          <td
                            rowSpan={Object.values(dateData).flat().length * 2}
                          >
                            {salesTableCountByDate[date]?.location || ""}
                          </td>
                        )}
                      </tr>
                      <tr>
                        {filters.cardSales &&
                          filters.filterAmount &&
                          filters.filterQuan && (
                            <td>{numberWithCommas(data.card_amount)}</td>
                          )}
                        {filters.cashSales &&
                          filters.filterAmount &&
                          filters.filterQuan && (
                            <td>{numberWithCommas(data.cash_amount)}</td>
                          )}
                        {filters.transferSales &&
                          filters.filterAmount &&
                          filters.filterQuan && (
                            <td>{numberWithCommas(data.transfer_amount)}</td>
                          )}
                        {filters.totalSales &&
                          filters.filterAmount &&
                          filters.filterQuan && (
                            <td>{numberWithCommas(data.amount)}</td>
                          )}
                      </tr>
                    </React.Fragment>
                  );
                });
              });
            })}
            <tr className="total bd_bold">
              <th colSpan={4} rowSpan={2}>
                합계
              </th>
              {filters.cardSales && filters.filterQuan && (
                <td>{numberWithCommas(totalAmounts.cardQuanTotal)}</td>
              )}
              {filters.cashSales && filters.filterQuan && (
                <td>{numberWithCommas(totalAmounts.cashQuanTotal)}</td>
              )}
              {filters.transferSales && filters.filterQuan && (
                <td>{numberWithCommas(totalAmounts.transferQuanTotal)}</td>
              )}
              {filters.totalSales && filters.filterQuan && (
                <td className="totalNum">
                  {numberWithCommas(totalAmounts.QuanTotal)}
                </td>
              )}
              {filters.tableSales && filters.filterQuan && (
                <td rowSpan={2}>
                  {numberWithCommas(totalAmounts.tableCountTotal)}
                </td>
              )}
              {filters.placeInfo && filters.filterQuan && (
                <td rowSpan={2}> </td>
              )}
            </tr>
            <tr className="total">
              {filters.cardSales && filters.filterAmount && (
                <td>{numberWithCommas(totalAmounts.cardTotal)}</td>
              )}
              {filters.cashSales && filters.filterAmount && (
                <td>{numberWithCommas(totalAmounts.cashTotal)}</td>
              )}
              {filters.transferSales && filters.filterAmount && (
                <td>{numberWithCommas(totalAmounts.transferTotal)}</td>
              )}
              {filters.totalSales && filters.filterAmount && (
                <td className="totalNum">
                  {numberWithCommas(totalAmounts.total)}
                </td>
              )}
            </tr>
          </tbody>
        </table>
        <Pagination
          current={currentPage}
          pageSize={rowsPerPage}
          total={yourData.length}
          onChange={handlePageChange}
          showSizeChanger
          onShowSizeChange={handlePageChange}
          className="salesPaging"
        />
      </div>
    </div>
  );
};

export default Inquiry;
