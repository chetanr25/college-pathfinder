#!/usr/bin/env python3
"""
Test script for the enhanced API endpoints
Tests pagination and sorting features
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_test(name, url, params=None):
    """Helper function to test an endpoint"""
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print(f"URL: {url}")
    if params:
        print(f"Params: {params}")
    print('='*60)
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        if isinstance(data, dict) and 'colleges' in data:
            print(f"✅ Success! Found {data.get('total_count', len(data['colleges']))} colleges")
            if data['colleges']:
                print(f"\nFirst college:")
                first = data['colleges'][0]
                print(f"  - {first.get('college_name')}")
                print(f"  - Branch: {first.get('branch_name', 'N/A')}")
                print(f"  - Cutoff: {first.get('cutoff_rank', 'N/A')}")
                
                if len(data['colleges']) > 1:
                    print(f"\nLast college:")
                    last = data['colleges'][-1]
                    print(f"  - {last.get('college_name')}")
                    print(f"  - Branch: {last.get('branch_name', 'N/A')}")
                    print(f"  - Cutoff: {last.get('cutoff_rank', 'N/A')}")
        else:
            print(f"✅ Success! Response: {json.dumps(data, indent=2)[:200]}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")

def main():
    print("\n" + "="*60)
    print("KCET API Enhancement Test Suite")
    print("Testing Pagination & Sorting Features")
    print("="*60)
    
    # Test 1: Default behavior (top 10 colleges)
    print_test(
        "Default - Get top 10 colleges for rank 5000",
        f"{BASE_URL}/colleges/by-rank/5000",
        {"round": 1}
    )
    
    # Test 2: Custom limit
    print_test(
        "Custom Limit - Get top 25 colleges for rank 5000",
        f"{BASE_URL}/colleges/by-rank/5000",
        {"round": 1, "limit": 25}
    )
    
    # Test 3: Descending sort
    print_test(
        "Descending Sort - Get worst 10 colleges for rank 5000",
        f"{BASE_URL}/colleges/by-rank/5000",
        {"round": 1, "limit": 10, "sort_order": "desc"}
    )
    
    # Test 4: Branch with limit
    print_test(
        "Branch Search - Top 15 Computer Science colleges",
        f"{BASE_URL}/colleges/by-branch/Computer Science Engineering",
        {"round": 1, "limit": 15, "sort_order": "asc"}
    )
    
    # Test 5: Search with all params
    print_test(
        "Advanced Search - Rank range 5000-10000, limited to 20",
        f"{BASE_URL}/colleges/search",
        {
            "min_rank": 5000,
            "max_rank": 10000,
            "round": 1,
            "limit": 20,
            "sort_order": "asc"
        }
    )
    
    # Test 6: Get all branches
    print_test(
        "Get All Branches",
        f"{BASE_URL}/branches/list"
    )
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
