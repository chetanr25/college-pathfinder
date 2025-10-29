#!/usr/bin/env python3
"""
Quick test script to verify CORS configuration
Run this while the backend is running on localhost:8000
"""
import requests

def test_cors():
    """Test CORS configuration"""
    
    print("🧪 Testing CORS Configuration\n")
    print("=" * 60)
    
    # Test 1: OPTIONS preflight request
    print("\n1️⃣  Testing OPTIONS Preflight Request...")
    try:
        response = requests.options(
            "http://localhost:8000/api/branches/all",
            headers={
                "Origin": "http://example.com",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
        }
        
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers:")
        for header, value in cors_headers.items():
            status = "✅" if value else "❌"
            print(f"   {status} {header}: {value}")
        
        if cors_headers["Access-Control-Allow-Origin"] == "*":
            print("\n   ✅ CORS configured correctly! All origins allowed.")
        else:
            print(f"\n   ⚠️  Expected '*', got: {cors_headers['Access-Control-Allow-Origin']}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: GET request with Origin header
    print("\n2️⃣  Testing GET Request with Origin Header...")
    try:
        response = requests.get(
            "http://localhost:8000/api/branches/all",
            headers={"Origin": "http://localhost:3000"}
        )
        
        cors_origin = response.headers.get("Access-Control-Allow-Origin")
        print(f"   Status: {response.status_code}")
        print(f"   Access-Control-Allow-Origin: {cors_origin}")
        
        if cors_origin == "*":
            print("   ✅ GET request CORS working!")
        else:
            print(f"   ⚠️  Unexpected value: {cors_origin}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: POST request
    print("\n3️⃣  Testing POST Request...")
    try:
        response = requests.post(
            "http://localhost:8000/api/chat/sessions",
            headers={
                "Origin": "https://random-domain.com",
                "Content-Type": "application/json"
            },
            json={}
        )
        
        cors_origin = response.headers.get("Access-Control-Allow-Origin")
        print(f"   Status: {response.status_code}")
        print(f"   Access-Control-Allow-Origin: {cors_origin}")
        
        if cors_origin == "*":
            print("   ✅ POST request CORS working!")
        else:
            print(f"   ⚠️  Unexpected value: {cors_origin}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("\n🎉 CORS Testing Complete!")
    print("\nYour backend is configured to accept requests from ANY domain.")
    print("\nTest from browser console:")
    print('fetch("http://localhost:8000/api/branches/all")')
    print('  .then(r => r.json())')
    print('  .then(d => console.log("✅ CORS working!", d))')


if __name__ == "__main__":
    print("\n⚠️  Make sure the backend is running on http://localhost:8000")
    input("Press Enter to start testing... ")
    test_cors()
