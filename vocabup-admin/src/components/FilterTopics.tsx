import React from "react";

import styles from "./FilterTopics.module.scss";
import { Button, Input, Space } from "antd";
import { HiOutlineFilter } from "react-icons/hi";
import { Params } from "../types";
import { FormattedMessage, useIntl } from "react-intl";

type FilterTopicsProps = {
  filterInfo: Params;
  handleChangeFilterInfo: (key: string, val: string) => void;
  handleFilterTopics: () => void;
};

const FilterTopics: React.FC<FilterTopicsProps> = ({
  filterInfo,
  handleChangeFilterInfo,
  handleFilterTopics,
}) => {
  const intl = useIntl();
  return (
    <div className={styles.filterTopicsContainer}>
      <Space>
        <span className="txt---600-14-22-bold">
          <FormattedMessage id="common.topic" />:{" "}
        </span>
        <Input
          placeholder={intl.formatMessage({ id: "common.filter-topic" })}
          value={filterInfo.q as string}
          onChange={(e) => handleChangeFilterInfo("q", e.target.value)}
        />
      </Space>
      <Button
        color="primary"
        variant="filled"
        icon={<HiOutlineFilter />}
        onClick={handleFilterTopics}
      >
        <span className="txt---400-14-22-regular">
          <FormattedMessage id="common.filter" />
        </span>
      </Button>
    </div>
  );
};

export default FilterTopics;
