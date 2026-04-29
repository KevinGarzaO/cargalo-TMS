import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            
            text_elements = tree.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
            full_text = " ".join([el.text for el in text_elements if el.text])
            return full_text[:1000]
    except Exception as e:
        return f"Error reading {docx_path}: {e}"

if __name__ == "__main__":
    path = sys.argv[1]
    if os.path.exists(path):
        text = extract_text(path)
        sys.stdout.buffer.write(text.encode('utf-8'))
    else:
        print(f"File not found: {path}")
