import { ActionIcon, Collapse, Group, Stack, Text } from "@mantine/core";
import { useToggle } from "react-use";
import { CollapseButton } from "./CollapseButton";
import Editor from "@monaco-editor/react";
import { isObject } from "lodash";
import { Prism } from "@mantine/prism";
import fileDownload from "js-file-download";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const bytes = require("bytes");

export const Response = ({ date, response }) => {
  const [collapsed, toggleCollapse] = useToggle(false);
  const responseData = JSON.stringify(response, undefined, 2);
  const length = (responseData.match(/\n/g) || [0]).length;
  const displayRes = isObject(response) ? responseData : response;

  const responseBytes = displayRes.length;

  const isTooLarge = responseBytes > bytes("1mb");

  const tooLargeMessage = `The response is ${bytes(
    responseBytes
  )}, download to view.`;

  return (
    <Stack spacing={2}>
      <Group p={4}>
        <CollapseButton collapsed={collapsed} onClick={toggleCollapse} />
        <Text size={"sm"}>{date}</Text>
        <ActionIcon onClick={() => fileDownload(displayRes, `${date}.json`)}>
          <FontAwesomeIcon icon={faDownload} />
        </ActionIcon>
      </Group>
      <Collapse in={!collapsed}>
        {isTooLarge ? (
          <Prism language="text">{tooLargeMessage}</Prism>
        ) : (
          // Not a fan of this hight solution but it works
          <div
            style={{
              height: `${(length + 2) * 19}px`,
              maxHeight: "80vh",
            }}
          >
            <Editor
              theme="vs-dark"
              defaultLanguage="json"
              defaultValue={responseData}
              onMount={() => {}}
              options={{
                readOnly: true,
                fontFamily: "IBM Plex Mono",
                fontSize: 14,
                domReadOnly: true,
              }}
            />
          </div>
        )}
      </Collapse>
    </Stack>
  );
};
