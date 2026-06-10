import {
  Button,
  Checkbox,
  Code,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { config } from "../config";
import { Prism } from "@mantine/prism";

export const GreetingModal = ({ greetingModal }) => {
  return (
    <Modal
      size={"xl"}
      opened={greetingModal.isOpen}
      onClose={greetingModal.close}
      centered
      title={
        <Group spacing="md">
          <Title variant="h2"> Welcome to DCS Fiddle</Title>
        </Group>
      }
    >
      <Stack>
        <Text>
          This website is a text editor and console which talks to DCS via an
          API.
        </Text>

        <Text>
          It allows you to run any LUA code inside DCS within the target
          environment (Mission/GUI) with any state.
        </Text>

        <Title size="h3">Usage</Title>

        <Text>
          Pressing the <b>Send</b> button will submit the command to DCS, the
          result of the command is returned.
        </Text>

        <Text>
          Pressing the <b>Share</b> button will encode your script into a
          shareable link.
        </Text>

        <Title size="h3">Installation</Title>

        <Text>Download the hook</Text>

        <a href="/dcs-fiddle-server.lua" download target="_blank">
          <Group>
            <FontAwesomeIcon icon={faDownload} />
            <Text variant="link">dcs-fiddle-server.lua</Text>
          </Group>
        </a>

        <Text>
          Install it into the DCS Saved Games folder inside Scrips/Hooks.
        </Text>

        <Prism.Tabs defaultValue={"1"}>
          <Prism.TabsList>
            <Prism.Tab value={"1"}>Release</Prism.Tab>
            <Prism.Tab value={"2"}>Open Beta</Prism.Tab>
          </Prism.TabsList>

          <Prism.Panel language={"text"} value={"1"}>
            {config.script.dest}
          </Prism.Panel>
          <Prism.Panel language={"text"} value={"2"}>
            {config.script.destob}
          </Prism.Panel>
        </Prism.Tabs>

        <Text fw={600}>
          If you haven't already, you will need to de-sanitize the
          <Code>require</Code> and <Code>package</Code> module so the server can
          start
        </Text>

        <Text>
          See the Getting started guide inside the documentation for more
          information.
        </Text>

        <Text variant="link">
          <a href="/docs" target="_blank">
            Getting Started Docs
          </a>
        </Text>

        <Title size="h3">Disclaimer</Title>

        <Text fs="italic">
          The Software and code samples available on this website are provided
          "as is" without warranty of any kind, either express or implied. Use
          at your own risk. By pressing proceed you understand these risks.
        </Text>

        <Divider />

        <Group style={{ justifyContent: "space-between" }}>
          <Checkbox
            label="Dont Show Again"
            checked={greetingModal.dontShowAgainChecked}
            onChange={({ target }) =>
              greetingModal.setDontShowAgainChecked(target.checked)
            }
          />
          <Button onClick={greetingModal.close}>Proceed</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
