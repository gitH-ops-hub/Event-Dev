import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class EventManagerAPITester:
    def __init__(self, base_url="https://barcode-events.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.access_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_event_id = None
        self.test_registration_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")

    def test_health_check(self):
        """Test health endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/health")
            success = response.status_code == 200
            self.log_test("Health Check", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False

    def test_admin_login(self):
        """Test admin login"""
        try:
            login_data = {
                "email": "admin@eventmanager.com",
                "password": "Admin@123"
            }
            response = self.session.post(f"{self.api_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access_token')
                # Update session headers with token
                self.session.headers.update({'Authorization': f'Bearer {self.access_token}'})
                self.log_test("Admin Login", True)
                return True
            else:
                self.log_test("Admin Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Login", False, str(e))
            return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/auth/me")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('email') == 'admin@eventmanager.com'
            self.log_test("Get Current User", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Current User", False, str(e))
            return False

    def test_get_branding(self):
        """Test get branding endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/branding")
            success = response.status_code == 200
            self.log_test("Get Branding", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Branding", False, str(e))
            return False

    def test_update_branding(self):
        """Test update branding endpoint"""
        try:
            branding_data = {
                "company_name": "Test Event Manager",
                "primary_color": "#FF5500",
                "tagline": "Testing Events"
            }
            response = self.session.put(f"{self.api_url}/branding", json=branding_data)
            success = response.status_code == 200
            self.log_test("Update Branding", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Update Branding", False, str(e))
            return False

    def test_create_event(self):
        """Test create event endpoint"""
        try:
            # Get tomorrow's date
            tomorrow = datetime.now() + timedelta(days=1)
            
            event_data = {
                "name": "Test Conference 2024",
                "description": "A test conference for API testing",
                "date": tomorrow.strftime("%Y-%m-%d"),
                "time": "10:00",
                "location": "Test Convention Center",
                "guidelines": "Please bring valid ID\nNo outside food allowed",
                "max_registrations": 50,
                "is_active": True,
                "custom_fields": [
                    {
                        "name": "phone",
                        "label": "Phone Number",
                        "field_type": "tel",
                        "required": True,
                        "placeholder": "+1234567890"
                    },
                    {
                        "name": "company",
                        "label": "Company",
                        "field_type": "text",
                        "required": False,
                        "placeholder": "Your company name"
                    }
                ]
            }
            
            response = self.session.post(f"{self.api_url}/events", json=event_data)
            
            if response.status_code == 200:
                data = response.json()
                self.test_event_id = data.get('id')
                self.log_test("Create Event", True)
                return True
            else:
                self.log_test("Create Event", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Event", False, str(e))
            return False

    def test_get_events(self):
        """Test get events endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/events")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list)
            self.log_test("Get Events", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Events", False, str(e))
            return False

    def test_get_single_event(self):
        """Test get single event endpoint"""
        if not self.test_event_id:
            self.log_test("Get Single Event", False, "No test event ID available")
            return False
            
        try:
            response = self.session.get(f"{self.api_url}/events/{self.test_event_id}")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('id') == self.test_event_id
            self.log_test("Get Single Event", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Single Event", False, str(e))
            return False

    def test_public_registration(self):
        """Test public registration endpoint"""
        if not self.test_event_id:
            self.log_test("Public Registration", False, "No test event ID available")
            return False
            
        try:
            registration_data = {
                "event_id": self.test_event_id,
                "first_name": "John",
                "last_name": "Doe",
                "nationality": "US",
                "email": f"test.{uuid.uuid4().hex[:8]}@example.com",
                "custom_fields": {
                    "phone": "+1234567890",
                    "company": "Test Corp"
                }
            }
            
            response = self.session.post(f"{self.api_url}/registrations", json=registration_data)
            
            if response.status_code == 200:
                data = response.json()
                self.test_registration_id = data.get('id')
                # Check if QR code and barcode are generated
                has_qr = bool(data.get('qr_code'))
                has_barcode = bool(data.get('barcode'))
                success = has_qr and has_barcode
                self.log_test("Public Registration", success, f"QR: {has_qr}, Barcode: {has_barcode}")
                return success
            else:
                self.log_test("Public Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Public Registration", False, str(e))
            return False

    def test_get_registration(self):
        """Test get registration endpoint"""
        if not self.test_registration_id:
            self.log_test("Get Registration", False, "No test registration ID available")
            return False
            
        try:
            response = self.session.get(f"{self.api_url}/registrations/{self.test_registration_id}")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('id') == self.test_registration_id
            self.log_test("Get Registration", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Registration", False, str(e))
            return False

    def test_pdf_generation(self):
        """Test PDF ticket generation"""
        if not self.test_registration_id:
            self.log_test("PDF Generation", False, "No test registration ID available")
            return False
            
        try:
            response = self.session.get(f"{self.api_url}/registrations/{self.test_registration_id}/pdf")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = bool(data.get('pdf')) and bool(data.get('filename'))
            self.log_test("PDF Generation", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("PDF Generation", False, str(e))
            return False

    def test_walk_in_registration(self):
        """Test walk-in registration endpoint"""
        if not self.test_event_id:
            self.log_test("Walk-in Registration", False, "No test event ID available")
            return False
            
        try:
            walkin_data = {
                "event_id": self.test_event_id,
                "first_name": "Jane",
                "last_name": "Smith",
                "nationality": "CA",
                "email": f"walkin.{uuid.uuid4().hex[:8]}@example.com",
                "notes": "Recommended by John Doe",
                "custom_fields": {
                    "phone": "+1987654321",
                    "company": "Walk-in Corp"
                }
            }
            
            response = self.session.post(f"{self.api_url}/registrations/walk-in", json=walkin_data)
            success = response.status_code == 200
            if success:
                data = response.json()
                # Walk-ins should be auto checked-in
                success = data.get('checked_in') == True
            self.log_test("Walk-in Registration", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Walk-in Registration", False, str(e))
            return False

    def test_verification_system(self):
        """Test verification/scanner system"""
        if not self.test_registration_id:
            self.log_test("Verification System", False, "No test registration ID available")
            return False
            
        try:
            # First get the registration to get the code
            reg_response = self.session.get(f"{self.api_url}/registrations/{self.test_registration_id}")
            if reg_response.status_code != 200:
                self.log_test("Verification System", False, "Could not get registration code")
                return False
                
            reg_data = reg_response.json()
            code = reg_data.get('code')
            
            if not code:
                self.log_test("Verification System", False, "No registration code found")
                return False
            
            # Test verification
            verify_data = {
                "code": code,
                "event_id": self.test_event_id
            }
            
            response = self.session.post(f"{self.api_url}/verify", json=verify_data)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('valid') == True
            self.log_test("Verification System", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Verification System", False, str(e))
            return False

    def test_get_registrations(self):
        """Test get registrations endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/registrations")
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list)
            self.log_test("Get Registrations", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Registrations", False, str(e))
            return False

    def test_get_stats(self):
        """Test get stats endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/stats")
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ['total_events', 'total_registrations', 'checked_in']
                success = all(field in data for field in required_fields)
            self.log_test("Get Stats", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Stats", False, str(e))
            return False

    def test_logout(self):
        """Test logout endpoint"""
        try:
            response = self.session.post(f"{self.api_url}/auth/logout")
            success = response.status_code == 200
            self.log_test("Logout", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Logout", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Event Manager API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 50)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_admin_login,
            self.test_get_current_user,
            self.test_get_branding,
            self.test_update_branding,
            self.test_create_event,
            self.test_get_events,
            self.test_get_single_event,
            self.test_public_registration,
            self.test_get_registration,
            self.test_pdf_generation,
            self.test_walk_in_registration,
            self.test_verification_system,
            self.test_get_registrations,
            self.test_get_stats,
            self.test_logout
        ]
        
        for test in tests:
            test()
        
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = EventManagerAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())