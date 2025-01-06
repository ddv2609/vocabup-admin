import { Select } from "antd";
import { debounce } from "lodash";
import React, { useMemo, useRef, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";

type DebounceSelectProps = {
  fetchOptions: (q: string) => Promise<object[]>;
  debounceTimeout: number;
  value: Option[];
  onChange: (obj: Option[]) => void;
  mode?: "multiple" | "tags";
  maxCount?: number;
  size?: "small" | "middle" | "large";
};

type Option = {
  value: string;
  label: string;
};

const DebounceSelect: React.FC<DebounceSelectProps> = ({
  fetchOptions,
  debounceTimeout,
  value,
  onChange,
  mode,
  maxCount,
  size,
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<object[]>([]);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (q: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(q).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  return (
    <Select
      labelInValue
      mode={mode}
      maxCount={maxCount}
      filterOption={false}
      value={value}
      onSearch={debounceFetcher}
      size={size}
      placeholder="Enter text to search"
      notFoundContent={
        fetching ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "72px",
            }}
          >
            <LoadingOutlined
              style={{
                fontSize: "24px",
                color: "var(--text-primary-color)",
              }}
            />
          </div>
        ) : null
      }
      onChange={onChange}
      options={options}
    />
  );
};

export default DebounceSelect;
