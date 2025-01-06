import React from "react";

import styles from "./OrderingItemsTable.module.scss";
import { OrderingItem } from "../../../types/stage";
import { Popconfirm, Table, TableProps } from "antd";
import { FaPenToSquare } from "react-icons/fa6";
import clsx from "clsx";
import { AiOutlineDelete } from "react-icons/ai";

type OrderingCardProps = {
  orderItems: OrderingItem[];
  setOrderItems: React.Dispatch<React.SetStateAction<OrderingItem[]>>;
  onChangeOrderItem: (item: OrderingItem) => void;
};

const OrderingItemsTable: React.FC<OrderingCardProps> = ({
  orderItems,
  setOrderItems,
  onChangeOrderItem,
}) => {
  const handleDeleteOrderItem = (orderItemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item._id !== orderItemId));
  };

  const columns: TableProps<OrderingItem>["columns"] = [
    {
      title: <span className="txt---600-14-18-bold">Text</span>,
      dataIndex: "text",
      key: "text",
      render: (text) => text.word,
      align: "center",
    },
    {
      title: <span className="txt---600-14-18-bold">Verb Form</span>,
      dataIndex: "verbForm",
      key: "verbForm",
    },
    {
      title: <span className="txt---600-14-18-bold">Variation</span>,
      dataIndex: "variation",
      key: "variation",
    },
    {
      title: <span className="txt---600-14-18-bold">Part Of Speech</span>,
      dataIndex: "pos",
      key: "pos",
    },
    {
      title: <span className="txt---600-14-18-bold">Correct Position</span>,
      dataIndex: "correctPosition",
      key: "correctPosition",
      render: (correctPosition) =>
        correctPosition === -1 ? "" : correctPosition,
      align: "center",
    },
    {
      title: <span className="txt---600-14-18-bold">Actions</span>,
      key: "action",
      render: (record) => (
        <div className={styles.actionsContainer}>
          <button
            className={clsx([styles.btnAction, styles.update])}
            onClick={() => {
              onChangeOrderItem(record);
            }}
          >
            <FaPenToSquare />
          </button>
          <Popconfirm
            title="Delete the ordering item"
            description="Are you sure to delete this ordering item?"
            okText="Yes"
            cancelText="No"
            placement="topLeft"
            onConfirm={() => handleDeleteOrderItem(record._id)}
          >
            <button className={clsx([styles.btnAction, styles.delete])}>
              <AiOutlineDelete />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.orderingCardContainer}>
      <Table
        columns={columns}
        dataSource={orderItems}
        pagination={{
          pageSize: 5,
        }}
      />
    </div>
  );
};

export default OrderingItemsTable;
