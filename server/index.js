const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// app.get("/users", (req, res) => {
//   const query = "SELECT * FROM users";

//   db.query(query, (error, results) => {
//     if (error) {
//       console.error("Error executing the query:", error);
//       res.status(500).send("Error executing the query");
//       return;
//     }
//     res.json(results);
//   });
// });

// 로그인
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM user WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      res.status(500).send({ message: "Internal server error" });
    } else {
      // if (result.length > 0) {
      //   res.status(200).send({ message: "Login successful" });
      // } else {
      //   res.status(401).send({ message: "Invalid username or password" });
      // }
      if (result.length > 0) {
        res
          .status(200)
          .send({ message: "Login successful", userId: result[0].user_id });
      } else {
        res.status(401).send({ message: "Invalid username or password" });
      }
    }
  });
});

// 메뉴 추가 부분
app.post("/api/menu", (req, res) => {
  const { category, menu_name, price, remark } = req.body;
  const query = `INSERT INTO menu (category, menu_name, price, remark) VALUES (?, ?, ?, ?)`; // 수정

  db.query(query, [category, menu_name, price, remark], (error, results) => {
    // 수정
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(201).json({ message: "메뉴 추가 성공" });
  });
});

app.get("/api/menu", (req, res) => {
  const query = "SELECT * FROM menu";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      res.status(500).send("Error executing the query");
      return;
    }
    res.json(results);
  });
});

//메뉴 삭제
app.delete("/api/menu/:id", (req, res) => {
  const itemId = req.params.id;
  const query = "DELETE FROM menu WHERE id = ?";

  db.query(query, [itemId], (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ message: "삭제 완료" });
  });
});

//메뉴 수정
app.put("/api/menu/:id", (req, res) => {
  const itemId = req.params.id;
  const { category, menu_name, price, remark } = req.body;
  const query = `UPDATE menu SET category = ?, menu_name = ?, price = ?, remark = ? WHERE id = ?`;
  db.query(
    query,
    [category, menu_name, price, remark, itemId],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      console.log("Updated:", results);
      res.json({ message: "수정 완료" });
    }
  );
});

// 매출 추가 또는 수정
// 이 함수를 추가하세요.
const queryPromise = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};
//
app.post("/api/sales", async (req, res) => {
  const salesData = req.body;

  const salesLength = salesData.length;
  let updatedCount = 0;
  let insertedCount = 0;

  if (!Array.isArray(salesData)) {
    res.status(400).json({ message: "Invalid sales data format" });
    return;
  }

  if (salesLength === 0) {
    res.status(400).send("No data to insert");
    return;
  }

  for (const sale of salesData) {
    const {
      sale_date,
      category,
      menu_name,
      price,
      cash_quantity,
      card_quantity,
      transfer_quantity,
      cash_amount,
      card_amount,
      transfer_amount,
      amount,
    } = sale;

    const selectQuery = `
      SELECT id, cash_quantity, card_quantity, transfer_quantity, cash_amount, card_amount, transfer_amount, amount
      FROM sales
      WHERE sale_date = ? AND category = ? AND menu_name = ? AND price = ?
    `;

    try {
      const selectResults = await queryPromise(selectQuery, [
        sale_date,
        category,
        menu_name,
        price,
      ]);

      if (selectResults.length > 0) {
        const {
          id,
          cash_quantity: existing_cash_quantity,
          card_quantity: existing_card_quantity,
          transfer_quantity: existing_transfer_quantity,
          cash_amount: existing_cash_amount,
          card_amount: existing_card_amount,
          transfer_amount: existing_transfer_amount,
          amount: existing_amount,
        } = selectResults[0];

        const updatedSale = {
          cash_quantity:
            (cash_quantity !== undefined && cash_quantity !== null
              ? cash_quantity
              : 0) + existing_cash_quantity,
          card_quantity:
            (card_quantity !== undefined && card_quantity !== null
              ? card_quantity
              : 0) + existing_card_quantity,
          transfer_quantity:
            (transfer_quantity !== undefined && transfer_quantity !== null
              ? transfer_quantity
              : 0) + existing_transfer_quantity,
          cash_amount:
            (cash_amount !== undefined && cash_amount !== null
              ? cash_amount
              : 0) + existing_cash_amount,
          card_amount:
            (card_amount !== undefined && card_amount !== null
              ? card_amount
              : 0) + existing_card_amount,
          transfer_amount:
            (transfer_amount !== undefined && transfer_amount !== null
              ? transfer_amount
              : 0) + existing_transfer_amount,
          amount:
            (amount !== undefined && amount !== null ? amount : 0) +
            existing_amount,
        };

        const updateQuery = `
          UPDATE sales
          SET cash_quantity = ?, card_quantity = ?, transfer_quantity = ?,
              cash_amount = ?, card_amount = ?, transfer_amount = ?, amount = ?
          WHERE id = ?
        `;
        await queryPromise(updateQuery, [
          updatedSale.cash_quantity,
          updatedSale.card_quantity,
          updatedSale.transfer_quantity,
          updatedSale.cash_amount,
          updatedSale.card_amount,
          updatedSale.transfer_amount,
          updatedSale.amount,
          id,
        ]);
        console.log("Updated sale:", id);
        updatedCount++;
      } else {
        // Insert new sale
        const insertQuery = `
          INSERT INTO sales (
            sale_date, category, menu_name, price,
            cash_quantity, card_quantity, transfer_quantity,
            cash_amount, card_amount, transfer_amount, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await queryPromise(insertQuery, [
          sale_date,
          category,
          menu_name,
          price,
          cash_quantity,
          card_quantity,
          transfer_quantity,
          cash_amount,
          card_amount,
          transfer_amount,
          amount,
        ]);
        // console.log("Inserted new sale:", menu_name);
        insertedCount++;
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error processing sale" });
      return;
    }
  }

  res.status(200).json({
    message: "Sales processed successfully",
    updatedCount,
    insertedCount,
  });
});

// 매출 전부
app.get("/api/sales", (req, res) => {
  const query = "SELECT * FROM sales";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      res.status(500).send("Error executing the query");
      return;
    }

    // Convert sale_date to local timezone
    results.forEach((result) => {
      const saleDate = new Date(result.sale_date);
      const localDate = new Date(
        saleDate.getTime() - saleDate.getTimezoneOffset() * 60 * 1000
      );
      result.sale_date = localDate.toISOString().split("T")[0];
    });

    res.json(results);
  });
});

// 매출 전부2
app.get("/api/sales2", (req, res) => {
  const { start_date, end_date } = req.query;
  const query = "SELECT * FROM sales WHERE sale_date >= ? AND sale_date <= ?";

  db.query(query, [start_date, end_date], (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      res.status(500).send("Error executing the query");
      return;
    }

    // Convert sale_date to local timezone
    results.forEach((result) => {
      const saleDate = new Date(result.sale_date);
      const localDate = new Date(
        saleDate.getTime() - saleDate.getTimezoneOffset() * 60 * 1000
      );
      result.sale_date = localDate.toISOString().split("T")[0];
    });

    res.json(results);
  });
});

//날짜별 매출불러오기
app.get("/api/sales/:date", async (req, res) => {
  const { date } = req.params;
  const query =
    "SELECT id, menu_name, sale_date, category, menu_name, cash_quantity, card_quantity, transfer_quantity, cash_amount, card_amount, transfer_amount, amount FROM sales WHERE sale_date = ?";

  db.query(query, [date], (error, results) => {
    if (error) {
      console.error("Error finding sales:", error);
      res.status(500).json({ message: "Error finding sales" });
    } else {
      if (results.length > 0) {
        // Convert sale_date to local timezone
        results.forEach((result) => {
          const saleDate = new Date(result.sale_date);
          const localDate = new Date(
            saleDate.getTime() - saleDate.getTimezoneOffset() * 60 * 1000
          );
          result.sale_date = localDate.toISOString().split("T")[0];
        });

        res.status(200).json(results);
      } else {
        res;
        res.status(200).json([]);
      }
    }
  });
});

// Update a sale by id
app.put("/api/sales/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query =
      "UPDATE sales SET menu_name = ?, sale_date = ?, category = ?, menu_name = ?, cash_quantity = ?, card_quantity = ?, transfer_quantity = ?, cash_amount = ?, card_amount = ?, transfer_amount = ?, amount = ? WHERE id = ?";

    // You should adjust the values and their order in the array to match the columns you want to update
    const updateValues = [
      req.body.menu_name,
      req.body.sale_date,
      req.body.category,
      req.body.menu_name,
      req.body.cash_quantity,
      req.body.card_quantity,
      req.body.transfer_quantity,
      req.body.cash_amount,
      req.body.card_amount,
      req.body.transfer_amount,
      req.body.amount,
      id,
    ];

    db.query(query, updateValues, (error, results) => {
      if (error) {
        console.error("Error updating sale:", error);
        res.status(500).json({ message: "Error updating sale" });
      } else {
        if (results.affectedRows > 0) {
          res.status(200).json({ message: "Sale updated successfully" });
        } else {
          res.status(404).json({ message: "Sale not found" });
        }
      }
    });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ message: "Error updating sale" });
  }
});

//매출 삭제
app.delete("/api/sales/:id", (req, res) => {
  const itemId = req.params.id;
  const query = "DELETE FROM sales WHERE id = ?";

  db.query(query, [itemId], (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ message: "삭제 완료" });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 행사장명, 테이블수
app.post("/api/sales_info", (req, res) => {
  const { sale_date, table_count, location } = req.body;
  const query = `INSERT INTO sales_info (sale_date, table_count, location) VALUES (?, ?, ?)`;

  db.query(query, [sale_date, table_count, location], (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(201).json({ message: "sales_info 추가 성공" });
  });
});

app.get("/api/sales_info/:date", (req, res) => {
  const { date } = req.params;
  const query =
    "SELECT id, sale_date, table_count, location FROM sales_info WHERE sale_date = ?";

  db.query(query, [date], (error, results) => {
    if (error) {
      console.error("Error finding sales info:", error);
      res.status(500).json({ message: "Error finding sales info" });
    } else {
      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(200).json([]);
      }
    }
  });
});

//매출확인에서 테이블수 확인
app.get("/api/sales_info2", (req, res) => {
  const { start_date, end_date } = req.query;
  const query =
    "SELECT * FROM sales_info WHERE sale_date >= ? AND sale_date <= ?";

  db.query(query, [start_date, end_date], (error, results) => {
    if (error) {
      console.error("Error executing the query:", error);
      res.status(500).send("Error executing the query");
      return;
    }

    // Convert sale_date to local timezone
    results.forEach((result) => {
      const saleDate = new Date(result.sale_date);
      const localDate = new Date(
        saleDate.getTime() - saleDate.getTimezoneOffset() * 60 * 1000
      );
      result.sale_date = localDate.toISOString().split("T")[0];
    });

    res.json(results);
  });
});

app.put("/api/sales_info/:id", async (req, res) => {
  const { id } = req.params;
  const { sale_date, table_count, location } = req.body;

  try {
    const query = `
      UPDATE sales_info
      SET sale_date = ?, table_count = ?, location = ?
      WHERE id = ?
    `;
    await db.query(query, [sale_date, table_count, location, id]);
    res.status(200).json({ message: "Sales info updated successfully" });
  } catch (error) {
    console.error("Error updating sales info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
