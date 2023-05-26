import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

import { DatePicker } from "antd";
import dayjs from "dayjs";
import moment from "moment";

import NumberInput from "./Number";

import "./sales.css";

const Sales = () => {
  //메뉴 리스트 가져오기
  const [menuItems, setMenuItems] = useState([]);
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("/api/menu");
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const options = menuItems
    .filter((item) => item.category === "안주")
    .map((item) => {
      return {
        value: item.menu_name,
        label: item.menu_name,
      };
    });

  const options2 = menuItems
    .filter((item) => item.category === "주류")
    .map((item) => {
      return {
        value: item.menu_name,
        label: item.menu_name,
      };
    });

  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedDrink, setSelectedDrink] = useState(null);

  function onChangeFood(opts) {
    if (selectedFood) {
      const removedOption = selectedFood.find(
        (selected) => !opts.some((opt) => opt.label === selected.label)
      );

      if (removedOption) {
        onRemoveFood(removedOption);
      }
    }
    setSelectedFood(opts.map((opt) => opt));
  }

  function onChangeDrink(opts) {
    if (selectedDrink) {
      const removedOption = selectedDrink.find(
        (selected) => !opts.some((opt) => opt.label === selected.label)
      );

      if (removedOption) {
        onRemoveFood(removedOption);
      }
    }

    setSelectedDrink(opts.map((opt) => opt));
  }

  //달력
  const [selectedDate, setSelectedDate] = useState(moment());

  const onchangeData = (date) => {
    setSelectedDate(date);
    setSelectedFood(null);
    setSelectedDrink(null);
  };

  //수량저장

  const initialInputValues = menuItems.reduce((acc, menuItem) => {
    acc[`cash-${menuItem.id}`] = 0;
    acc[`card-${menuItem.id}`] = 0;
    acc[`transfer-${menuItem.id}`] = 0;
    return acc;
  }, {});

  const [inputValues, setInputValues] = useState(initialInputValues);

  // 저장
  const saveSales = async () => {
    const salesData = [];

    for (const menuItem of menuItems) {
      const isSelectedFood =
        selectedFood &&
        selectedFood.some((item) => item.label === menuItem.menu_name);
      const isSelectedDrink =
        selectedDrink &&
        selectedDrink.some((item) => item.label === menuItem.menu_name);

      const cashQuantity = inputValues[`cash-${menuItem.id}`];
      const cardQuantity = inputValues[`card-${menuItem.id}`];
      const transferQuantity = inputValues[`transfer-${menuItem.id}`];

      if (
        isSelectedFood ||
        isSelectedDrink ||
        cashQuantity ||
        cardQuantity ||
        transferQuantity
      ) {
        const saleData = {
          sale_date: selectedDate.format("YYYY-MM-DD"),
          category: menuItem.category,
          menu_name: menuItem.menu_name,
          price: menuItem.price,
          cash_quantity: cashQuantity,
          card_quantity: cardQuantity,
          transfer_quantity: transferQuantity,
          cash_amount: isNaN(menuItem.price * cashQuantity)
            ? null
            : menuItem.price * cashQuantity,
          card_amount: isNaN(menuItem.price * cardQuantity)
            ? null
            : menuItem.price * cardQuantity,
          transfer_amount: isNaN(menuItem.price * transferQuantity)
            ? null
            : menuItem.price * transferQuantity,
          amount: isNaN(
            menuItem.price * (cashQuantity + cardQuantity + transferQuantity)
          )
            ? null
            : menuItem.price * (cashQuantity + cardQuantity + transferQuantity),
        };
        salesData.push(saleData);
      }
    }

    try {
      // 기존 판매 데이터 불러오기
      const response = await axios.get(
        `/api/sales/${selectedDate.format("YYYY-MM-DD")}`
      );

      // 기존 데이터가 없을 경우 새로 추가
      if (response.data.length === 0) {
        const insertResponse = await axios.post("/api/sales", salesData);
        if (insertResponse.status === 200) {
          //alert("Sale data inserted successfully");
        } else {
          alert("Error inserting sale data");
        }
      } else {
        // 기존 데이터가 있을 경우 수정
        const updatePromises = salesData.map(async (saleData) => {
          const existingSale = response.data.find(
            (sale) => sale.menu_name === saleData.menu_name
          );

          if (existingSale) {
            const updatedSaleData = {
              ...saleData,
              cash_quantity:
                saleData.cash_quantity !== 0
                  ? saleData.cash_quantity
                  : existingSale.cash_quantity,
              card_quantity:
                saleData.card_quantity !== 0
                  ? saleData.card_quantity
                  : existingSale.card_quantity,
              transfer_quantity:
                saleData.transfer_quantity !== 0
                  ? saleData.transfer_quantity
                  : existingSale.transfer_quantity,
              cash_amount:
                saleData.cash_amount !== 0
                  ? saleData.cash_amount
                  : existingSale.cash_amount,
              card_amount:
                saleData.card_amount !== 0
                  ? saleData.card_amount
                  : existingSale.card_amount,
              transfer_amount:
                saleData.transfer_amount !== 0
                  ? saleData.transfer_amount
                  : existingSale.transfer_amount,
              amount:
                saleData.amount !== 0 ? saleData.amount : existingSale.amount,
            };
            await axios.put(`/api/sales/${existingSale.id}`, updatedSaleData);
          } else {
            await axios.post("/api/sales", [saleData]);
          }
        });

        await Promise.all(updatePromises);
        //alert("Sale data updated successfully");
      }
    } catch (error) {
      console.error("Error inserting or updating sale data:", error);
      alert("Error inserting or updating sale data");
    }

    saveSalesInfo();
    window.location.reload();
  };

  // 날짜별 매출

  const [salesMenu, setSalesMenu] = useState([]);
  const fetchSalesByDate = async (selectedDate) => {
    try {
      const response = await axios.get(`/api/sales/${selectedDate}`);
      setSalesMenu(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };
  const menuOptions = salesMenu.map((item) => ({
    value: item.menu_name,
    label: item.menu_name,
  }));

  // 삭제
  const deleteSale = async (menuId) => {
    try {
      const saleToDelete = salesMenu.find((sale) => sale.id === menuId);
      if (saleToDelete) {
        await axios.delete(`/api/sales/${saleToDelete.id}`);
        //alert("Sale data deleted successfully");
        setSalesMenu(salesMenu.filter((sale) => sale.id !== menuId)); // salesMenu 업데이트

        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting sale data:", error);
      alert("Error deleting sale data");
    }
  };

  async function onRemoveFood(opt) {
    const saleToDelete = salesMenu.find((sale) => sale.menu_name === opt.label);
    if (saleToDelete) {
      await deleteSale(saleToDelete.id);
      setSelectedFood(selectedFood.filter((item) => item.label !== opt.label));
    }
  }

  //행사자명, 테이블수 추가
  const [location, setLocation] = useState("");
  const [tableCount, setTableCount] = useState(0);

  const saveSalesInfo = async () => {
    const formattedDate = selectedDate.format("YYYY-MM-DD");
    const salesData = {
      location: location,
      table_count: tableCount,
      sale_date: formattedDate,
    };

    try {
      if (!salesInfo) {
        // POST request
        const response = await axios.post("/api/sales_info", salesData);
        setSalesInfo(response.data);
        //alert("Sales information created successfully");
      } else {
        // PUT request
        const response = await axios.put(
          `/api/sales_info/${salesInfo.id}`,
          salesData
        );
        setSalesInfo(response.data);
        //alert("Sales information updated successfully");
      }
    } catch (error) {
      console.error("Error saving sales data:", error);
      alert("Error saving sales data");
    }
  };

  const [salesInfo, setSalesInfo] = useState(null);

  const fetchSalesInfo = async () => {
    const formattedDate = selectedDate.format("YYYY-MM-DD");

    try {
      const response = await axios.get(`/api/sales_info/${formattedDate}`);
      if (response.data.length > 0) {
        setSalesInfo(response.data[0]);
        setLocation(response.data[0].location);
        setTableCount(response.data[0].table_count);
      } else {
        setSalesInfo(null);
        setLocation("");
        setTableCount(0);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  //useEffect
  useEffect(() => {
    if (menuItems.length > 0) {
      const initialInputValues = menuItems.reduce((acc, menuItem) => {
        acc[`cash-${menuItem.id}`] = 0;
        acc[`card-${menuItem.id}`] = 0;
        acc[`transfer-${menuItem.id}`] = 0;
        return acc;
      }, {});

      setInputValues(initialInputValues);

      fetchSalesByDate(selectedDate.format("YYYY-MM-DD")).then((data) => {
        setSelectedFood(
          data
            .filter((item) => item.category === "안주")
            .map((item) => ({ value: item.menu_name, label: item.menu_name }))
        );
        setSelectedDrink(
          data
            .filter((item) => item.category === "주류")
            .map((item) => ({ value: item.menu_name, label: item.menu_name }))
        );
      });
    }

    fetchSalesInfo();
  }, [menuItems, selectedDate]);

  return (
    <div id="content">
      <div className="cont_title">
        <h1>신비한펍 매출 입력</h1>
        <p>
          판매한 메뉴를 선택하시면 아래 테이블에 메뉴명과 금액이 자동 추가
          됩니다. <br />
          셀렉트박스에서 x를 클릭하면 삭제됩니다.
          <br />
          날짜는 자동으로 오늘 날짜 기준으로 적용되며, 날짜 버튼 클릭하여 다른
          날짜 확인 가능합니다.
          <br />
          <span>수정/추가 후 꼭 저장 버튼을 클릭해주세요.</span>
        </p>
      </div>
      <div className="sales_header">
        <ul className="cf">
          <li className="left">날짜</li>
          <li className="right">
            <DatePicker
              defaultValue={dayjs()}
              onChange={onchangeData}
              onMenuClose={(e) => {
                const removedOption = e.target.querySelector(
                  ".react-select__multi-value__remove"
                );
                if (removedOption) {
                  onRemoveFood({
                    label: removedOption.getAttribute("data-option-label"),
                  });
                }
              }}
            />
          </li>

          <li className="left">행사장명</li>
          <li className="right">
            <input
              type="text"
              id="location"
              value={location || ""}
              onChange={(e) => setLocation(e.target.value)}
            />
          </li>
          <li className="left">총 판매 테이블수</li>

          <li className="right">
            <NumberInput
              value={tableCount || 0}
              onChange={(value) => setTableCount(value)}
            />
          </li>
          <li className="left">안주 선택</li>
          <li className="right">
            <Select
              isMulti
              options={options}
              onChange={onChangeFood}
              value={selectedFood}
            />
          </li>
          <li className="left">주류 선택</li>
          <li className="right">
            <Select
              isMulti
              options={options2}
              onChange={onChangeDrink}
              value={selectedDrink}
            />
          </li>
        </ul>
        <button onClick={saveSales} className="saveBtn">
          저장
        </button>
      </div>

      <div className="sales_table">
        <table>
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>분류</th>
              <th>메뉴명</th>
              <th>가격</th>
              <th>결제수단</th>
              <th>판매수</th>
            </tr>
          </thead>
          <tbody>
            {selectedFood &&
              selectedFood.map((item, index) => {
                const menuItem = menuItems.find(
                  (menu) => menu.menu_name === item.label
                );
                const sale = salesMenu.find(
                  (sale) => sale.menu_name === item.label
                );
                return (
                  <React.Fragment key={index}>
                    <tr key={menuItem.id}>
                      <td rowSpan={3}>{menuItem.category}</td>
                      <td rowSpan={3}>{menuItem.menu_name}</td>
                      <td rowSpan={3}>
                        {menuItem
                          ? menuItem.price.toLocaleString("ko-KR", {
                              style: "currency",
                              currency: "KRW",
                            })
                          : ""}
                      </td>
                      <td>카드</td>
                      <td>
                        <NumberInput
                          value={
                            sale
                              ? sale.card_quantity
                              : inputValues[`card-${menuItem.id}`]
                          }
                          onChange={(value) =>
                            setInputValues({
                              ...inputValues,
                              [`card-${menuItem.id}`]: value,
                            })
                          }
                        />
                      </td>
                    </tr>
                    <tr key={`${menuItem.id}-1`}>
                      <td>현금</td>
                      <td>
                        <NumberInput
                          value={
                            sale
                              ? sale.cash_quantity
                              : inputValues[`cash-${menuItem.id}`]
                          }
                          onChange={(value) =>
                            setInputValues((prevInputValues) => ({
                              ...prevInputValues,
                              [`cash-${menuItem.id}`]: value,
                            }))
                          }
                        />
                      </td>
                    </tr>
                    <tr key={`${menuItem.id}-2`}>
                      <td>계좌이체</td>
                      <td>
                        <NumberInput
                          value={
                            sale
                              ? sale.transfer_quantity
                              : inputValues[`transfer-${menuItem.id}`]
                          }
                          onChange={(value) =>
                            setInputValues({
                              ...inputValues,
                              [`transfer-${menuItem.id}`]: value,
                            })
                          }
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            {selectedDrink &&
              selectedDrink.map((item, index) => {
                const menuItem = menuItems.find(
                  (menu) => menu.menu_name === item.label
                );
                const sale = salesMenu.find(
                  (sale) => sale.menu_name === item.label
                );
                return (
                  <React.Fragment key={index}>
                    <tr key={menuItem.id}>
                      <td rowSpan={3}>{menuItem.category}</td>
                      <td rowSpan={3}>{menuItem.menu_name}</td>
                      <td rowSpan={3}>
                        {menuItem
                          ? menuItem.price.toLocaleString("ko-KR", {
                              style: "currency",
                              currency: "KRW",
                            })
                          : ""}
                      </td>

                      <td>카드</td>
                      <td>
                        <NumberInput
                          value={
                            sale
                              ? sale.card_quantity
                              : inputValues[`card-${menuItem.id}`]
                          }
                          onChange={(value) =>
                            setInputValues({
                              ...inputValues,
                              [`card-${menuItem.id}`]: value,
                            })
                          }
                        />
                      </td>
                    </tr>
                    <tr key={`${menuItem.id}-1`}>
                      <td>현금</td>
                      <td>
                        <NumberInput
                          value={
                            sale
                              ? sale.cash_quantity
                              : inputValues[`cash-${menuItem.id}`]
                          }
                          onChange={(value) =>
                            setInputValues((prevInputValues) => ({
                              ...prevInputValues,
                              [`cash-${menuItem.id}`]: value,
                            }))
                          }
                        />
                      </td>
                    </tr>
                    <tr key={`${menuItem.id}-2`}>
                      <td>계좌이체</td>
                      <td>
                        <NumberInput
                          value={
                            sale
                              ? sale.transfer_quantity
                              : inputValues[`transfer-${menuItem.id}`]
                          }
                          onChange={(value) =>
                            setInputValues({
                              ...inputValues,
                              [`transfer-${menuItem.id}`]: value,
                            })
                          }
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
