import styles from "./docs.module.css";
import {
  Alert,
  Code,
  Container,
  Image,
  LoadingOverlay,
  NavLink,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useSWR from "swr";
import axios from "axios";
import React from "react";
import { z } from "zod";
import { Prism } from "@mantine/prism";
import { trimStart } from "lodash";
import { useNavigate } from "react-router-dom";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const elementProps = z.object({
  children: z
    .any()
    .optional()
    .transform((it) => it?.toString()),
});

const codeProps = elementProps.extend({
  inline: z.boolean().optional().transform(Boolean),
  className: z.string().optional(),
});
const _Code = (props) => {
  const { inline, className, children } = codeProps.parse(props);

  const deleted = { color: "red", label: "-" };
  const added = { color: "green", label: "+" };

  const highlights = {};

  const language = className?.replace("language-", "");

  const lines = children
    .split("\n")
    .map((line, idx) => {
      if (line.startsWith("[++] ")) {
        highlights[idx + 1] = added;
        return trimStart(line, "[++] ");
      } else if (line.startsWith("[--] ")) {
        highlights[idx + 1] = deleted;
        return trimStart(line, "[--] ");
      } else {
        return line;
      }
    })
    .join("\n");

  return inline ? (
    <Code>{children}</Code>
  ) : (
    <Prism withLineNumbers language={language} highlightLines={highlights}>
      {lines}
    </Prism>
  );
};

const headingProps = elementProps.extend({
  level: z.number({ min: 1, max: 6 }),
});
const _Heading = (props) => {
  const { children, level } = headingProps.parse(props);
  return <Title size={`h${level}`}>{children}</Title>;
};

const imageProps = elementProps.extend({
  src: z.string(),
  alt: z.string(),
});
const _Image = (props) => {
  const { src, alt } = imageProps.parse(props);
  return <Image src={src} alt={alt} />;
};

const NavItem = ({ text, path }) => {
  const navigate = useNavigate();

  return (
    <NavLink
      className={styles.navItem}
      label={
        <Text size={16} onClick={() => navigate(path)}>
          {text}
        </Text>
      }
    />
  );
};

/**
 * Component Overrides
 * @see https://github.com/remarkjs/react-markdown#appendix-b-components
 */
const components = {
  h1: _Heading,
  h2: _Heading,
  h3: _Heading,
  h4: _Heading,
  h5: _Heading,
  h6: _Heading,
  code: _Code,
  img: _Image,
};

export const DocumentationMd = ({ src, docs }) => {
  const { data, error, isLoading } = useSWR(src, fetcher);

  return (
    <Stack className={styles.page}>
      <div className={styles.nav}>
        {docs.map(({ path, label }) => (
          <NavItem key={path} text={label} path={path} />
        ))}
      </div>
      <div className={styles.content}>
        <Stack>
          <LoadingOverlay visible={isLoading} />
          {error && <Alert>{error.toString()}</Alert>}
          {data && (
            <Container w="100%">
              <ReactMarkdown
                components={components}
                children={data}
                remarkPlugins={[remarkGfm]}
              />
            </Container>
          )}
        </Stack>
      </div>
    </Stack>
  );
};
