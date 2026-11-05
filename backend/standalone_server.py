import os
import sys
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.analysis_service import AnalysisService, HTTPException
from backend.services.auth_service import verify_firebase_id_token, AuthenticatedUser
from backend.services.gemini_service import get_gemini_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("mine_safety_dss.server")

service = AnalysisService()
gemini_service = get_gemini_service()

class MineSafetyApiHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            resp = {
                "status": "healthy",
                "application": "Mine Safety DSS",
                "version": "1.0.0",
                "message": "Backend is running successfully"
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not Found"}).encode("utf-8"))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))

        # Enforce Firebase Authentication for protected analysis endpoints
        auth_header = self.headers.get("Authorization")
        auth_user = None

        if parsed.path in ["/api/v1/analyze", "/api/v1/analyze-file"]:
            try:
                auth_user = verify_firebase_id_token(auth_header)
            except HTTPException as he:
                self._send_error(he.status_code, he.detail)
                return
            except Exception as auth_err:
                self._send_error(401, f"Authentication failed: {str(auth_err)}")
                return

        if parsed.path == "/api/v1/analyze":
            try:
                body = self.rfile.read(content_length)
                data = json.loads(body.decode("utf-8"))
                text = data.get("incident_text", "").strip()
                report_name = data.get("report_name", "Manual_Report")

                if not text:
                    self._send_error(400, "Incident description text is empty.")
                    return

                analysis = service.analyze_text(
                    text,
                    report_name,
                    source_type="manual_text",
                    user_id=auth_user.uid if auth_user else None
                )
                self._send_json(200, analysis.model_dump() if hasattr(analysis, "model_dump") else analysis.__dict__)
            except HTTPException as he:
                self._send_error(he.status_code, he.detail)
            except Exception as e:
                logger.error(f"Error analyzing text: {e}", exc_info=True)
                self._send_error(500, "Internal server error occurred.")

        elif parsed.path == "/api/v1/analyze-file":
            try:
                content_type = self.headers.get("Content-Type", "")
                body = self.rfile.read(content_length)

                filename = "Uploaded_Report.txt"
                extracted_text = ""

                if "multipart/form-data" in content_type:
                    # Parse multipart body
                    boundary = content_type.split("boundary=")[1].strip()
                    if boundary.startswith('"') and boundary.endswith('"'):
                        boundary = boundary[1:-1]
                    parts = body.split(("--" + boundary).encode())

                    for part in parts:
                        if b'name="file"' in part:
                            header_end = part.find(b"\r\n\r\n")
                            if header_end != -1:
                                headers_part = part[:header_end].decode("latin-1", errors="ignore")
                                if 'filename="' in headers_part:
                                    fname_start = headers_part.find('filename="') + 10
                                    fname_end = headers_part.find('"', fname_start)
                                    if fname_end != -1:
                                        filename = headers_part[fname_start:fname_end]
                                file_content = part[header_end + 4:]
                                file_bytes = file_content
                                break
                else:
                    file_bytes = body

                from backend.services.document_processor import DocumentProcessor, format_file_size
                from backend.schemas.analysis import DocumentMetadata

                # 1. Header and signature validation
                doc_format = DocumentProcessor.validate_document_header(file_bytes, filename)

                # 2. Format extraction
                total_pages = None
                tables_extracted = None

                if doc_format == "PDF":
                    extracted_text, total_pages = DocumentProcessor.extract_pdf(file_bytes)
                elif doc_format == "DOCX":
                    extracted_text, tables_extracted = DocumentProcessor.extract_docx(file_bytes)
                else:
                    extracted_text = DocumentProcessor.extract_txt(file_bytes)

                # 3. Quality gate
                DocumentProcessor.quality_gate(extracted_text, doc_format)

                # 4. Metadata
                doc_meta = DocumentMetadata(
                    filename=filename,
                    file_format=doc_format,
                    file_size_bytes=len(file_bytes),
                    file_size_formatted=format_file_size(len(file_bytes)),
                    total_pages=total_pages,
                    extracted_character_count=len(extracted_text),
                    extracted_word_count=len(extracted_text.split()),
                    quality_status="VERIFIED",
                    tables_extracted=tables_extracted
                )

                analysis = service.analyze_text(
                    extracted_text,
                    filename,
                    source_type="uploaded_file",
                    document_metadata=doc_meta,
                    user_id=auth_user.uid if auth_user else None
                )
                self._send_json(200, analysis.model_dump() if hasattr(analysis, "model_dump") else analysis.__dict__)

            except HTTPException as he:
                self._send_error(he.status_code, he.detail)
            except Exception as e:
                logger.error(f"Error analyzing file: {e}", exc_info=True)
                self._send_error(500, f"Document processing error: {str(e)}")

        elif parsed.path == "/api/v1/ai/chat":
            try:
                body = self.rfile.read(content_length)
                data = json.loads(body.decode("utf-8")) if body else {}
                message = data.get("message", "").strip()
                if not message:
                    self._send_error(400, "Message cannot be empty.")
                    return
                context_report = data.get("context_report")
                conversation_history = data.get("conversation_history", [])

                res = gemini_service.chat(message, context_report=context_report, conversation_history=conversation_history)
                self._send_json(200, res)
            except Exception as e:
                logger.error(f"Error in AI chat: {e}", exc_info=True)
                self._send_error(500, f"AI Assistant service error: {str(e)}")

        elif parsed.path == "/api/v1/ai/explain-report":
            try:
                body = self.rfile.read(content_length)
                data = json.loads(body.decode("utf-8")) if body else {}
                report_data = data.get("report_data", data)
                res = gemini_service.explain_report(report_data)
                self._send_json(200, res)
            except Exception as e:
                logger.error(f"Error in explain report: {e}", exc_info=True)
                self._send_error(500, f"AI report explanation error: {str(e)}")

        elif parsed.path == "/api/v1/ai/summarize-report":
            try:
                body = self.rfile.read(content_length)
                data = json.loads(body.decode("utf-8")) if body else {}
                report_data = data.get("report_data", data)
                res = gemini_service.summarize_report(report_data)
                self._send_json(200, res)
            except Exception as e:
                logger.error(f"Error in summarize report: {e}", exc_info=True)
                self._send_error(500, f"AI report summarization error: {str(e)}")

        elif parsed.path == "/api/v1/ai/explain-hazard":
            try:
                body = self.rfile.read(content_length)
                data = json.loads(body.decode("utf-8")) if body else {}
                hazard_name = data.get("hazard_name", "Methane Accumulation")
                context_details = data.get("context_details")
                res = gemini_service.explain_hazard(hazard_name, context_details)
                self._send_json(200, res)
            except Exception as e:
                logger.error(f"Error in explain hazard: {e}", exc_info=True)
                self._send_error(500, f"AI hazard explanation error: {str(e)}")

        else:
            self._send_error(404, "Endpoint not found.")

    def _send_json(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        
        # Helper to convert nested model objects to dicts
        def default_serializer(o):
            if hasattr(o, "__dict__"):
                return o.__dict__
            return str(o)
            
        payload = json.dumps(data, default=default_serializer).encode("utf-8")
        self.wfile.write(payload)

    def _send_error(self, code, message):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        err = {"status": "error", "error_code": f"HTTP_{code}", "message": message}
        self.wfile.write(json.dumps(err).encode("utf-8"))

class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

def run_server(port=8000):
    import time
    server_address = ("0.0.0.0", port)
    httpd = ReusableHTTPServer(server_address, MineSafetyApiHandler)
    logger.info(f"Mine Safety DSS Python backend running on http://0.0.0.0:{port}")
    while True:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            break
        except Exception as e:
            logger.error(f"Server loop caught exception: {e}")
            time.sleep(0.5)
    try:
        httpd.server_close()
    except Exception:
        pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port)
