import React from "react";

import styles from "./StageCard.module.scss";
import { Stage } from "../../types/stage";
import clsx from "clsx";
import { Button, Popconfirm, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { Path } from "../../constants";
import {
  DeleteOutlined,
  EyeOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { FormattedMessage } from "react-intl";

type StageCardProps = {
  stage: Stage;
  onToggleModal: () => void;
  onViewDetail: (stage: Stage) => void;
  onDeleteStage: (stageId: string) => Promise<void>;
};

const StageCard: React.FC<StageCardProps> = ({
  stage,
  onToggleModal,
  onViewDetail,
  onDeleteStage,
}) => {
  const nav = useNavigate();

  return (
    <div className={styles.stageCardContainer}>
      <div className={styles.stageCardImg}>
        <img src="/course-card.jpg" />
      </div>
      <div className={clsx([styles.stagePart, "txt---600-18-22-bold"])}>
        {stage.part}
      </div>
      <div className={styles.stageInfoWrapper}>
        <h4 className="txt---600-16-20-bold">{stage.topic}</h4>
        <div className={clsx([styles.stageDesc, "txt---400-12-16-regular"])}>
          {stage.description || (
            <i className="txt---600-12-16-bold">
              <FormattedMessage id="common.no-desc" />
            </i>
          )}
        </div>
        <div className={styles.stageActions}>
          <Tooltip title="View detail lessons">
            <Button
              className={clsx(["txt---600-12-16-bold"])}
              onClick={() =>
                nav(Path.LESSONS_MANAGEMENT, {
                  state: {
                    stage,
                  },
                })
              }
              icon={<UnorderedListOutlined />}
            >
              <FormattedMessage id="stages-management.view-lessons" />
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete the stage"
            description="Are you sure to delete this stage?"
            okText="Yes"
            cancelText="No"
            placement="top"
            onConfirm={async () => {
              await onDeleteStage(stage._id);
              return Promise.resolve();
            }}
          >
            {/* <Tooltip title="Delete stage">
            </Tooltip> */}
            <Button
              className={clsx(["txt---600-12-16-bold"])}
              icon={<DeleteOutlined />}
              danger
              type="text"
            />
          </Popconfirm>
          <Tooltip title="View stage infomations">
            <Button
              className={clsx(["txt---600-12-16-bold"])}
              onClick={() => {
                onToggleModal();
                onViewDetail(stage);
              }}
              icon={<EyeOutlined />}
              type="text"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default StageCard;
