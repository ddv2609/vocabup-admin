import React from "react";

import styles from "./TextEllipsis.module.scss";
import { Tooltip } from "antd";
import { TooltipPlacement } from "antd/es/tooltip";

type TextEllipsisProps = {
  texts: string[];
  amount: number;
  placement?: TooltipPlacement;
  arrow?: boolean;
};

const TextEllipsis: React.FC<TextEllipsisProps> = ({
  texts,
  amount,
  placement,
  arrow = true,
}) => {
  return (
    <div className={styles.textEllipsisContainer}>
      {texts.slice(0, amount).join(", ")}
      {texts.length > amount && <span>{", "}</span>}
      {texts.length > amount && (
        <Tooltip
          title={texts.slice(amount).join(", ")}
          trigger={["click", "hover"]}
          placement={placement || "bottomLeft"}
          arrow={arrow}
        >
          <span className={styles.ellipsis}>{`+${texts.length - amount}`}</span>
        </Tooltip>
      )}
    </div>
  );
};

export default TextEllipsis;
