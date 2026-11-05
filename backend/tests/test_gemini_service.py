import unittest
import json
from backend.services.gemini_service import GeminiService, get_gemini_service

class TestGeminiService(unittest.TestCase):
    def setUp(self):
        self.service = GeminiService()

    def test_singleton_instance(self):
        s1 = get_gemini_service()
        s2 = get_gemini_service()
        self.assertIs(s1, s2)

    def test_conversational_chat_basic(self):
        res = self.service.chat("What are the statutory methane thresholds under CMR 2017?")
        self.assertEqual(res["status"], "success")
        self.assertIn("reply", res)
        self.assertIn("disclaimer", res)
        self.assertIn("0.5", res["reply"])
        self.assertIn("1.25", res["reply"])

    def test_conversational_chat_with_context_report(self):
        context = {
            "title": "Shift B Face Inspection",
            "mineLocation": "Seam 3 District North",
            "riskScore": 72,
            "safetyStatus": "HIGH",
            "statutoryForm": "Form IV-A",
            "hazards": [{"name": "Methane Accumulation"}, {"name": "Ventilation Failure"}],
            "alerts": ["Methane 1.45% in general body of air"]
        }
        res = self.service.chat("Explain why this report is flagged HIGH risk", context_report=context)
        self.assertEqual(res["status"], "success")
        self.assertTrue(len(res["reply"]) > 50)

    def test_explain_report_structure(self):
        sample_report = {
            "title": "Underground Return Airway Audit",
            "location": "Shaft 2 Return",
            "riskScore": 65,
            "safetyStatus": "HIGH",
            "statutoryForm": "Form IV-A",
            "hazardCount": 2,
            "hazards": ["Roof/Strata Instability", "Respirable Dust"],
            "alerts": ["Roof spalling detected near junction"],
            "recommendations": ["Erect additional props as per SSR"],
            "reportText": "During shift inspection, heavy strata pressure and spalling along pillar corners was noted."
        }
        res = self.service.explain_report(sample_report)
        self.assertEqual(res["status"], "success")
        self.assertIn("explanation", res)
        expl = res["explanation"]
        self.assertIn("incident_summary", expl)
        self.assertIn("hazard_explanations", expl)
        self.assertIn("safety_notice", expl)

    def test_summarize_report(self):
        sample_report = {
            "title": "Weekly Safety Audit",
            "riskScore": 45,
            "safetyStatus": "MEDIUM",
            "statutoryForm": "Form K",
            "hazards": ["Machinery Accident"],
            "alerts": [],
            "recommendations": ["Inspect conveyor pull-cord switches"],
            "reportText": "Conveyor belt trip switch inspection completed."
        }
        res = self.service.summarize_report(sample_report)
        self.assertEqual(res["status"], "success")
        self.assertIn("summary", res)
        self.assertIn("disclaimer", res)

    def test_explain_all_six_statutory_hazards(self):
        hazards = [
            "Methane Accumulation",
            "Roof/Strata Instability",
            "Ventilation Failure",
            "Respirable Dust",
            "Water Inrush",
            "Machinery Accident"
        ]
        for h in hazards:
            res = self.service.explain_hazard(h)
            self.assertEqual(res["status"], "success")
            self.assertEqual(res["hazard_name"], h)
            self.assertTrue(len(res["explanation"]) > 30)

if __name__ == "__main__":
    unittest.main()
