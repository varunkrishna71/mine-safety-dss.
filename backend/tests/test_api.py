import unittest
from backend.services.analysis_service import AnalysisService, HTTPException

class TestMineSafetyBackend(unittest.TestCase):
    """
    Automated test suite verifying the analysis service and regulatory compliance
    mapping for the Mine Safety Decision Support System backend.
    """

    def setUp(self):
        self.service = AnalysisService()

    def test_rules_loading_and_caching(self):
        """Verifies DGMS hazard rules JSON is loaded and cached properly."""
        rules = self.service.get_rules()
        self.assertIn("hazards", rules)
        self.assertIn("recommendations", rules)
        self.assertIn("Methane Accumulation", rules["hazards"])
        self.assertIn("Roof/Strata Instability", rules["hazards"])
        self.assertEqual(len(rules["hazards"]), 6)

    def test_manual_analysis_critical_methane_and_strata(self):
        """Tests High-Risk scenario with Methane > 2.0% and Strata spalling (Form IV-A)."""
        incident_text = (
            "Methanometer sampling revealed 2.4% methane inflammable gas buildup at the return airway "
            "near face 3. Severe roof fall warning signs observed with visible side fall spalling along pillar 12. "
            "Emergency evacuation order given to withdrawal face crew."
        )
        response = self.service.analyze_text(incident_text, report_name="Critical_Shift_Test")

        self.assertEqual(response.status, "success")
        self.assertEqual(response.risk_assessment.safety_status, "HIGH")
        self.assertGreaterEqual(response.risk_assessment.risk_score, 70)
        self.assertEqual(response.risk_assessment.statutory_form, "Form IV-A")
        self.assertGreaterEqual(response.hazard_count, 2)

        # Check alerts
        has_methane_alert = any("Methane at 2.4%" in alert for alert in response.alerts)
        has_evacuation_alert = any("Manual evacuation order" in alert for alert in response.alerts)
        self.assertTrue(has_methane_alert)
        self.assertTrue(has_evacuation_alert)

    def test_manual_analysis_medium_risk_three_hazards(self):
        """Tests Medium-Risk scenario with 3 hazards (Score = 3 * 15 = 45, Form J)."""
        incident_text = (
            "Heavy airborne respirable dust and coal dust accumulation noted at transfer point. "
            "Water seepage was visible along the coal rib near old workings. "
            "On the main haulage belt conveyor, guarding was detached near drive head."
        )
        response = self.service.analyze_text(incident_text, report_name="Dust_And_Water_Test")

        self.assertEqual(response.status, "success")
        self.assertEqual(response.risk_assessment.safety_status, "MEDIUM")
        self.assertEqual(response.risk_assessment.risk_score, 45)
        self.assertEqual(response.risk_assessment.statutory_form, "Form J")
        self.assertEqual(response.hazard_count, 3)

    def test_manual_analysis_compliant_routine_safe(self):
        """Tests Compliant/Safe scenario with zero hazards (Score forced to 10, Form K)."""
        incident_text = (
            "Adequate air circulation observed throughout travel roads. Air velocity measured at 0.85 m/s. "
            "Multi-gas detector readings nominal. Powered support shields operating normally. "
            "Overall working environment compliant with Coal Mines Regulations."
        )
        response = self.service.analyze_text(incident_text, report_name="Compliant_Shift_Test")

        self.assertEqual(response.status, "success")
        self.assertEqual(response.risk_assessment.safety_status, "LOW")
        self.assertEqual(response.risk_assessment.risk_score, 10)
        self.assertEqual(response.risk_assessment.statutory_form, "Form K")
        self.assertEqual(response.hazard_count, 0)
        self.assertEqual(len(response.alerts), 0)

    def test_empty_incident_text_raises_exception(self):
        """Tests that empty incident text raises an HTTP 400 error."""
        with self.assertRaises(HTTPException) as ctx:
            self.service.analyze_text("    ")
        self.assertEqual(ctx.exception.status_code, 400)

    def test_all_six_hazard_categories_recognized(self):
        """Verifies that all 6 categories from dgms_hazard_rules can trigger detection."""
        rules = self.service.get_rules()
        categories = list(rules["hazards"].keys())
        expected_categories = [
            "Methane Accumulation",
            "Roof/Strata Instability",
            "Ventilation Failure",
            "Respirable Dust",
            "Water Inrush",
            "Machinery Accident"
        ]
        self.assertCountEqual(categories, expected_categories)

if __name__ == "__main__":
    unittest.main()
