import { Group, Modal, Stack, Text, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useObservable } from "react-use";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

/**
 * Share a Link Dialog, used for people to share the link to their editor content
 *
 * @param open {boolean} Bool value, is open or not
 * @param link$ {Observable<string>} RXJS Observable of the link
 * @param onClose {() => void} Function to be invoked onClose
 */
export const ShareModal = ({ open, onClose, link$ }) => {
  const link = useObservable(link$);

  return (
    <Modal
      withCloseButton
      size={"xl"}
      title={
        <Group spacing="md">
          <FontAwesomeIcon icon={faPaperPlane} />
          <Title variant="h2"> Share Script</Title>
        </Group>
      }
      opened={open}
      onClose={onClose}
    >
      <Stack>
        <Text>Share this link to send your LUA script.</Text>
        <Text>
          This link contains your script as base64. Nobody can change your local
          script.
        </Text>
        <Prism
          styles={{ code: { whiteSpace: "pre-wrap", lineBreak: "anywhere" } }}
          language="shell"
        >
          {link}
        </Prism>
      </Stack>
    </Modal>
  );
};
