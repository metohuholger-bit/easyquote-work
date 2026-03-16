import requests
import sys
import json
from datetime import datetime

class GreenKeeperAPITester:
    def __init__(self, base_url="https://greenkeeper-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_customers = []
        self.created_job_types = []
        self.created_quotes = []

    def run_test(self, name, method, endpoint, expected_status, data=None, return_response=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if return_response:
                    try:
                        return success, response.json()
                    except:
                        return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")

            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_customers(self):
        """Test customer CRUD operations"""
        print("\n" + "="*50)
        print("TESTING CUSTOMER MANAGEMENT")
        print("="*50)
        
        # Test GET customers (should work even if empty)
        success, customers = self.run_test("Get customers", "GET", "customers", 200, return_response=True)
        if not success:
            return False
            
        # Test CREATE customer
        customer_data = {
            "name": "Mario Rossi Test",
            "phone": "+39 123 456 7890",
            "address": "Via Roma 123, Milano, Italy",
            "notes": "Cliente di test"
        }
        
        success, customer = self.run_test("Create customer", "POST", "customers", 200, customer_data, return_response=True)
        if success and 'id' in customer:
            self.created_customers.append(customer['id'])
            customer_id = customer['id']
            
            # Test GET specific customer
            success, _ = self.run_test("Get specific customer", "GET", f"customers/{customer_id}", 200)
            
            # Test UPDATE customer
            update_data = {"notes": "Note aggiornate per test"}
            success, _ = self.run_test("Update customer", "PUT", f"customers/{customer_id}", 200, update_data)
            
            return True
        else:
            print("❌ Failed to create customer - cannot continue customer tests")
            return False

    def test_job_types(self):
        """Test job type CRUD operations"""
        print("\n" + "="*50)
        print("TESTING JOB TYPES MANAGEMENT")
        print("="*50)
        
        # Test GET job types
        success, job_types = self.run_test("Get job types", "GET", "job-types", 200, return_response=True)
        if not success:
            return False
            
        # Test CREATE job type
        job_type_data = {
            "name": "Taglio Erba Test",
            "unit": "mq",
            "price_per_unit": 5.50
        }
        
        success, job_type = self.run_test("Create job type", "POST", "job-types", 200, job_type_data, return_response=True)
        if success and 'id' in job_type:
            self.created_job_types.append(job_type['id'])
            job_type_id = job_type['id']
            
            # Test GET specific job type
            success, _ = self.run_test("Get specific job type", "GET", f"job-types/{job_type_id}", 200)
            
            # Test UPDATE job type
            update_data = {"price_per_unit": 6.00}
            success, _ = self.run_test("Update job type", "PUT", f"job-types/{job_type_id}", 200, update_data)
            
            return True
        else:
            print("❌ Failed to create job type - cannot continue job type tests")
            return False

    def test_quotes(self):
        """Test quote CRUD operations"""
        print("\n" + "="*50)
        print("TESTING QUOTES MANAGEMENT")
        print("="*50)
        
        # Need customer and job type for quote
        if not self.created_customers or not self.created_job_types:
            print("❌ Need customers and job types to test quotes")
            return False
            
        # Test GET quotes
        success, quotes = self.run_test("Get quotes", "GET", "quotes", 200, return_response=True)
        if not success:
            return False
            
        # Test CREATE quote
        quote_data = {
            "customer_id": self.created_customers[0],
            "line_items": [
                {
                    "job_type_id": self.created_job_types[0],
                    "job_name": "Taglio Erba Test",
                    "unit": "mq",
                    "quantity": 100.0,
                    "price_per_unit": 5.50,
                    "total": 550.0
                }
            ]
        }
        
        success, quote = self.run_test("Create quote", "POST", "quotes", 200, quote_data, return_response=True)
        if success and 'id' in quote:
            self.created_quotes.append(quote['id'])
            quote_id = quote['id']
            
            # Test GET specific quote
            success, _ = self.run_test("Get specific quote", "GET", f"quotes/{quote_id}", 200)
            
            # Test PDF generation
            success, _ = self.run_test("Generate quote PDF", "GET", f"quotes/{quote_id}/pdf", 200)
            
            return True
        else:
            print("❌ Failed to create quote - cannot continue quote tests")
            return False

    def test_search_functionality(self):
        """Test search functionality"""
        print("\n" + "="*50)
        print("TESTING SEARCH FUNCTIONALITY")
        print("="*50)
        
        # Test customer search
        success, _ = self.run_test("Search customers", "GET", "customers?search=Mario", 200)
        
        # Test quote search
        success, _ = self.run_test("Search quotes", "GET", "quotes?search=PRV", 200)
        
        return True

    def test_italian_language_responses(self):
        """Test that API responses contain Italian messages"""
        print("\n" + "="*50)
        print("TESTING ITALIAN LANGUAGE")
        print("="*50)
        
        # Test 404 error with Italian message
        success, response = self.run_test("Italian 404 message", "GET", "customers/nonexistent", 404, return_response=True)
        if success == False and "non trovato" in str(response).lower():
            print("✅ Italian error messages working")
            self.tests_passed += 1
        
        # Test validation error
        invalid_customer = {"name": "", "phone": "", "address": ""}
        success, response = self.run_test("Italian validation messages", "POST", "customers", 422, invalid_customer, return_response=True)

    def cleanup(self):
        """Clean up created test data"""
        print("\n" + "="*50)
        print("CLEANUP")
        print("="*50)
        
        # Delete quotes first (they depend on customers)
        for quote_id in self.created_quotes:
            self.run_test(f"Delete quote {quote_id}", "DELETE", f"quotes/{quote_id}", 200)
            
        # Delete customers
        for customer_id in self.created_customers:
            self.run_test(f"Delete customer {customer_id}", "DELETE", f"customers/{customer_id}", 200)
            
        # Delete job types
        for job_type_id in self.created_job_types:
            self.run_test(f"Delete job type {job_type_id}", "DELETE", f"job-types/{job_type_id}", 200)

def main():
    """Main test execution"""
    tester = GreenKeeperAPITester()
    
    print("🌿 GREENKEEPER PRO API TESTING")
    print(f"Testing against: {tester.base_url}")
    print("="*60)
    
    try:
        # Run all test categories
        customer_tests = tester.test_customers()
        job_type_tests = tester.test_job_types() 
        quote_tests = tester.test_quotes()
        search_tests = tester.test_search_functionality()
        
        # Test Italian language
        tester.test_italian_language_responses()
        
        # Print final results
        print("\n" + "="*60)
        print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
        
        success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if customer_tests and job_type_tests and quote_tests:
            print("✅ All major functionality working")
        else:
            print("❌ Some major functionality issues found")
            
        # Cleanup
        tester.cleanup()
        
        return 0 if success_rate >= 80 else 1
        
    except Exception as e:
        print(f"💥 Test suite crashed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())