import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";
var headers = new Headers();

headers.append("Authorization", "Basic " + btoa("admin:admin"));

export default function (props) {
  const [result, setResult] = useState();
  const [data_show, setData_show] = useState();
  const [data_num, setData_num] = useState(0);
  useEffect(() => {
    fetch("http://localhost:5984/occlusion_mask/_design/test/_view/test", {
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        const len = data.rows.length;
        console.log(data.rows, len);
        setResult(data.rows);
        setData_show(data.rows[len - 1]);
      });
  }, []);
  return (
    <div style={{ padding: "15px" }}>
      <ReactJson src={data_show} theme="google" style={{ fontSize: "15px" }} />
    </div>
  );
}
