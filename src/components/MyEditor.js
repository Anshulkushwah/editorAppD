import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./MyEditor.css";

const MyEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    const savedContent = window.localStorage.getItem("content");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleBeforeInput = (chars, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);
    const text = block.getText();

    if (chars === " " && text === "#") {
      setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
      return "handled";
    }
    if (chars === " " && text === "*") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
      return "handled";
    }
    if (chars === " " && text === "**") {
      const newContentState = Modifier.setBlockType(
        currentContent,
        selection,
        "red-line"
      );
      setEditorState(
        EditorState.push(editorState, newContentState, "change-block-type")
      );
      return "handled";
    }
    if (chars === " " && text === "***") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
      return "handled";
    }
    return "not-handled";
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    window.localStorage.setItem(
      "content",
      JSON.stringify(convertToRaw(contentState))
    );
  };

  const myBlockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === "red-line") {
      return "red-line";
    }
  };

  return (
    <div>
      <h1>My Draft.js Editor</h1>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          placeholder="Start typing..."
          blockStyleFn={myBlockStyleFn}
        />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default MyEditor;
