import "./App.module.css";
import { Divider, FileInput, NavLink, Stack } from "@mantine/core";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { useMemo, useRef } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import styles from "./App.module.css";
import { Response } from "./components/Response";
import { AppHeader } from "./components/AppHeader";
import { AppNavbar } from "./components/AppNavbar";
import { useDcsCommand } from "./hooks/useDcsCommand";
import { GreetingModal } from "./components/GreetingModal";
import { docs } from "./docs";
import { useGreetingModal } from "./hooks/useGreetingModal";
import { useShareModal } from "./hooks/useShareModal";
import { ShareModal } from "./components/ShareModal";
import { useBoolean, useSearchParam } from "react-use";
import { ExploreModal } from "./components/ExploreModal";
import { useEnvironment } from "./context/environment";
import { useMizDiff } from "./hooks/useMizDiff";
import sortobject from "deep-sort-object";

function App() {
  const env = useSearchParam("env");
  const state = useSearchParam("state");
  const { environments, environment, setEnvironment, status } = useEnvironment(
    env,
    state
  );
  const command = useSearchParam("command");
  const editorRef = useRef(null);
  const diffEditorRef = useRef(null);
  const { responses, submitting, submitCommand } = useDcsCommand();
  const greetingModal = useGreetingModal();
  const shareDialog = useShareModal(() => editorRef.current.getValue());
  const [open, toggleOpen] = useBoolean(false);
  const md = useMizDiff();

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: (
            <>
              <div className={styles.editor}>
                <Editor
                  theme="vs-dark"
                  defaultLanguage="lua"
                  defaultValue={
                    (command && atob(command)) || "return env.mission.theatre"
                  }
                  onMount={handleEditorDidMount}
                  options={{
                    fontFamily: "IBM Plex Mono",
                    fontSize: 14,
                  }}
                />
              </div>
              <div className={styles.terminal}>
                <Stack
                  p={"xs"}
                  spacing={4}
                  style={{
                    display: "flex",
                    flex: "1 1 auto",
                    overflowY: "scroll",
                  }}
                >
                  {responses.map(([date, response]) => (
                    <Response key={date} response={response} date={date} />
                  ))}
                </Stack>
              </div>
            </>
          ),
        },
        {
          path: "/diff",
          element: (
            <>
              <div className={styles.diffEditor}>
                <Stack w={300}>
                  <Stack p="xs">
                    <FileInput
                      label="Left"
                      disabled={status.state !== "up"}
                      placeholder="Left miz file"
                      withAsterisk
                      onChange={md.updateLeft}
                    />
                    <FileInput
                      label="Right"
                      disabled={status.state !== "up" || !md.leftJson}
                      placeholder="Right miz file"
                      withAsterisk
                      onChange={md.updateRight}
                    />
                  </Stack>
                  <Divider />
                  <Stack spacing={0}>
                    {md.files.sort().map((it) => (
                      <NavLink
                        key={it}
                        active={md.selectedFile === it}
                        onClick={() => md.selectFile(it)}
                        label={it}
                      />
                    ))}
                  </Stack>
                </Stack>
                <DiffEditor
                  theme="vs-dark"
                  defaultLanguage="json"
                  original={
                    md.leftJson
                      ? JSON.stringify(sortobject(md.leftJson), undefined, 2)
                      : md.left
                  }
                  modified={
                    md.rightJson
                      ? JSON.stringify(sortobject(md.rightJson), undefined, 2)
                      : md.right
                  }
                  onMount={handleDiffEditorDidMount}
                  options={{
                    fontFamily: "IBM Plex Mono",
                    fontSize: 14,
                  }}
                />
              </div>
            </>
          ),
        },
        ...docs,
      ]),
    [responses, status.state, md.leftJson, md.rightJson]
  );

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function handleDiffEditorDidMount(editor, monaco) {
    diffEditorRef.current = editor;
  }

  return (
    <div className={styles.shell}>
      <GreetingModal greetingModal={greetingModal} />
      <ExploreModal open={open} onClose={toggleOpen} />
      <ShareModal
        link$={shareDialog.link$}
        open={shareDialog.isOpen}
        onClose={shareDialog.close}
      />
      <div className={styles.header}>
        <AppHeader
          envs={environments}
          env={environment}
          status={status}
          onChangeEnv={setEnvironment}
          submitting={submitting}
          onSubmit={() => submitCommand(editorRef.current.getValue())}
          onShowGreetingModal={greetingModal.open}
          onShare={shareDialog.open}
          onExplore={toggleOpen}
        />
      </div>
      <div className={styles.navbar}>
        <AppNavbar router={router} />
      </div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
