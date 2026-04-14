import requests
import sys
import json
import io
from datetime import datetime

class EdgeAPITester:
    def __init__(self, base_url="https://doc-processor-ai-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.project_id = None
        self.file_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text[:200]}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_project(self):
        """Test project creation"""
        test_data = {
            "name": f"Test Project {datetime.now().strftime('%H%M%S')}",
            "typology": "residencial"
        }
        
        success, response = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            data=test_data
        )
        
        if success and 'id' in response:
            self.project_id = response['id']
            print(f"   Created project ID: {self.project_id}")
            return True
        return False

    def test_list_projects(self):
        """Test listing projects"""
        success, response = self.run_test(
            "List Projects",
            "GET",
            "projects",
            200
        )
        
        if success:
            print(f"   Found {len(response)} projects")
            return True
        return False

    def test_get_project(self):
        """Test getting specific project"""
        if not self.project_id:
            print("❌ No project ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Project",
            "GET",
            f"projects/{self.project_id}",
            200
        )
        return success

    def test_upload_file(self):
        """Test file upload"""
        if not self.project_id:
            print("❌ No project ID available for file upload")
            return False
            
        # Create a test file content
        test_content = """
        LED Luminaire Technical Specification
        Model: LED-PRO-2024
        Brand: TechLighting
        Power: 45 watts
        Luminous flux: 4500 lumens
        Color temperature: 4000K
        Efficiency: 100 lm/W
        Application: Office lighting
        """
        
        files = {
            'file': ('test_led_spec.txt', io.StringIO(test_content), 'text/plain')
        }
        
        success, response = self.run_test(
            "Upload File",
            "POST",
            f"projects/{self.project_id}/files",
            200,
            files=files
        )
        
        if success and 'id' in response:
            self.file_id = response['id']
            print(f"   Uploaded file ID: {self.file_id}")
            return True
        return False

    def test_list_files(self):
        """Test listing project files"""
        if not self.project_id:
            print("❌ No project ID available for listing files")
            return False
            
        success, response = self.run_test(
            "List Project Files",
            "GET",
            f"projects/{self.project_id}/files",
            200
        )
        
        if success:
            print(f"   Found {len(response)} files")
            return True
        return False

    def test_process_files(self):
        """Test AI processing of files"""
        if not self.project_id:
            print("❌ No project ID available for processing")
            return False
            
        print("⏳ AI processing may take 10-30 seconds...")
        success, response = self.run_test(
            "Process Files with AI",
            "POST",
            f"projects/{self.project_id}/process",
            200
        )
        
        if success:
            processed_count = response.get('processed', 0)
            print(f"   Processed {processed_count} files")
            return True
        return False

    def test_extracted_data(self):
        """Test getting extracted data"""
        if not self.project_id:
            print("❌ No project ID available for extracted data")
            return False
            
        success, response = self.run_test(
            "Get Extracted Data",
            "GET",
            f"projects/{self.project_id}/extracted-data",
            200
        )
        
        if success:
            print(f"   Found {len(response)} processed files")
            return True
        return False

    def test_edge_status(self):
        """Test EDGE status endpoint"""
        if not self.project_id:
            print("❌ No project ID available for EDGE status")
            return False
            
        success, response = self.run_test(
            "Get EDGE Status",
            "GET",
            f"projects/{self.project_id}/edge-status",
            200
        )
        
        if success:
            total_files = response.get('total_files', 0)
            processed_files = response.get('processed_files', 0)
            print(f"   Status: {processed_files}/{total_files} files processed")
            return True
        return False

    def test_export_excel(self):
        """Test Excel export"""
        if not self.project_id:
            print("❌ No project ID available for Excel export")
            return False
            
        success, response = self.run_test(
            "Export Excel",
            "GET",
            f"projects/{self.project_id}/export-excel",
            200
        )
        return success

    def test_delete_file(self):
        """Test file deletion"""
        if not self.file_id:
            print("❌ No file ID available for deletion")
            return False
            
        success, response = self.run_test(
            "Delete File",
            "DELETE",
            f"files/{self.file_id}",
            200
        )
        return success

    def test_delete_project(self):
        """Test project deletion"""
        if not self.project_id:
            print("❌ No project ID available for deletion")
            return False
            
        success, response = self.run_test(
            "Delete Project",
            "DELETE",
            f"projects/{self.project_id}",
            200
        )
        return success

def main():
    print("🚀 Starting EDGE Document Processor API Tests")
    print("=" * 60)
    
    tester = EdgeAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_create_project,
        tester.test_list_projects,
        tester.test_get_project,
        tester.test_upload_file,
        tester.test_list_files,
        tester.test_process_files,
        tester.test_extracted_data,
        tester.test_edge_status,
        tester.test_export_excel,
        tester.test_delete_file,
        tester.test_delete_project,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())