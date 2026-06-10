import { createContext, useContext, useEffect, useState } from "react";
import { config } from "../config";
import { Code, Stack, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import useSWR from "swr";
import { find, first } from "lodash";
import { useSearchParam } from "react-use";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const EnvironmentContext = createContext({});

export const useEnvironment = () => useContext(EnvironmentContext);

const def = first(config.envs);

export const EnvironmentContextProvider = ({ children }) => {
  const pathEnv = useSearchParam("env");
  const pathState = useSearchParam("state");

  const pathEnvironment = pathEnv && find(config.envs, { id: pathEnv });

  const [env, setEnv] = useState(
    pathEnvironment
      ? { ...pathEnvironment, selectedState: pathState || undefined }
      : { ...def, selectedState: pathState || undefined }
  );

  const { data, error, isLoading } = useSWR(
    `http://127.0.0.1:${env.port}/${btoa('return "UP"')}?env=${
      env.selectedState || "default"
    }`,
    fetcher
  );

  const setEnvironment = (id, state) => {
    console.log("Selecting Environment", { id, state });
    setEnv({ ...find(config.envs, { id }), selectedState: state });
  };

  const getState = () => {
    if (isLoading) return "checking";
    if (data?.result === "UP") return "up";
    if (data?.result !== "UP" || error) return "error";
  };

  useEffect(() => {
    if (!error) return;

    showNotification({
      title: <Title size="h6">Failed to connect</Title>,
      message: (
        <Stack>
          <Text>Failed to connect to the selected environment</Text>
          <Code color="white">{error.toString()}</Code>
        </Stack>
      ),
      color: "red",
    });
  }, [error]);

  useEffect(() => {
    if (!data || data.result === "UP") return;

    showNotification({
      title: <Title size="h6">Connection Error</Title>,
      message: (
        <Stack>
          <Text>Connected to the environment but received an error</Text>
          <Code color="white">{data.result}</Code>
        </Stack>
      ),
      color: "orange",
    });
  }, [data]);

  return (
    <EnvironmentContext.Provider
      value={{
        environments: config.envs,
        environment: env,
        setEnvironment,
        status: {
          error: data?.result !== "UP" ? data?.result : error?.toString(),
          state: getState(),
        },
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};
