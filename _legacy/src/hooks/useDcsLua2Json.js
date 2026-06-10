import axios from "axios";
import { Code, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { useEnvironment } from "../context/environment";

export const useDcsLua2Json = (luaTable) => {
  const { environment } = useEnvironment();
  const [data, setData] = useState();

  useEffect(() => {
    if (luaTable) {
      axios
        .get(
          `http://127.0.0.1:${environment.port}/${btoa(
            luaTable.replace(/^.*?\s=\s/, "return")
          )}`,
          {
            params: { env: environment.selectedState || "default" },
          }
        )
        .then((it) => {
          setData(it.data.result);
        })
        .catch((e) => {
          setData(undefined);
          showNotification({
            title: "Failed to Convert Lua Table",
            message: (
              <Stack>
                <Text>{e.toString()}</Text>
                {e.response?.data?.error && (
                  <Code>{e.response.data.error}</Code>
                )}
              </Stack>
            ),
            color: "red",
          });
        });
    }
  }, [luaTable]);

  return data;
};
