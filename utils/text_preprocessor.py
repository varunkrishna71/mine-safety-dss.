import io
import re
import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_pdf(file):
    """
    Extracts text from PDF documents across all pages.
    Preserves paragraph separation with double newlines.
    """
    try:
        import PyPDF2
        # Handle file-like objects or byte streams
        reader = PyPDF2.PdfReader(file)
        if getattr(reader, "is_encrypted", False):
            reader.decrypt("")

        pages_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t and t.strip():
                pages_text.append(t.strip())
        return "\n\n".join(pages_text)
    except Exception:
        return ""

def extract_text_from_docx(file):
    """
    Extracts text from DOCX documents, including paragraphs and tables.
    """
    paragraphs_text = []
    try:
        import docx
        doc = docx.Document(file)
        for para in doc.paragraphs:
            if para.text and para.text.strip():
                paragraphs_text.append(para.text.strip())

        # Extract table data (important for statutory shift log tables)
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text and cell.text.strip()]
                if row_cells:
                    paragraphs_text.append(" | ".join(row_cells))

        return "\n\n".join(paragraphs_text)
    except ImportError:
        # Fallback to direct XML extraction if python-docx package is not present
        try:
            if isinstance(file, (bytes, bytearray)):
                stream = io.BytesIO(file)
            else:
                stream = file
            with zipfile.ZipFile(stream) as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                texts = [elem.text for elem in tree.iter() if elem.tag.endswith("}t") and elem.text]
                return " ".join(texts)
        except Exception:
            return ""
    except Exception:
        return ""

def clean_text(text):
    """
    Cleans and normalizes text for NLP processing.
    Converts to lowercase and preserves alphanumeric characters,
    percentages, and decimals required for CMR 2017 threshold evaluations.
    """
    if not text:
        return ""
    text_lower = text.lower()
    text_cleaned = re.sub(r'[^a-z0-9.% ]', ' ', text_lower)
    return " ".join(text_cleaned.split())
