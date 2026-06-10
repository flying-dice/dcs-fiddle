import { List, Modal, Stack, Text, TextInput, Title } from "@mantine/core";
import { ExploreNode } from "./ExploreNode";
import { useState } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ExploreModal = ({ onClose, open }) => {
  const [filter, setFilter] = useState("");

  return (
    <Modal
      title={<Title variant="h2">Explorer</Title>}
      onClose={onClose}
      opened={open}
      overflow="inside"
      size="50vw"
    >
      <Stack>
        <Text>
          From here you can explore the DCS scripting environment, functions
          need to be called via a script.
        </Text>

        <TextInput
          icon={<FontAwesomeIcon icon={faSearch} />}
          placeholder={
            "Search using minimatch syntax, i.e. */db/Units/Planes/Plane/*/*+(Name|type|WorldID)"
          }
          defaultValue={filter}
          onBlur={(ev) => setFilter(ev.target.value)}
        />

        <List>
          <ExploreNode k={"_G"} v={"root"} scope={[]} filter={filter} />
        </List>
      </Stack>
    </Modal>
  );
};
