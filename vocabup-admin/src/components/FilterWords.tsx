import React from "react";

import styles from "./FilterWords.module.scss";
import { Button, Input, Select, Space } from "antd";
import { HiOutlineFilter } from "react-icons/hi";
import { useReduxSelector } from "../hooks";
import { Topic } from "../types/topic";
import { Params } from "../types";
import _ from "lodash";
import { FormattedMessage } from "react-intl";

type FilterProps = {
  filterInfo: Params;
  handleChangeFilterInfo: (key: string, val: string) => void;
  handleFilterWords: () => void;
};

const partOfSpeeches: string[] = [
  "noun",
  "pronoun",
  "verb",
  "adverb",
  "adjective",
  "preposition",
  "conjunction",
  "interjection",
  "idiom",
  "phrase",
  "determiner",
];

const FilterWords: React.FC<FilterProps> = ({
  filterInfo,
  handleChangeFilterInfo,
  handleFilterWords,
}) => {
  const allTopics: Topic[] = useReduxSelector((state) => state.word.topics);

  return (
    <div className={styles.filterWordsContainer}>
      <Space>
        <span className="txt---600-14-22-bold">
          <FormattedMessage id="common.word" />:{" "}
        </span>
        <Input
          placeholder="Enter a word / translation"
          value={filterInfo.q as string}
          onChange={(e) => handleChangeFilterInfo("q", e.target.value)}
        />
      </Space>

      <Space>
        <span className="txt---600-14-22-bold">
          <FormattedMessage id="common.topic" />:{" "}
        </span>
        <Select
          mode="multiple"
          allowClear
          placeholder="All topics"
          value={
            filterInfo.topics ? (filterInfo.topics as string).split(",") : []
          }
          options={(allTopics || []).map((topic) => ({
            value: topic._id,
            label: topic.topic,
          }))}
          onChange={(_, options) => {
            handleChangeFilterInfo(
              "topics",
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
        <span className="txt---600-14-22-bold">PoS: </span>
        <Select
          mode="multiple"
          allowClear
          placeholder="All part of speeches"
          options={partOfSpeeches.map((pos) => ({
            value: pos,
            label: _.capitalize(pos),
          }))}
          onChange={(_, options) => {
            handleChangeFilterInfo(
              "poses",
              Array.isArray(options)
                ? options.map((option) => option.value).join(",")
                : options.value
            );
          }}
          style={{
            minWidth: "164px",
          }}
          maxTagCount="responsive"
        />
      </Space>

      <Button
        color="primary"
        variant="filled"
        icon={<HiOutlineFilter />}
        onClick={handleFilterWords}
      >
        <span className="txt---400-14-22-regular">
          <FormattedMessage id="common.filter" />
        </span>
      </Button>
    </div>
  );
};

export default FilterWords;
