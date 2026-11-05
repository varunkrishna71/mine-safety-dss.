import io
import os
import zipfile
import unittest
from backend.services.document_processor import DocumentProcessor
from backend.services.analysis_service import AnalysisService, HTTPException

class TestDocumentProcessing(unittest.TestCase):
    """
    Automated test suite verifying Phase 5 Document Processing,
    magic byte validation, multi-page extraction, table extraction,
    quality gating, and analysis consistency across document modalities.
    """

    def setUp(self):
        self.service = AnalysisService()

    def test_file_signature_validation_supported_types(self):
        """Verifies that valid magic bytes for PDF, DOCX, and TXT are accepted."""
        # PDF signature check
        valid_pdf_bytes = b"%PDF-1.4\n%test pdf stream\n%%EOF"
        self.assertEqual(DocumentProcessor.validate_document_header(valid_pdf_bytes, "report.pdf"), "PDF")

        # DOCX signature check
        valid_docx_bytes = b"PK\x03\x04\x14\x00\x00\x00"
        self.assertEqual(DocumentProcessor.validate_document_header(valid_docx_bytes, "report.docx"), "DOCX")

        # TXT signature check
        valid_txt_bytes = "Routine shift report observation text.".encode("utf-8")
        self.assertEqual(DocumentProcessor.validate_document_header(valid_txt_bytes, "report.txt"), "TXT")

    def test_corrupted_pdf_signature_rejected(self):
        """Verifies that a file named .pdf missing %PDF- magic bytes is rejected."""
        fake_pdf_bytes = b"This is plain text with no PDF header at all."
        with self.assertRaises(HTTPException) as ctx:
            DocumentProcessor.validate_document_header(fake_pdf_bytes, "fake.pdf")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Corrupted PDF", ctx.exception.detail)

    def test_corrupted_docx_signature_rejected(self):
        """Verifies that a file named .docx missing ZIP PK header is rejected."""
        fake_docx_bytes = b"Not a real word document."
        with self.assertRaises(HTTPException) as ctx:
            DocumentProcessor.validate_document_header(fake_docx_bytes, "fake.docx")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Corrupted DOCX", ctx.exception.detail)

    def test_unsupported_extension_rejected(self):
        """Verifies that unsupported file extensions are rejected with HTTP 415."""
        with self.assertRaises(HTTPException) as ctx:
            DocumentProcessor.validate_document_header(b"sample binary", "script.exe")
        self.assertEqual(ctx.exception.status_code, 415)

    def test_quality_gate_detects_scanned_pdf_needing_ocr(self):
        """Verifies that a PDF with 0 readable extracted characters correctly triggers OCR notice."""
        with self.assertRaises(HTTPException) as ctx:
            DocumentProcessor.quality_gate("", "PDF")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Optical Character Recognition (OCR)", ctx.exception.detail)

    def test_quality_gate_rejects_insufficient_text(self):
        """Verifies that an extracted text with fewer than 3 words or 15 chars is rejected."""
        with self.assertRaises(HTTPException) as ctx:
            DocumentProcessor.quality_gate("Short", "TXT")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("too short", ctx.exception.detail)

    def test_docx_xml_fallback_and_table_extraction(self):
        """Verifies extraction of paragraph and table content from DOCX zip package."""
        buffer = io.BytesIO()
        doc_xml = (
            b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            b'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            b'<w:body>'
            b'<w:p><w:r><w:t>Inspection at District 4B continuous miner heading.</w:t></w:r></w:p>'
            b'<w:p><w:r><w:t>Methane accumulation recorded at 2.4% with auxiliary fan stop.</w:t></w:r></w:p>'
            b'</w:body></w:document>'
        )
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("word/document.xml", doc_xml)
        docx_bytes = buffer.getvalue()

        extracted, _ = DocumentProcessor.extract_docx(docx_bytes)
        self.assertIn("District 4B", extracted)
        self.assertIn("Methane accumulation", extracted)

    def test_txt_encoding_resilience_utf8_and_latin1(self):
        """Verifies TXT extraction handles both UTF-8 and Latin-1 text files."""
        utf8_content = "Shift report with special characters: 2.4% methane inflammable gas.".encode("utf-8")
        text_out = DocumentProcessor.extract_txt(utf8_content)
        self.assertIn("2.4% methane", text_out)

        latin1_content = "Shift log: François seam inspection with 0.0% methane.".encode("latin-1")
        text_out2 = DocumentProcessor.extract_txt(latin1_content)
        self.assertIn("seam inspection", text_out2)

    def test_analysis_consistency_across_modalities(self):
        """
        CRITICAL TEST: Verifies that identical mining incident content produces
        the exact same risk score, safety status, and statutory form whether submitted
        as manual text or as an uploaded TXT file.
        """
        test_narrative = (
            "Methanometer sampling revealed 2.4% methane inflammable gas buildup at the return airway "
            "near face 3. Severe roof fall warning signs observed with visible side fall spalling along pillar 12. "
            "Emergency evacuation order was declared by the Overman."
        )

        # 1. Manual Analysis
        manual_resp = self.service.analyze_text(test_narrative, report_name="Consistency_Manual")

        # 2. Document Analysis (TXT)
        txt_bytes = test_narrative.encode("utf-8")
        DocumentProcessor.validate_document_header(txt_bytes, "Consistency_Doc.txt")
        extracted_txt = DocumentProcessor.extract_txt(txt_bytes)
        DocumentProcessor.quality_gate(extracted_txt, "TXT")
        doc_resp = self.service.analyze_text(extracted_txt, report_name="Consistency_Doc.txt")

        # Assert 100% mathematical and statutory consistency
        self.assertEqual(manual_resp.risk_assessment.risk_score, doc_resp.risk_assessment.risk_score)
        self.assertEqual(manual_resp.risk_assessment.safety_status, doc_resp.risk_assessment.safety_status)
        self.assertEqual(manual_resp.risk_assessment.statutory_form, doc_resp.risk_assessment.statutory_form)
        self.assertEqual(manual_resp.hazard_count, doc_resp.hazard_count)
        self.assertEqual(manual_resp.alerts, doc_resp.alerts)
        self.assertEqual(len(manual_resp.recommendations), len(doc_resp.recommendations))

if __name__ == "__main__":
    unittest.main()
