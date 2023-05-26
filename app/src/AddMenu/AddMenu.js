import React, { useState, useEffect } from "react";
import axios from "axios";

import "./addmenu.css";

import EditMenuModal from "./EditMenu";
const AddMenu = () => {
  // 메뉴 확인
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

  // 메뉴 추가
  const [category1, setCategory1] = useState("안주");
  const [menuName1, setMenuName1] = useState("");
  const [price1, setPrice1] = useState("");
  const [remark1, setRemark1] = useState("");

  const [category2, setCategory2] = useState("주류");
  const [menuName2, setMenuName2] = useState("");
  const [price2, setPrice2] = useState("");
  const [remark2, setRemark2] = useState("");

  const formatPrice = (price) => {
    return price.toLocaleString("ko-KR", {
      style: "currency",
      currency: "KRW",
    });
  };

  const handleSubmit = async (
    e,
    category,
    menuName,
    price,
    remark,
    setCategory,
    setMenuName,
    setPrice,
    setRemark
  ) => {
    e.preventDefault();
    try {
      await axios.post("/api/menu", {
        category,
        menu_name: menuName,
        price: parseInt(price),
        remark,
      });
      // alert("메뉴 추가 성공");
      const formattedPrice = Number(price).toLocaleString("ko-KR", {
        style: "currency",
        currency: "KRW",
      });
      setMenuItems([
        ...menuItems,
        {
          id: Date.now(),
          category,
          menu_name: menuName,
          price: parseInt(price),
          remark,
        },
      ]);
      setCategory(category);
      setMenuName("");
      setPrice("");
      setRemark("");
    } catch (error) {
      console.error(error);
      alert("An error occurred while adding the menu item");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1].focus();
      e.preventDefault();
    }
  };

  // 메뉴 추가 버튼 활성
  const [menuAddBtn, setMenuAddBtn] = useState(false);
  const [menuAddBtn2, setMenuAddBtn2] = useState(false);
  const handleMenuAdd = () => {
    if (menuAddBtn) {
      setMenuAddBtn(false);
    } else {
      setMenuAddBtn(true);
    }
  };
  const handleMenuAdd2 = () => {
    if (menuAddBtn2) {
      setMenuAddBtn2(false);
    } else {
      setMenuAddBtn2(true);
    }
  };

  //메뉴삭제
  const handleDelete = async (itemId) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/api/menu/${itemId}`);
        //alert("메뉴 삭제 성공");
        fetchMenuItems(); // refresh the menu list
      } catch (error) {
        console.error(error);
        alert("An error occurred while deleting the menu item");
      }
    }
  };
  // 메뉴수정
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (item) => {
    handleEdit(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [editingItemId, setEditingItemId] = useState(null); // 추가: 수정 중인 항목의 ID
  const [editingCategory, setEditingCategory] = useState("");
  const [editingMenuName, setEditingMenuName] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [editingRemark, setEditingRemark] = useState("");

  // 수정 버튼 클릭 시 호출되는 함수
  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setEditingCategory(item.category);
    setEditingMenuName(item.menu_name);
    setEditingPrice(item.price);
    setEditingRemark(item.remark);
  };

  // 모달 팝업 창에서 수정 취소 버튼을 클릭할 때 호출되는 함수
  const handleEditCancel = () => {
    setEditingItemId(null);
    setEditingCategory("");
    setEditingMenuName("");
    setEditingPrice("");
    setEditingRemark("");
  };

  // 모달 팝업 창에서 수정 저장 버튼을 클릭할 때 호출되는 함수
  const handleEditSave = async (editedItem) => {
    try {
      console.log(editedItem);
      await axios.put(`/api/menu/${editingItemId}`, editedItem);
      closeModal(); // 모달 팝업 창 닫기
      fetchMenuItems(); // 메뉴 목록 업데이트
      handleEditCancel(); // 수정 취소
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating the menu item");
    }
  };

  return (
    <div id="content">
      <div className="cont_title">
        <h1>신비한펍 메뉴 관리</h1>
        <p>
          새로운 메뉴는 오른쪽 '추가' 버튼 클릭하여 추가 가능합니다. (입력 후
          엔터키 눌러도 가능합니다)
        </p>
      </div>

      <EditMenuModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        item={menuItems.find((item) => item.id === editingItemId)}
        handleEditSave={handleEditSave}
      />

      <div className="cate_wrap">
        <div className="cate_title">
          <h2>안주</h2>
          <button className="addBtn" onClick={handleMenuAdd}>
            {menuAddBtn ? "닫기" : "추가"}
          </button>
        </div>
        <form
          onSubmit={(e) =>
            handleSubmit(
              e,
              category1,
              menuName1,
              price1,
              remark1,
              setCategory1,
              setMenuName1,
              setPrice1,
              setRemark1
            )
          }
          className={`${menuAddBtn ? "on" : ""}`}
        >
          <input
            type="text"
            placeholder="Category"
            value={category1}
            onChange={(e) => setCategory1(e.target.value)}
            className="hidden"
          />
          <input
            type="text"
            placeholder="메뉴이름"
            value={menuName1}
            onChange={(e) => setMenuName1(e.target.value)}
          />
          <input
            type="number"
            placeholder="가격"
            value={price1}
            onChange={(e) => setPrice1(e.target.value)}
          />
          <input
            type="text"
            placeholder="비고"
            value={remark1}
            onChange={(e) => setRemark1(e.target.value)}
          />
          <button type="submit" onKeyPress={handleKeyPress}>
            메뉴 추가
          </button>
        </form>
        <div>
          <table>
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>메뉴명</th>
                <th>가격</th>
                <th>비고</th>
                <th>삭제/수정</th>
              </tr>
            </thead>
            <tbody>
              {menuItems
                .filter((item) => item.category === "안주")
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.menu_name}</td>
                    <td className="price">{formatPrice(item.price)}</td>
                    <td>{item.remark}</td>
                    <td className="btn_wrap">
                      <button className="edit" onClick={() => openModal(item)}>
                        수정
                      </button>
                      <button
                        className="del"
                        onClick={() => handleDelete(item.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* 안주끝 */}
      <div className="cate_wrap">
        <div className="cate_title">
          <h2>주류</h2>
          <button className="addBtn" onClick={handleMenuAdd2}>
            {menuAddBtn2 ? "닫기" : "추가"}
          </button>
        </div>
        <form
          onSubmit={(e) =>
            handleSubmit(
              e,
              category2,
              menuName2,
              price2,
              remark2,
              setCategory2,
              setMenuName2,
              setPrice2,
              setRemark2
            )
          }
          className={`${menuAddBtn2 ? "on" : ""}`}
        >
          <input
            type="text"
            placeholder="Category"
            value={category2}
            onChange={(e) => setCategory2(e.target.value)}
            className="hidden"
          />
          <input
            type="text"
            placeholder="메뉴명"
            value={menuName2}
            onChange={(e) => setMenuName2(e.target.value)}
          />

          <input
            type="number"
            placeholder="가격"
            value={price2}
            onChange={(e) => setPrice2(e.target.value)}
          />
          <input
            type="text"
            placeholder="비고"
            value={remark2}
            onChange={(e) => setRemark2(e.target.value)}
          />
          <button type="submit">메뉴 추가</button>
        </form>
        <div>
          <table>
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>메뉴명</th>
                <th>가격</th>
                <th>비고</th>
                <th>삭제/수정</th>
              </tr>
            </thead>
            <tbody>
              {menuItems
                .filter((item) => item.category === "주류")
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.menu_name}</td>
                    <td className="price">
                      {item.price.toLocaleString("ko-KR", {
                        style: "currency",
                        currency: "KRW",
                      })}
                    </td>
                    <td>{item.remark}</td>
                    <td className="btn_wrap">
                      <button className="edit" onClick={() => openModal(item)}>
                        수정
                      </button>
                      <button
                        className="del"
                        onClick={() => handleDelete(item.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* 주류끝 */}
    </div>
  );
};

export default AddMenu;
