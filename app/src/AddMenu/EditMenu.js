import React, { useState, useEffect } from "react";
import "./EditMenu.css";

const EditMenuModal = ({ isModalOpen, closeModal, item, handleEditSave }) => {
  const [editingCategory, setEditingCategory] = useState(
    item ? item.category : ""
  );
  const [editingMenuName, setEditingMenuName] = useState(
    item ? item.menu_name : ""
  );
  const [editingPrice, setEditingPrice] = useState(item ? item.price : "");
  const [editingRemark, setEditingRemark] = useState(item ? item.remark : "");

  useEffect(() => {
    setEditingCategory(item ? item.category : "");
    setEditingMenuName(item ? item.menu_name : "");
    setEditingPrice(item ? item.price : "");
    setEditingRemark(item ? item.remark : " ");
  }, [item]);

  if (!item) {
    return null;
  }

  const handleSave = () => {
    handleEditSave(
      item.id,
      editingCategory,
      editingMenuName,
      editingPrice,
      editingRemark
    );
    closeModal();
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className={`modal ${isModalOpen ? "show" : "hide"}`}
      //   onClick={handleBackgroundClick}
    >
      <div className="modal-content">
        <h3>
          <span>{editingCategory}</span> 수정
        </h3>
        <div className="input_wrap">
          <div className="hidden">
            <input
              type="text"
              placeholder="Category"
              value={editingCategory}
              onChange={(e) => setEditingCategory(e.target.value)}
            />
          </div>
          <div className="inputBox margin">
            <input
              type="text"
              placeholder="메뉴명"
              value={editingMenuName}
              onChange={(e) => setEditingMenuName(e.target.value)}
            />
          </div>
          <div className="inputBox margin">
            <input
              type="number"
              placeholder="가격"
              value={editingPrice}
              onChange={(e) => setEditingPrice(e.target.value)}
            />
          </div>
          <div className="inputBox2 margin">
            <input
              type="text"
              placeholder="비고"
              value={editingRemark}
              onChange={(e) => setEditingRemark(e.target.value)}
            />
          </div>
          <div className="btnBox">
            <button
              onClick={() =>
                handleEditSave({
                  category: editingCategory,
                  menu_name: editingMenuName,
                  price: editingPrice,
                  remark: editingRemark,
                })
              }
            >
              수정
            </button>

            <button onClick={closeModal}>취소</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMenuModal;
