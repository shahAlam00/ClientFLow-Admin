import JoditEditor from 'jodit-react';
import { useRef, useMemo } from 'react';

export const RichTextEditor = ({ content, onChange }) => {
  const editor = useRef(null);

  // useMemo ensures the config object doesn't trigger re-renders
  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Start typing like MS Word...',
    height: 400,
    toolbarButtonSize: 'middle',
    // These buttons allow full control over formatting
    buttons: [
      'source', '|', 'bold', 'italic', 'underline', 'strikethrough', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'align', 'ul', 'ol', '|',
      'image', 'table', 'link', 'minus', '|',
      'undo', 'redo', 'eraser', 'fullsize'
    ],
    // Optional: Add specific plugins if needed
    uploader: { insertImageAsBase64URI: true },
    removeButtons: ['brush'], // Clean up unnecessary tools
  }), []);

  return (
    <div className="border border-border rounded-lg overflow-hidden focus-within:border-gold transition-all">
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        tabIndex={1}
        // onChange fires every time you type, change formatting, 
        // or click a button (Bold/Italic/etc), making it much more reliable.
        onChange={(newContent) => onChange(newContent)}
      />
    </div>
  );
};