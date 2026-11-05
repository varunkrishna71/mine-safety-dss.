import io
import os
import re
import zipfile
import logging
import xml.etree.ElementTree as ET
from typing import Tuple, Optional, Dict, Any
from backend.services.analysis_service import HTTPException, status

logger = logging.getLogger("mine_safety_dss.document_processor")

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB ceiling
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

def format_file_size(size_bytes: int) -> str:
    """Formats raw bytes into human-readable representation."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"

class DocumentProcessor:
    """
    Robust document processing pipeline for PDF, DOCX, and TXT mining inspection reports.
    Provides signature validation, multi-page extraction, table parsing, and quality gating.
    """

    @staticmethod
    def validate_document_header(file_bytes: bytes, filename: str) -> str:
        """
        Validates file extension, length, and magic bytes / signatures.
        Returns the normalized uppercase format name ("PDF", "DOCX", "TXT").
        """
        if not filename or not filename.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename is missing or empty."
            )

        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file format '{ext}'. Supported formats: .pdf, .docx, .txt"
            )

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty (0 bytes)."
            )

        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum upload ceiling of {format_file_size(MAX_FILE_SIZE_BYTES)}."
            )

        # Signature / Magic bytes verification
        if ext == ".pdf":
            # PDF must start with %PDF- within the first 1024 bytes
            if b"%PDF-" not in file_bytes[:1024]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Corrupted PDF file: Missing standard %PDF- header magic signature."
                )
            return "PDF"

        elif ext == ".docx":
            # DOCX is a zip archive starting with PK\x03\x04
            if not file_bytes.startswith(b"PK\x03\x04") and not file_bytes.startswith(b"PK\x05\x06"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Corrupted DOCX file: Invalid ZIP archive header structure."
                )
            return "DOCX"

        elif ext == ".txt":
            # Prevent binary executables renamed to .txt
            if b"\x00" in file_bytes[:1024]:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="Binary file detected: Text files cannot contain null byte characters."
                )
            return "TXT"

        return ext[1:].upper()

    @staticmethod
    def extract_pdf(file_bytes: bytes) -> Tuple[str, int]:
        """
        Extracts textual content from all pages of a PDF document using PyPDF2.
        Preserves paragraph separation and checks for password protection.
        """
        try:
            import PyPDF2
            stream = io.BytesIO(file_bytes)
            reader = PyPDF2.PdfReader(stream)

            # Encryption check
            if getattr(reader, "is_encrypted", False):
                try:
                    # Attempt decrypt with empty password
                    decrypted = reader.decrypt("")
                    if not decrypted:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="PDF is password-protected and cannot be read without credentials."
                        )
                except Exception:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="PDF is password-protected and cannot be read without credentials."
                    )

            total_pages = len(reader.pages)
            pages_text = []

            for idx, page in enumerate(reader.pages):
                try:
                    page_content = page.extract_text()
                    if page_content and page_content.strip():
                        pages_text.append(page_content.strip())
                except Exception as page_err:
                    logger.warning(f"Error extracting PDF page {idx + 1}: {page_err}")

            full_text = "\n\n".join(pages_text)
            return full_text, total_pages

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"PyPDF2 error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse PDF document: {str(e)}"
            )

    @staticmethod
    def extract_docx(file_bytes: bytes) -> Tuple[str, int]:
        """
        Extracts paragraphs and table cell contents from DOCX files.
        Falls back to XML zip extraction if python-docx package is not present.
        """
        stream = io.BytesIO(file_bytes)
        paragraphs_text = []
        tables_count = 0

        try:
            import docx
            doc = docx.Document(stream)

            # 1. Paragraphs
            for para in doc.paragraphs:
                if para.text and para.text.strip():
                    paragraphs_text.append(para.text.strip())

            # 2. Tables (crucial for mining shift logs & gas measurement charts)
            for table in doc.tables:
                tables_count += 1
                for row in table.rows:
                    cells = [c.text.strip() for c in row.cells if c.text and c.text.strip()]
                    if cells:
                        paragraphs_text.append(" | ".join(cells))

            full_text = "\n\n".join(paragraphs_text)
            return full_text, tables_count

        except ImportError:
            # Safe XML fallback parser using built-in zipfile & xml.etree
            try:
                with zipfile.ZipFile(stream) as z:
                    if "word/document.xml" not in z.namelist():
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid DOCX package: Missing word/document.xml."
                        )
                    xml_content = z.read("word/document.xml")
                    tree = ET.fromstring(xml_content)
                    
                    # Extract text elements in WordprocessingML namespace
                    texts = [elem.text for elem in tree.iter() if elem.tag.endswith("}t") and elem.text]
                    full_text = " ".join(texts)
                    return full_text, 0
            except Exception as xml_err:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Corrupted DOCX structure: {str(xml_err)}"
                )
        except Exception as e:
            logger.error(f"DOCX extraction error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to parse DOCX file. File may be corrupted or invalid."
            )

    @staticmethod
    def extract_txt(file_bytes: bytes) -> str:
        """
        Reads plain-text documents with encoding fallbacks (UTF-8, Latin-1, CP1252).
        """
        encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
        for enc in encodings:
            try:
                decoded = file_bytes.decode(enc)
                # Normalize line endings
                return decoded.replace("\r\n", "\n").replace("\r", "\n")
            except (UnicodeDecodeError, LookupError):
                continue

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to decode text document. Please verify UTF-8 or standard ASCII encoding."
        )

    @staticmethod
    def quality_gate(text: str, doc_format: str) -> Tuple[bool, str]:
        """
        Evaluates extracted text quality:
        - Detects empty or whitespace-only extractions.
        - Detects scanned image-only PDFs requiring OCR.
        - Calculates printable character ratio.
        """
        stripped = text.strip()

        if len(stripped) == 0:
            if doc_format == "PDF":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No readable text extracted. Document appears to be a scanned image and requires Optical Character Recognition (OCR)."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The uploaded document contains no readable text."
                )

        # Minimum content check
        words = stripped.split()
        if len(words) < 3 or len(stripped) < 15:
            if doc_format == "PDF":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient text extracted from PDF. If this is a scanned inspection report, OCR is required."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The extracted content is too short for meaningful mining safety evaluation (minimum 15 characters required)."
                )

        # Printable character ratio check (prevents corrupted font / binary garbage)
        printable_count = sum(1 for c in stripped if c.isprintable() or c in "\n\t ")
        printable_ratio = printable_count / len(stripped)
        if printable_ratio < 0.75:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Extracted document text contains excessive unreadable or corrupted characters."
            )

        return True, "VERIFIED"
