import {
  Autocomplete,
  Button,
  Code,
  Divider,
  Group,
  Header,
  HoverCard,
  Image,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleXmark,
  faCompass,
  faInfo,
  faInfoCircle,
  faPaperPlane,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import ms from "ms";
import { isEmpty } from "lodash";

export const AppHeader = ({
  envs,
  env,
  status,
  submitting,
  onSubmit,
  onShare,
  onShowGreetingModal,
  onExplore,
  onChangeEnv,
}) => {
  const theme = useMantineTheme();

  const getIcon = () => {
    switch (status.state) {
      case "up":
        return (
          <FontAwesomeIcon
            color={theme.colors["green"][7]}
            icon={faCheckCircle}
          />
        );
      case "checking":
        return <Loader size="xs" />;
      case "error":
        return (
          <FontAwesomeIcon
            color={theme.colors["red"][7]}
            icon={faCircleXmark}
          />
        );
    }
  };

  return (
    <Header height={66} p={"xs"} zIndex={1}>
      <Group>
        <Image height={48} width={48} src={"/logo256.png"} />
        <Title style={{ fontFamily: "IBM Plex Mono" }}>DCS Fiddle...</Title>
      </Group>
      <Group>
        <Group>
          <Title size="h3">Environment:</Title>
          <SegmentedControl
            value={env.id}
            data={envs.map((it) => ({
              value: it.id,
              label: it.name,
            }))}
            onChange={(it) => onChangeEnv(it, env.selectedState)}
          />
          <HoverCard withArrow offset={15}>
            <HoverCard.Target>
              <FontAwesomeIcon icon={faInfoCircle} />
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Stack>
                <Title size="h3">Define a custom state</Title>
                <Divider />
                <Text fw={600}>Executed lua MUST return a string.</Text>
                <Text color="white">
                  Alternative states will use
                  <Code color="white">dostring_in</Code>
                  response values must be strings
                </Text>
                <Text color="white">For more information see the docs:</Text>
                <Text variant="link">
                  <a
                    href="https://wiki.hoggitworld.com/view/DCS_func_dostring_in"
                    target="_blank"
                  >
                    https://wiki.hoggitworld.com/view/DCS_func_dostring_in
                  </a>
                </Text>
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
          <Autocomplete
            defaultValue={env.selectedState}
            data={env.states}
            placeholder="Add Optional State"
            onBlur={(it) =>
              onChangeEnv(
                env.id,
                isEmpty(it.target.value) ? undefined : it.target.value
              )
            }
          />
          {getIcon()}
        </Group>
        <Tooltip label="Explorer" openDelay={ms("1s")}>
          <Button
            onClick={onExplore}
            variant="subtle"
            disabled={status.state !== "up"}
          >
            <FontAwesomeIcon icon={faCompass} />
          </Button>
        </Tooltip>
        <Tooltip label="Information" openDelay={ms("1s")}>
          <Button onClick={onShowGreetingModal} variant="subtle">
            <FontAwesomeIcon icon={faInfo} />
          </Button>
        </Tooltip>
        <Tooltip label="Create a shareable link" openDelay={ms("1s")}>
          <Button onClick={onShare} variant="light">
            <Group>
              Share <FontAwesomeIcon icon={faShare} />
            </Group>
          </Button>
        </Tooltip>
        <Tooltip
          label="Send the editor content to DCS and execute it"
          openDelay={ms("1s")}
        >
          <Button
            loading={submitting}
            onClick={onSubmit}
            disabled={status.state !== "up"}
          >
            <Group>
              Send <FontAwesomeIcon icon={faPaperPlane} />
            </Group>
          </Button>
        </Tooltip>
      </Group>
    </Header>
  );
};
