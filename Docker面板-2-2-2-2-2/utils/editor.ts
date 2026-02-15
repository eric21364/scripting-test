export async function editorView(content: string) {
    const editor = new EditorController({
        ext: "txt",
        content: content,
    });
    await editor.present({
      navigationTitle: "Docker Compose"
    });
    const newContent = editor.content;
    editor.dispose();
    return newContent;
}
