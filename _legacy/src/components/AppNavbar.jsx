import { ActionIcon, Navbar, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faHome,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/fontawesome-free-brands";
import { useLocation } from "react-use";
import { faFileZipper } from "@fortawesome/free-regular-svg-icons";

const slashify = (str) => (str.endsWith("/") ? str : `${str}/`);

const NavbarLink = ({ label, path, onClick, icon }) => {
  const { pathname } = useLocation();
  const active = path && slashify(path) === slashify(pathname);

  return (
    <Tooltip label={label}>
      <ActionIcon
        size={50}
        color={(active && "#5983D8") || "gray"}
        variant={active ? "light" : "subtle"}
        style={{
          borderRadius: 0,
          borderLeftColor: active && "#90E3F1",
        }}
        onClick={onClick}
      >
        <FontAwesomeIcon icon={icon} />
      </ActionIcon>
    </Tooltip>
  );
};

export const AppNavbar = ({ router }) => {
  return (
    <Navbar styles={{ root: { height: "100%" } }}>
      <Navbar.Section grow>
        <NavbarLink
          path={"/"}
          label={"Home"}
          icon={faHome}
          onClick={() => router.navigate("/")}
        />
        <NavbarLink
          path={"/diff"}
          label={"Miz File Diff"}
          icon={faFileZipper}
          onClick={() => router.navigate("/diff")}
        />
        <NavbarLink
          path={"/docs"}
          label={"Documentation"}
          icon={faBook}
          onClick={() => router.navigate("/docs")}
        />
        <NavbarLink
          label="Support"
          onClick={() =>
            window.open("https://github.com/JonathanTurnock/dcsfiddle/issues")
          }
          icon={faQuestionCircle}
        />
        <NavbarLink
          label="Github"
          onClick={() =>
            window.open("https://github.com/JonathanTurnock/dcsfiddle")
          }
          icon={faGithub}
        />
      </Navbar.Section>
    </Navbar>
  );
};
