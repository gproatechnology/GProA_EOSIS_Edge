#!/usr/bin/env python3
"""
EDGE Document Processor API Testing Suite - Iteration 2
Tests all backend APIs including new EDGE Rules Engine and batch processing
"""

import requests
import sys
import json
import time
from datetime import datetime
from pathlib import Path

class EdgeAPITester:
    def __init__(self, base_url="https://doc-processor-ai-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.project_id = None
        self.file_ids = []
        self.job_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    self.log(f"   Error: {error_data}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_edge_rules_all(self):
        """Test GET /api/edge-rules - get all EDGE WBS rules"""
        success, data = self.run_test("Get All EDGE Rules", "GET", "edge-rules", 200)
        if success:
            # Verify we have the expected measures
            expected_measures = ["EEM22", "EEM09", "WEM01", "WEM02", "EEM16"]
            for measure in expected_measures:
                if measure in data:
                    self.log(f"   ✓ Found measure {measure}")
                else:
                    self.log(f"   ⚠️ Missing measure {measure}")
        return success, data

    def test_edge_rules_specific(self):
        """Test GET /api/edge-rules/EEM22 - get specific rule"""
        success, data = self.run_test("Get EEM22 Rule", "GET", "edge-rules/EEM22", 200)
        if success and "EEM22" in data:
            rule = data["EEM22"]
            if "categoria" in rule and rule["categoria"] == "ENERGY":
                self.log(f"   ✓ EEM22 rule structure valid")
            else:
                self.log(f"   ⚠️ EEM22 rule structure incomplete")
        return success, data

    def test_create_project(self):
        """Test project creation"""
        project_data = {
            "name": f"Test EDGE Project {datetime.now().strftime('%H%M%S')}",
            "typology": "residential"
        }
        success, data = self.run_test("Create Project", "POST", "projects", 200, project_data)
        if success and "id" in data:
            self.project_id = data["id"]
            self.log(f"   ✓ Created project with ID: {self.project_id}")
        return success, data

    def test_list_projects(self):
        """Test project listing"""
        return self.run_test("List Projects", "GET", "projects", 200)

    def test_get_project(self):
        """Test get specific project"""
        if not self.project_id:
            self.log("❌ No project ID available for testing")
            return False, {}
        return self.run_test("Get Project", "GET", f"projects/{self.project_id}", 200)

    def test_upload_led_file(self):
        """Test uploading LED luminaire data file for EEM22 testing"""
        if not self.project_id:
            self.log("❌ No project ID available for file upload")
            return False, {}

        # Create test LED luminaire data
        led_content = """TABLA DE LUMINARIAS LED - PROYECTO RESIDENCIAL

ID    MODELO              CANTIDAD    LUMENS    WATTS    EFICIENCIA
L01   Philips CoreLine    12          3200      28       114.3 lm/W
L02   Osram LED Panel     8           4500      36       125.0 lm/W  
L03   Samsung LED Strip   15          2800      22       127.3 lm/W
L04   LG Downlight        20          2200      18       122.2 lm/W
L05   Cree LED Spot       6           3800      32       118.8 lm/W

NOTAS:
- Todas las luminarias incluyen ballast electronico
- Luminarias L01-L03 son dimerizables
- Eficiencia promedio: 121.5 lm/W
- Total instalado: 61 luminarias
"""

        files = {'file': ('luminarias_led.txt', led_content, 'text/plain')}
        success, data = self.run_test("Upload LED File", "POST", f"projects/{self.project_id}/files", 200, files=files)
        if success and "id" in data:
            self.file_ids.append(data["id"])
            self.log(f"   ✓ Uploaded LED file with ID: {data['id']}")
        return success, data

    def test_upload_water_file(self):
        """Test uploading water fixture data file for WEM01 testing"""
        if not self.project_id:
            self.log("❌ No project ID available for file upload")
            return False, {}

        # Create test water fixture data
        water_content = """ESPECIFICACIONES GRIFERIAS Y APARATOS SANITARIOS

GRIFERIAS DE LAVAMANOS:
- Marca: Hansgrohe EcoSmart
- Modelo: Focus 100
- Flujo: 5.0 lpm
- Cantidad: 8 unidades

DUCHAS:
- Marca: Grohe Euphoria
- Modelo: Cosmopolitan 160
- Flujo: 7.5 lpm  
- Cantidad: 4 unidades

GRIFERIAS DE COCINA:
- Marca: Franke Active Plus
- Modelo: 115.0373.895
- Flujo: 6.0 lpm
- Cantidad: 2 unidades

CERTIFICACIONES:
- WaterSense EPA certified
- Ahorro de agua: 30% vs griferias convencionales
"""

        files = {'file': ('griferias_agua.txt', water_content, 'text/plain')}
        success, data = self.run_test("Upload Water File", "POST", f"projects/{self.project_id}/files", 200, files=files)
        if success and "id" in data:
            self.file_ids.append(data["id"])
            self.log(f"   ✓ Uploaded water file with ID: {data['id']}")
        return success, data

    def test_list_files(self):
        """Test listing project files"""
        if not self.project_id:
            self.log("❌ No project ID available for file listing")
            return False, {}
        return self.run_test("List Files", "GET", f"projects/{self.project_id}/files", 200)

    def test_process_edge_batch(self):
        """Test POST /api/projects/{id}/process-edge - batch processing"""
        if not self.project_id:
            self.log("❌ No project ID available for batch processing")
            return False, {}
        
        success, data = self.run_test("Start EDGE Batch Processing", "POST", f"projects/{self.project_id}/process-edge", 200)
        if success and "job_id" in data:
            self.job_id = data["job_id"]
            self.log(f"   ✓ Started batch job with ID: {self.job_id}")
        return success, data

    def test_process_status_polling(self):
        """Test GET /api/projects/{id}/process-status/{job_id} - polling progress"""
        if not self.project_id or not self.job_id:
            self.log("❌ No project ID or job ID available for status polling")
            return False, {}

        # Poll for up to 60 seconds
        max_polls = 30
        poll_count = 0
        
        while poll_count < max_polls:
            success, data = self.run_test(f"Poll Status ({poll_count+1})", "GET", f"projects/{self.project_id}/process-status/{self.job_id}", 200)
            
            if success:
                status = data.get("status", "unknown")
                percent = data.get("percent", 0)
                current_step = data.get("current_step", "")
                
                self.log(f"   Status: {status} ({percent}%) - {current_step}")
                
                if status == "completed":
                    self.log(f"   ✅ Batch processing completed successfully")
                    return True, data
                elif status == "error":
                    self.log(f"   ❌ Batch processing failed")
                    return False, data
                
            poll_count += 1
            time.sleep(2)  # Poll every 2 seconds as specified
        
        self.log(f"   ⚠️ Polling timeout after {max_polls * 2} seconds")
        return False, {}

    def test_wbs_validation(self):
        """Test GET /api/projects/{id}/wbs-validation - deterministic validation"""
        if not self.project_id:
            self.log("❌ No project ID available for WBS validation")
            return False, {}
        
        success, data = self.run_test("WBS Validation", "GET", f"projects/{self.project_id}/wbs-validation", 200)
        if success:
            measures = data.get("measures", {})
            coverage = data.get("coverage", {})
            self.log(f"   ✓ Found {len(measures)} measures in validation")
            self.log(f"   ✓ Coverage: {coverage.get('coverage_percent', 0)}%")
        return success, data

    def test_kpis(self):
        """Test GET /api/projects/{id}/kpis - calculated KPIs"""
        if not self.project_id:
            self.log("❌ No project ID available for KPIs")
            return False, {}
        
        success, data = self.run_test("Get KPIs", "GET", f"projects/{self.project_id}/kpis", 200)
        if success:
            kpi_count = len(data)
            self.log(f"   ✓ Found {kpi_count} KPIs")
            for measure, kpi in data.items():
                valor = kpi.get("valor", 0)
                unidad = kpi.get("unidad", "")
                cumple = kpi.get("cumple", None)
                self.log(f"   - {measure}: {valor} {unidad} {'✓' if cumple else '⚠️' if cumple is False else ''}")
        return success, data

    def test_extracted_data(self):
        """Test GET /api/projects/{id}/extracted-data"""
        if not self.project_id:
            self.log("❌ No project ID available for extracted data")
            return False, {}
        return self.run_test("Get Extracted Data", "GET", f"projects/{self.project_id}/extracted-data", 200)

    def test_edge_status(self):
        """Test GET /api/projects/{id}/edge-status"""
        if not self.project_id:
            self.log("❌ No project ID available for EDGE status")
            return False, {}
        return self.run_test("Get EDGE Status", "GET", f"projects/{self.project_id}/edge-status", 200)

    def test_export_excel(self):
        """Test GET /api/projects/{id}/export-excel"""
        if not self.project_id:
            self.log("❌ No project ID available for Excel export")
            return False, {}
        
        url = f"{self.api_url}/projects/{self.project_id}/export-excel"
        self.tests_run += 1
        self.log(f"🔍 Testing Excel Export...")
        
        try:
            response = requests.get(url)
            if response.status_code == 200 and response.headers.get('content-type', '').startswith('application/vnd.openxmlformats'):
                self.tests_passed += 1
                self.log(f"✅ Excel Export - Status: {response.status_code}, Size: {len(response.content)} bytes")
                return True, {"size": len(response.content)}
            else:
                self.log(f"❌ Excel Export - Status: {response.status_code}")
                return False, {}
        except Exception as e:
            self.log(f"❌ Excel Export - Error: {str(e)}")
            return False, {}

    def test_delete_project(self):
        """Test project deletion"""
        if not self.project_id:
            self.log("❌ No project ID available for deletion")
            return False, {}
        
        success, data = self.run_test("Delete Project", "DELETE", f"projects/{self.project_id}", 200)
        if success:
            self.log(f"   ✓ Project {self.project_id} deleted successfully")
        return success, data

    def run_all_tests(self):
        """Run complete test suite"""
        self.log("🚀 Starting EDGE Document Processor API Tests - Iteration 2")
        self.log(f"   Backend URL: {self.base_url}")
        
        # Basic API tests
        self.test_root_endpoint()
        
        # EDGE Rules Engine tests
        self.test_edge_rules_all()
        self.test_edge_rules_specific()
        
        # Project lifecycle tests
        self.test_create_project()
        self.test_list_projects()
        self.test_get_project()
        
        # File upload tests
        self.test_upload_led_file()
        self.test_upload_water_file()
        self.test_list_files()
        
        # EDGE batch processing tests
        self.test_process_edge_batch()
        self.test_process_status_polling()
        
        # Analysis and validation tests
        self.test_wbs_validation()
        self.test_kpis()
        self.test_extracted_data()
        self.test_edge_status()
        
        # Export test
        self.test_export_excel()
        
        # Cleanup
        self.test_delete_project()
        
        # Results
        self.log(f"\n📊 Test Results:")
        self.log(f"   Tests run: {self.tests_run}")
        self.log(f"   Tests passed: {self.tests_passed}")
        self.log(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = EdgeAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())