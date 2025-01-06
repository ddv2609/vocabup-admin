import React, { useMemo, useState } from "react";
import { Admin, Params, User } from "../types";

import styles from "./FilterPosts.module.scss";
import {
  Avatar,
  Button,
  DatePicker,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
} from "antd";
import { IoIosSearch } from "react-icons/io";
import { BsCalendar2Date } from "react-icons/bs";
import { RangePickerProps } from "antd/es/date-picker/generatePicker/interface";
import dayjs, { Dayjs } from "dayjs";
import { MemberService } from "../service";
import { HiOutlineFilter } from "react-icons/hi";
import _ from "lodash";
import { FaKey, FaUser } from "react-icons/fa6";
import { RxReload } from "react-icons/rx";
import { PiHeartBold } from "react-icons/pi";

const { RangePicker } = DatePicker;

type FilterProps = {
  filterInfo: Params;
  handleChangeFilterInfo: (
    key: string,
    val: string | number | boolean | unknown | null | undefined
  ) => void;
  handleFilterPosts: () => void;
};

const FilterPosts: React.FC<FilterProps> = ({
  filterInfo,
  handleChangeFilterInfo,
  handleFilterPosts,
}) => {
  const [searchedUsers, setSearchedUsers] = useState<(User | Admin)[]>([]);

  const handleChangeDateFilter: RangePickerProps<Dayjs>["onCalendarChange"] = (
    _,
    dateStrings
  ) => {
    handleChangeFilterInfo("fromDate", dateStrings[0]);
    handleChangeFilterInfo("toDate", dateStrings[1]);
  };

  const _debonceSearchUsers = useMemo(
    () => _.debounce((q: string) => loadUsersBySearch(q), 1000),
    []
  );

  const handleSearchUsers = async (newValue: string) => {
    if (newValue?.trim()) {
      _debonceSearchUsers(newValue);
    }
  };

  const loadUsersBySearch = async (q: string) => {
    const [
      { data: responseUser, status: statusUser },
      { data: responseAdmin, status: statusAdmin },
    ] = await Promise.all([
      MemberService.searchUsers(q),
      MemberService.searchAdmins(q),
    ]);

    if (statusUser < 400 && statusAdmin < 400) {
      setSearchedUsers([
        ...responseAdmin.data.admins,
        ...responseUser.data.users,
      ]);
    } else {
      if (statusUser < 400) setSearchedUsers(responseUser.data.users);
      if (statusAdmin < 400) setSearchedUsers(responseUser.data.admins);
    }
  };

  return (
    <div className={styles.filterPostsContainer}>
      <div className={styles.filterPostsWrapper}>
        <div className={styles.search}>
          <Popconfirm
            title={
              <Space>
                <IoIosSearch size={14} />
                <span className="txt---600-14-22-bold">Search</span>
              </Space>
            }
            placement="bottomLeft"
            icon={null}
            description={
              <Input
                placeholder="Enter a key"
                value={filterInfo.query as string}
                onChange={(e) =>
                  handleChangeFilterInfo("query", e.target.value)
                }
              />
            }
            okText={<span className="txt---600-14-22-regular">Search</span>}
            cancelText={<span className="txt---600-14-22-regular">Reset</span>}
            onConfirm={handleFilterPosts}
            onCancel={() => handleChangeFilterInfo("query", "")}
          >
            <Button
              icon={<IoIosSearch />}
              shape="circle"
              color={filterInfo.query ? "primary" : "default"}
              variant="outlined"
            />
          </Popconfirm>
        </div>
        <Popconfirm
          title={
            <Space>
              <BsCalendar2Date size={14} />
              <span className="txt---600-14-22-bold">Date Picker</span>
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
          okText={<span className="txt---600-14-22-regular">Pick</span>}
          cancelText={<span className="txt---600-14-22-regular">Reset</span>}
          onConfirm={handleFilterPosts}
          onCancel={() => {
            handleChangeFilterInfo("fromDate", null);
            handleChangeFilterInfo("toDate", null);
          }}
        >
          <Button
            icon={<BsCalendar2Date />}
            shape="circle"
            color={
              filterInfo?.fromDate || filterInfo?.endDate
                ? "primary"
                : "default"
            }
            variant="outlined"
          />
        </Popconfirm>
        {/* <Popconfirm
          title={
            <Space>
              <RxSlider size={14} />
              <span className="txt---600-14-22-bold">Views</span>
            </Space>
          }
          placement="bottomLeft"
          icon={null}
          description={
            <div className={styles.viewsSearch}>
              Min{" "}
              <Slider
                min={-1}
                max={2000}
                range
                value={[
                  (filterInfo.minViews || 0) as number,
                  (filterInfo.maxViews || 0) as number,
                ]}
                onChange={(range: number[]) => {
                  handleChangeFilterInfo("minViews", range[0]);
                  handleChangeFilterInfo("maxViews", range[1]);
                }}
              />{" "}
              Max
            </div>
          }
          okText={<span className="txt---600-14-22-regular">Search</span>}
          cancelText={<span className="txt---600-14-22-regular">Reset</span>}
          onConfirm={handleFilterPosts}
          onCancel={() => {
            handleChangeFilterInfo("minViews", -1);
            handleChangeFilterInfo("maxViews", -1);
          }}
        >
          <Button
            icon={<RxSlider />}
            shape="circle"
            color={
              ((filterInfo.minView || 0) as number) > 0 ||
              ((filterInfo.maxView || 0) as number) > 0
                ? "primary"
                : "default"
            }
            variant="outlined"
          />
        </Popconfirm> */}
        <Popconfirm
          title={
            <Space>
              <PiHeartBold size={14} />
              <span className="txt---600-14-22-bold">Min Reacts</span>
            </Space>
          }
          placement="bottomLeft"
          icon={null}
          description={
            <div className={styles.reactsFilter}>
              <InputNumber
                min={0}
                value={filterInfo.minReacts as number}
                onChange={(num) =>
                  handleChangeFilterInfo("minReacts", num || 0)
                }
                onPressEnter={handleFilterPosts}
                style={{
                  minWidth: "148px",
                }}
              />
            </div>
          }
          okText={<span className="txt---600-14-22-regular">Filter</span>}
          cancelText={<span className="txt---600-14-22-regular">Reset</span>}
          onConfirm={handleFilterPosts}
          onCancel={() => {
            handleChangeFilterInfo("minReacts", 0);
          }}
        >
          <Button
            icon={<PiHeartBold />}
            shape="circle"
            color={filterInfo.minReacts ? "primary" : "default"}
            variant="outlined"
          />
        </Popconfirm>
        <Select
          defaultValue={filterInfo.author as string}
          value={filterInfo.author as string}
          showSearch
          placeholder="Select a user"
          allowClear
          style={{
            minWidth: "214px",
          }}
          // notFoundContent={null}
          filterOption={false}
          options={searchedUsers.map((user) => ({
            value:
              user.role === "admin" ? (user as Admin).uid : (user as User)._id,
            label: (
              <div
                className={styles.authorSearched}
                title={`${user.role === "admin" ? "ADMIN" : "USER"} - ${
                  user?.fullName?.firstName
                } ${user?.fullName?.lastName}/${user.email}`}
              >
                <Space align="center" size={8}>
                  <Avatar
                    shape="circle"
                    size={24}
                    src={user?.avatar}
                    icon={user?.avatar ? null : <FaUser />}
                  />
                  <span
                    className={"txt---400-14-18-regular"}
                  >{`${user?.fullName?.firstName} ${user?.fullName?.lastName}`}</span>
                </Space>
                {user.role === "admin" && (
                  <div className={styles.adminMarkup}>
                    <FaKey />
                  </div>
                )}
              </div>
            ),
          }))}
          onChange={(value: string) => handleChangeFilterInfo("author", value)}
          onSearch={handleSearchUsers}
        />
        <Button
          icon={<HiOutlineFilter />}
          onClick={handleFilterPosts}
          color="primary"
          variant="filled"
        />
        <div className={styles.reload}>
          <Button
            type="default"
            icon={<RxReload />}
            shape="circle"
            onClick={handleFilterPosts}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPosts;
