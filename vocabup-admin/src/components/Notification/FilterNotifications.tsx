import React, { ChangeEventHandler, useEffect, useMemo, useState } from "react";

import styles from "./FilterNotifications.module.scss";
import ListNotification from "./ListNotification";
import { MemberService, NotificationService } from "../../service";
import { AppNotification } from "../../types/notification";
import SpinInContainer from "../SpinInContainer";
import emitter from "../../utils/EventEmitter";
import { EventEmit, MessageType } from "../../constants";
import { useReduxDispatch, useReduxSelector } from "../../hooks";
import { Button, DatePicker, Input, Popconfirm, Select, Space } from "antd";
import { RxReload } from "react-icons/rx";
import _ from "lodash";
import dayjs, { Dayjs } from "dayjs";
import { RangePickerProps } from "antd/es/date-picker/generatePicker/interface";
import { IoIosSearch } from "react-icons/io";
import { Params } from "../../types";
import { HiOutlineFilter } from "react-icons/hi";
import { BsCalendar2Date } from "react-icons/bs";
import { Admin } from "../../types/members";
import { callMessage } from "../../redux/slice";
import { FormattedMessage } from "react-intl";

const { RangePicker } = DatePicker;

type FilterInfomation = {
  q: string;
  adminId: string | null;
  start: string | null;
  end: string | null;
};

const FilterNotifications: React.FC = () => {
  const admin = useReduxSelector((state) => state.app.admin);
  const dispatch = useReduxDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [pageInfo, setPageInfo] = useState({
    currPage: 0,
    pageSize: 3,
    hasNext: true,
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterInfo, setFilterInfo] = useState<FilterInfomation>({
    q: "",
    adminId: null,
    start: null,
    end: null,
  });

  const [searchedAdmin, setSearchedAdmin] = useState<Admin[]>([
    admin as unknown as Admin,
  ]);

  const _debonceSearchAdmins = useMemo(
    () => _.debounce((q: string) => loadAdminsBySearch(q), 1000),
    []
  );

  const handleGetNotifications = async (page?: number, size?: number) => {
    setLoading(true);

    const { data: response, status } =
      await NotificationService.getAppNotifications(
        _.isNumber(page) ? page : pageInfo.currPage,
        size || pageInfo.pageSize,
        filterInfo as Params
      );

    if (status < 400) {
      if (response.data.currPage === pageInfo.currPage + 1) {
        setNotifications((prev) => [...prev, ...response.data.notifications]);
      } else {
        setNotifications(response.data.notifications);
      }

      setPageInfo((prev) => ({
        ...prev,
        currPage: _.isNumber(page) ? pageInfo.currPage : response.data.currPage,
        // pageSize: response.data.size,
        hasNext: response.data.hasNextPage,
      }));
    }

    setLoading(false);
  };

  const handleReloadNotifications = () => {
    handleGetNotifications(0, notifications.length);
  };

  const handleFilterNotifications = async () => {
    setLoading(true);

    const { data: response, status } =
      await NotificationService.getAppNotifications(
        0,
        pageInfo.pageSize,
        filterInfo as Params
      );

    if (status < 400) {
      setNotifications(response.data.notifications);

      setPageInfo((prev) => ({
        ...prev,
        currPage: response.data.currPage,
        pageSize: response.data.size,
        hasNext: response.data.hasNextPage,
      }));
    }

    setLoading(false);
  };

  const handleChangeQueryString: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFilterInfo((prev) => ({ ...prev, q: e.target.value }));
  };

  const handleChangeDateFilter: RangePickerProps<Dayjs>["onCalendarChange"] = (
    _,
    dateStrings
  ) => {
    setFilterInfo(
      (prev) =>
        ({
          ...prev,
          start: dateStrings[0],
          end: dateStrings[1],
        } as FilterInfomation)
    );
  };

  const loadAdminsBySearch = async (q: string) => {
    const { data: response, status } = await MemberService.searchAdmins(q);

    if (status < 400) {
      setSearchedAdmin(response.data.admins);
    }
  };

  const handleSearchAdmins = async (newValue: string) => {
    if (newValue?.trim()) {
      _debonceSearchAdmins(newValue);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    setLoading(true);
    const { data: response, status } =
      await NotificationService.deleteAppNotification(notificationId);

    setLoading(false);
    if (status < 400) {
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
  };

  useEffect(() => {
    const handleListenPushAppNotification = (
      newNotification: AppNotification
    ) => {
      setNotifications((prev) => [
        {
          ...newNotification,
          sender: {
            _id: admin?.uid || "",
            fullName: admin?.fullName || "",
            avatar: admin?.avatar || "",
          },
        } as AppNotification,
        ...prev,
      ]);
    };

    emitter.on(EventEmit.PushAppNotification, handleListenPushAppNotification);

    return () => {
      emitter.off(
        EventEmit.PushAppNotification,
        handleListenPushAppNotification
      );
    };
  }, [admin]);

  useEffect(() => {
    handleGetNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={styles.filterNotificationsContainer}>
        <div className={styles.filterNotificationsWrapper}>
          <div className={styles.search}>
            <Popconfirm
              title={
                <Space>
                  <IoIosSearch size={14} />
                  <span className="txt---600-14-22-bold">
                    <FormattedMessage id="common.search" />
                  </span>
                </Space>
              }
              placement="bottomLeft"
              icon={null}
              description={
                <Input
                  placeholder="Enter a key"
                  value={filterInfo.q}
                  onChange={handleChangeQueryString}
                />
              }
              okText={
                <span className="txt---600-14-22-regular">
                  <FormattedMessage id="common.search" />
                </span>
              }
              cancelText={
                <span className="txt---600-14-22-regular">
                  <FormattedMessage id="common.reset" />
                </span>
              }
              onConfirm={handleFilterNotifications}
              onCancel={() => setFilterInfo((prev) => ({ ...prev, q: "" }))}
            >
              <Button
                icon={<IoIosSearch />}
                shape="circle"
                color={filterInfo.q ? "primary" : "default"}
                variant="outlined"
              />
            </Popconfirm>
          </div>
          <Popconfirm
            title={
              <Space>
                <BsCalendar2Date size={14} />
                <span className="txt---600-14-22-bold">
                  <FormattedMessage id="common.date-picker" />
                </span>
              </Space>
            }
            placement="bottomLeft"
            icon={null}
            description={
              <RangePicker
                value={
                  filterInfo?.start || filterInfo?.end
                    ? [
                        filterInfo?.start ? dayjs(filterInfo.start) : null,
                        filterInfo?.end ? dayjs(filterInfo.end) : null,
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
            onConfirm={handleFilterNotifications}
            onCancel={() =>
              setFilterInfo((prev) => ({ ...prev, start: null, end: null }))
            }
          >
            <Button
              icon={<BsCalendar2Date />}
              shape="circle"
              color={
                filterInfo?.start || filterInfo?.end ? "primary" : "default"
              }
              variant="outlined"
            />
          </Popconfirm>
          <Select
            defaultValue={filterInfo.adminId}
            value={filterInfo.adminId}
            showSearch
            placeholder="Select a admin"
            allowClear
            // notFoundContent={null}
            filterOption={false}
            options={searchedAdmin.map((admin) => ({
              value: admin?.uid,
              label: `${admin?.fullName?.firstName} ${admin?.fullName?.lastName}`,
            }))}
            onChange={(value: string) =>
              setFilterInfo((prev) => ({ ...prev, adminId: value }))
            }
            onSearch={handleSearchAdmins}
          />
          <Button
            icon={<HiOutlineFilter />}
            onClick={handleFilterNotifications}
            color="primary"
            variant="filled"
          />
          <div className={styles.reload}>
            <Button
              type="default"
              icon={<RxReload />}
              shape="circle"
              onClick={handleReloadNotifications}
            />
          </div>
        </div>
        <ListNotification
          notifications={notifications}
          hasNext={pageInfo.hasNext}
          getExtraNotification={() => handleGetNotifications()}
          handleDeleteNotification={handleDeleteNotification}
        />
      </div>
      {loading && <SpinInContainer />}
    </>
  );
};

export default FilterNotifications;
