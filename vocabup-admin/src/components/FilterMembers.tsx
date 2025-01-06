import React from "react";

import styles from "./FilterMembers.module.scss";
import { Button, DatePicker, Input, Popconfirm, Select, Space } from "antd";
import { HiOutlineFilter } from "react-icons/hi";
import { capitalize } from "lodash";
import { Params } from "../types";
import { BsCalendar2Date } from "react-icons/bs";
import dayjs, { Dayjs } from "dayjs";
import { RangePickerProps } from "antd/es/date-picker/generatePicker/interface";
import { FormattedMessage, useIntl } from "react-intl";
const { RangePicker } = DatePicker;

type FilterMembersProps = {
  filterInfo: Params;
  handleChangeFilterInfo: (
    key: string,
    val: string | null | number | boolean | unknown
  ) => void;
  handleFilterUsers: () => void;
};

const FilterMembers: React.FC<FilterMembersProps> = ({
  filterInfo,
  handleChangeFilterInfo,
  handleFilterUsers,
}) => {
  const intl = useIntl();
  const handleChangeDateFilter: RangePickerProps<Dayjs>["onCalendarChange"] = (
    _,
    dateStrings
  ) => {
    handleChangeFilterInfo("fromDate", dateStrings[0]);
    handleChangeFilterInfo("toDate", dateStrings[1]);
  };

  return (
    <div className={styles.filterMembersContainer}>
      <Space>
        <span className="txt---600-14-22-bold">
          <FormattedMessage id="common.user" />:{" "}
        </span>
        <Input
          placeholder={intl.formatMessage({ id: "common.filter-user-desc" })}
          value={filterInfo.q as string}
          onChange={(e) => handleChangeFilterInfo("q", e.target.value)}
        />
      </Space>
      <Space>
        <span className="txt---600-14-22-bold">
          <FormattedMessage id="common.gender" />:{" "}
        </span>
        <Select
          allowClear
          onClear={() => handleChangeFilterInfo("gender", "")}
          placeholder="Select gender"
          value={filterInfo.gender}
          options={["male", "female", "other"].map((gender) => ({
            value: gender,
            label: capitalize(intl.formatMessage({ id: `common.${gender}` })),
          }))}
          onChange={(_, options) => {
            handleChangeFilterInfo(
              "gender",
              Array.isArray(options)
                ? options.map((option) => option.value).join(",")
                : options.value
            );
          }}
          style={{
            minWidth: "204px",
            // maxWidth: "80%",
            // width: "100%",
          }}
          maxTagCount="responsive"
        />
      </Space>
      <Space>
        <span className="txt---600-14-22-bold">
          <FormattedMessage id="common.address" />:{" "}
        </span>
        <Input
          placeholder={intl.formatMessage({ id: "common.filter-user-address" })}
          value={filterInfo.addr as string}
          onChange={(e) => handleChangeFilterInfo("addr", e.target.value)}
        />
      </Space>
      <Space>
        <Popconfirm
          title={
            <Space>
              <BsCalendar2Date size={14} />
              <span className="txt---600-14-22-bold">
                <FormattedMessage id="common.dob" />
              </span>
            </Space>
          }
          placement="bottomLeft"
          icon={null}
          description={
            <RangePicker
              value={
                filterInfo?.fromDate || filterInfo?.toDate
                  ? [
                      filterInfo?.fromDate
                        ? dayjs(filterInfo.fromDate as string)
                        : null,
                      filterInfo?.toDate
                        ? dayjs(filterInfo.toDate as string)
                        : null,
                    ]
                  : null
              }
              onCalendarChange={handleChangeDateFilter}
            />
          }
          okText={
            <span className="txt---600-14-22-regular">
              <FormattedMessage id="common.pick" />
            </span>
          }
          cancelText={
            <span className="txt---600-14-22-regular">
              <FormattedMessage id="common.reset" />
            </span>
          }
          onConfirm={handleFilterUsers}
          onCancel={() => {
            handleChangeFilterInfo("fromDate", null);
            handleChangeFilterInfo("toDate", null);
          }}
        >
          <Button
            icon={<BsCalendar2Date />}
            shape="circle"
            color={
              filterInfo?.fromDate || filterInfo?.toDate ? "primary" : "default"
            }
            variant="outlined"
          />
        </Popconfirm>
      </Space>
      <Button
        color="primary"
        variant="filled"
        icon={<HiOutlineFilter />}
        onClick={handleFilterUsers}
      >
        <span className="txt---400-14-22-regular">
          <FormattedMessage id="common.filter" />
        </span>
      </Button>
    </div>
  );
};

export default FilterMembers;
