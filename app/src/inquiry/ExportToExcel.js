import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const ExportToExcel = ({ apiData, fileName }) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportToCSV = (apiData, fileName) => {
    const dataWithNewKeys = apiData.map(
      ({
        id,
        sale_date,
        category,
        menu_name,
        price,
        card_quantity,
        card_amount,
        cash_quantity,
        cash_amount,
        transfer_quantity,
        transfer_amount,
        amount,
        table_count,
        location,
        ...rest
      }) => ({
        날짜: sale_date,
        종류: category,
        메뉴: menu_name,
        금액: price,
        "카드 판매량": card_quantity,
        "카드 판매액": card_amount,
        "현금 판매량": cash_quantity,
        "현금 판매액": cash_amount,
        "계좌이체 판매량": transfer_quantity,
        "계좌이체 판매액": transfer_amount,
        "총 판매량": card_quantity + cash_quantity + transfer_quantity,
        "총 판매액": amount,
        "판매 테이블수": table_count,
        장소: location,
        ...rest,
      })
    );
    const ws = XLSX.utils.json_to_sheet(dataWithNewKeys);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  return (
    <button onClick={(e) => exportToCSV(apiData, fileName)} className="exelBtn">
      엑셀다운로드
    </button>
  );
};

export default ExportToExcel;
