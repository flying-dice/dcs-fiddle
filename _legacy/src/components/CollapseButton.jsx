import { ActionIcon, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export const CollapseButton = ({ collapsed, onClick }) => {
  return (
    <Tooltip
      label={collapsed ? "Expand" : "Collapse"}
      withArrow
      position="bottom"
    >
      <ActionIcon onClick={onClick}>
        {collapsed ? (
          <FontAwesomeIcon icon={faChevronRight} />
        ) : (
          <FontAwesomeIcon icon={faChevronDown} />
        )}
      </ActionIcon>
    </Tooltip>
  );
};
