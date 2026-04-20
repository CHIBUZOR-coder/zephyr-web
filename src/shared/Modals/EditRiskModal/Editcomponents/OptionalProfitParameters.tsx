import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { IoMdOptions } from "react-icons/io";
import Input from "./Input";

export default function OptionalProfitParameters() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 24 }}>
      {/* Toggle */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          border: "1px dashed #1f3c3c",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
          background: "#0d1f1f",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <IoMdOptions color="#fff" size={20} />
          <p style={{ color: "#fff", margin: 0 }}>Optional Profit Parameters</p>
        </div>

        <FiChevronDown
          style={{
            color: "#fff",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>

      {/* Content */}
      {open && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <Input
            label="Take Profit Target (%)"
            placeholder="25"
            value=""
            info="Auto-close position when profit reaches this percentage."
          />

          <Input
            label="Stop Loss Override (%)"
            placeholder="10"
            value=""
            info="Override trader's stop loss."
          />

          <Input
            label="Trailing Stop Distance"
            placeholder="Coming soon"
            value=""
            info="Auto adjust stop loss."
          />
        </div>
      )}
    </div>
  );
}
