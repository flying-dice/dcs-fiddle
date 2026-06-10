import { useState } from "react";
import JSZip from "jszip";
import { useDcsLua2Json } from "./useDcsLua2Json";
import { Aigle } from "aigle";
import { keys, set } from "lodash";

export const useMizDiff = () => {
  const [selectedFile, setSelectedFile] = useState("mission");

  const [leftFiles, setLeftFiles] = useState({});
  const [rightFiles, setRightFiles] = useState({});

  const leftJson = useDcsLua2Json(leftFiles[selectedFile]);
  const rightJson = useDcsLua2Json(rightFiles[selectedFile]);

  const update = (side) => async (file) => {
    const zip = new JSZip();
    const z = await zip.loadAsync(file);

    const files = {};

    console.log("Parsing", z.files);

    await Aigle.forEach(z.files, async ({ name, dir }) => {
      if (dir === false) {
        set(files, name, await z.file(name).async("string"));
      }
    });

    if (side === "left") {
      setLeftFiles(files);
    } else {
      setRightFiles(files);
    }
  };

  return {
    updateLeft: update("left"),
    updateRight: update("right"),
    left: leftFiles[selectedFile],
    right: rightFiles[selectedFile],
    leftJson,
    rightJson,
    files: keys(leftFiles),
    selectFile: setSelectedFile,
    selectedFile,
  };
};
