import { Button, Input, Space, TableColumnType } from "antd";
import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { IoSearchOutline } from "react-icons/io5";
import Highlighter from "react-highlight-words";

type DataIndex = string;

export const getColumnSearchProps = <T extends object>(
  dataIndex: DataIndex,
  searchText: string,
  searchedColumn: string,
  toggleFilterDropdown: string,
  setSearchText: React.Dispatch<React.SetStateAction<string>>,
  setSearchedColumn: React.Dispatch<React.SetStateAction<string>>,
  handleResetRecords: () => void,
  handleToggleFilterDropdown: (searchedColumn: string) => void
): TableColumnType<T> => {
  const handleSearch = (selectedKeys: string[]) => {
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex as string);
    handleToggleFilterDropdown("");
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
    handleResetRecords();
    handleToggleFilterDropdown("");
  };

  const handleClose = () => {
    handleToggleFilterDropdown("");
  };

  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      clearFilters,
    }): React.ReactNode => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
          onPressEnter={() => handleSearch(selectedKeys as string[])}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[])}
            icon={<IoSearchOutline />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={handleClose}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined
        style={{
          color:
            filtered || toggleFilterDropdown === dataIndex
              ? "#1677ff"
              : undefined,
        }}
      />
    ),
    filterDropdownOpen: toggleFilterDropdown === dataIndex,
    onFilterDropdownOpenChange: () =>
      handleToggleFilterDropdown(dataIndex as string),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  };
};
