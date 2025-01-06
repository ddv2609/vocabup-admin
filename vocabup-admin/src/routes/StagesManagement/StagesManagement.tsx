import React, { useEffect, useState } from "react";

import styles from "./StagesManagement.module.scss";
import { Stage } from "../../types/stage";
import { StageService } from "../../service";
import StageCard from "../../components/Stage/StageCard";
import { callMessage, loadingFullScreen } from "../../redux/slice";
import StageInfoModal from "../../components/Modal/StageInfoModal";
import { Button } from "antd";
import { LuBookPlus } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { MessageType } from "../../constants";
import { FormattedMessage } from "react-intl";

const StagesManagement: React.FC = () => {
  const dispatch = useDispatch();
  const [stages, setStages] = useState<Stage[]>([]);

  const [currentStage, setCurrentStage] = useState<Stage>();

  const [toggleStageModal, setToggleStageModal] = useState<boolean>(false);

  const handleToggleModal = () => setToggleStageModal((prev) => !prev);
  const handleChangeCurrentStage = (stage: Stage) => setCurrentStage(stage);

  const loadAllStages = async () => {
    dispatch(loadingFullScreen(true));
    const { data: response, status } = await StageService.getAllStages();

    if (status < 400) {
      setStages(response.data.stages);
    }

    dispatch(loadingFullScreen(false));
  };

  const handleUpdateStage = async (
    stage: Partial<Stage>,
    successCb: (data: { [key: string]: string }) => void,
    failCb: () => void
  ) => {
    const { data: response, status } = await StageService.updateStage(stage);

    if (status < 400) {
      setStages((prev) =>
        prev.map((item) => {
          if (item._id !== stage._id) return item;
          return response.data.stage;
        })
      );
      setCurrentStage(undefined);
      successCb(response.data.stage);
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    } else {
      failCb();
    }
  };

  const handleAddStage = async (
    stage: Partial<Stage>,
    successCb: (data: { [key: string]: string }) => void,
    failCb: () => void
  ) => {
    const { data: response, status } = await StageService.addStage(stage);

    if (status < 400) {
      const newStage = response.data.stages[0];
      setStages((prev) => [...prev, newStage]);
      setCurrentStage(undefined);
      successCb(newStage);
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    } else {
      failCb();
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const { data: response, status } = await StageService.deleteStage(stageId);

    if (status < 400) {
      setStages((prev) => prev.filter((item) => item._id !== stageId));

      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
  };

  useEffect(() => {
    loadAllStages();
  }, []);
  return (
    <div className={styles.stagesManagementContainer}>
      <div className={styles.stageActions}>
        <Button
          icon={<LuBookPlus />}
          onClick={() => {
            setCurrentStage({
              _id: `new-${Date.now()}`,
            } as Stage);
            handleToggleModal();
          }}
        >
          <FormattedMessage id="stages-management.add-new-stage" />
        </Button>
      </div>
      {stages.map((stage: Stage) => (
        <StageCard
          key={stage._id}
          stage={stage}
          onToggleModal={handleToggleModal}
          onViewDetail={handleChangeCurrentStage}
          onDeleteStage={handleDeleteStage}
        />
      ))}
      {currentStage && (
        <StageInfoModal
          modalStatus={toggleStageModal}
          stage={currentStage}
          onCancel={() => {
            handleToggleModal();
            setCurrentStage(undefined);
          }}
          onConfirm={(
            transferBody: Partial<Stage>,
            preCb: () => void,
            successCb: (data: { [key: string]: string }) => void,
            failCb: () => void
          ) => {
            preCb();
            if (!currentStage._id.includes("new")) {
              handleUpdateStage(
                {
                  ...transferBody,
                  _id: currentStage._id,
                },
                successCb,
                failCb
              );
            } else {
              handleAddStage(transferBody, successCb, failCb);
            }
          }}
        />
      )}
    </div>
  );
};

export default StagesManagement;
