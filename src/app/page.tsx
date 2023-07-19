"use client";

import { ClipboardEventHandler, useState } from "react";

export default function Home() {
  const [origin, setOrigin] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const convert = () => {
    const table = fromTextToTable(origin);
    console.log(table);
    if (table) {
      setResult(toSql(table, true));
    }
  };

  return (
    <>
      <div className="flex flex-col m-10 gap-4">
        <h1 className="text-5xl">Excel / SQL 表格转换</h1>
        <div>
          <p>
            使用方法：复制Excel（或金山表格），粘贴在上面的文本框中，点击「转换」。然后复制下方生成的内容，将其作为一个表来用（WITH或者直接JOIN他）。
          </p>
          <p>
            转换的内容仅支持Presto查询（如需其他查询，请将AS后的内容改名为非中文字符，并删除双引号）
          </p>
        </div>

        <textarea
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="h-40 resize-y border rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={convert}
          className="px-4 py-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        >
          convert
        </button>
        <textarea
          value={result}
          readOnly
          className="h-40 resize-y border rounded-lg p-2 mt-2 focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
    </>
  );
}

function fromTextToTable(origin: string) {
  if (origin === "") console.log("no input");
  const rows: Array<Array<string>> | undefined = origin
    ?.split("\n")
    .map((line) => {
      return line.split("\t");
    });

  console.log(rows);
  if (rows) {
    if (rows.length > 1) {
      if (rows.every((v) => v.length === rows[0].length)) {
        return rows;
      }
    }
  }
  alert("粘贴的表格信息不正确");
}

function toSql(input: Array<Array<string>>, hasHeader: boolean): string {
  let header: string[];
  if (hasHeader) {
    header = input.shift() as Array<string>;
    console.log(header);
  } else {
    header = Array<string>(input[0].length)
      .fill("")
      .map((_, i) => "i");
  }

  return `SELECT * FROM
    (
      VALUES
      ( ${input.map(sqlRowMapping).join("), \n(")})
    ) AS your_table_name ("${header.join('", "')}")
  `;
}

function sqlRowMapping(row: Array<string>): string {
  return row
    .map((item) => {
      if (item === "") {
        return "NULL";
      } else if (!isNaN(Number(item))) {
        return item;
      } else {
        return `'${item}'`;
      }
    })
    .join(", ");
}
