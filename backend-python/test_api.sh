#!/bin/bash
# JobForge AI - Complete API Test Suite
# Tests all authentication endpoints thoroughly

set -e

BASE_URL="http://localhost:8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 JobForge AI - Complete API Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing API at: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
    ((TOTAL_TESTS++))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
    ((TOTAL_TESTS++))
}

print_info() { echo -e "${YELLOW}→${NC} $1"; }
print_header() { echo -e "\n${BOLD}${BLUE}$1${NC}"; }

# Store test data
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123"
TEST_NAME="Test User"
ACCESS_TOKEN=""
REFRESH_TOKEN=""

# ============================================
# Test 1: Health Check
# ============================================
print_header "Test 1: Health Check"
print_info "GET /health"

RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "healthy"; then
        print_success "Health check passed (Status: $HTTP_CODE)"
    else
        print_error "Health check failed - Invalid response body"
        echo "$BODY"
    fi
else
    print_error "Health check failed (Status: $HTTP_CODE)"
    echo "$BODY"
fi

# ============================================
# Test 2: API Documentation
# ============================================
print_header "Test 2: API Documentation"
print_info "GET /docs"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/docs)

if [ "$HTTP_CODE" = "200" ]; then
    print_success "API docs accessible (Status: $HTTP_CODE)"
else
    print_error "API docs not accessible (Status: $HTTP_CODE)"
fi

# ============================================
# Test 3: User Registration - Valid
# ============================================
print_header "Test 3: User Registration (Valid)"
print_info "POST /api/v1/auth/register"

REGISTER_DATA=$(cat <<EOF
{
  "email": "$TEST_EMAIL",
  "password": "$TEST_PASSWORD",
  "full_name": "$TEST_NAME"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    if echo "$BODY" | grep -q "$TEST_EMAIL"; then
        USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        print_success "User registered successfully (Status: $HTTP_CODE)"
        print_info "User ID: $USER_ID"
    else
        print_error "Registration succeeded but response invalid"
        echo "$BODY"
    fi
else
    print_error "User registration failed (Status: $HTTP_CODE)"
    echo "$BODY"
fi

# ============================================
# Test 4: User Registration - Duplicate Email
# ============================================
print_header "Test 4: User Registration (Duplicate Email)"
print_info "POST /api/v1/auth/register (same email)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
    if echo "$BODY" | grep -q "already registered"; then
        print_success "Duplicate email correctly rejected (Status: $HTTP_CODE)"
    else
        print_error "Duplicate email rejected but wrong error message"
        echo "$BODY"
    fi
else
    print_error "Duplicate email should return 400 (Got: $HTTP_CODE)"
    echo "$BODY"
fi

# ============================================
# Test 5: User Registration - Weak Password
# ============================================
print_header "Test 5: User Registration (Weak Password)"
print_info "POST /api/v1/auth/register (weak password)"

WEAK_PASSWORD_DATA=$(cat <<EOF
{
  "email": "weakpass@example.com",
  "password": "weak",
  "full_name": "Weak Pass"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "$WEAK_PASSWORD_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "422" ]; then
    print_success "Weak password correctly rejected (Status: $HTTP_CODE)"
else
    print_error "Weak password should return 422 (Got: $HTTP_CODE)"
fi

# ============================================
# Test 6: User Login - Valid Credentials
# ============================================
print_header "Test 6: User Login (Valid Credentials)"
print_info "POST /api/v1/auth/login"

LOGIN_DATA=$(cat <<EOF
{
  "email": "$TEST_EMAIL",
  "password": "$TEST_PASSWORD"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "access_token"; then
        ACCESS_TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        REFRESH_TOKEN=$(echo "$BODY" | grep -o '"refresh_token":"[^"]*"' | cut -d'"' -f4)
        print_success "Login successful (Status: $HTTP_CODE)"
        print_info "Access token: ${ACCESS_TOKEN:0:20}..."
        print_info "Refresh token: ${REFRESH_TOKEN:0:20}..."
    else
        print_error "Login succeeded but tokens missing"
        echo "$BODY"
    fi
else
    print_error "Login failed (Status: $HTTP_CODE)"
    echo "$BODY"
fi

# ============================================
# Test 7: User Login - Invalid Password
# ============================================
print_header "Test 7: User Login (Invalid Password)"
print_info "POST /api/v1/auth/login (wrong password)"

WRONG_PASSWORD_DATA=$(cat <<EOF
{
  "email": "$TEST_EMAIL",
  "password": "WrongPassword123"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "$WRONG_PASSWORD_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    print_success "Invalid password correctly rejected (Status: $HTTP_CODE)"
else
    print_error "Invalid password should return 401 (Got: $HTTP_CODE)"
fi

# ============================================
# Test 8: User Login - Non-existent User
# ============================================
print_header "Test 8: User Login (Non-existent User)"
print_info "POST /api/v1/auth/login (unknown email)"

NONEXISTENT_DATA=$(cat <<EOF
{
  "email": "nonexistent@example.com",
  "password": "$TEST_PASSWORD"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "$NONEXISTENT_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    print_success "Non-existent user correctly rejected (Status: $HTTP_CODE)"
else
    print_error "Non-existent user should return 401 (Got: $HTTP_CODE)"
fi

# ============================================
# Test 9: Get Current User - Valid Token
# ============================================
print_header "Test 9: Get Current User (Valid Token)"
print_info "GET /api/v1/auth/me"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  $BASE_URL/api/v1/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "$TEST_EMAIL"; then
        print_success "Get current user successful (Status: $HTTP_CODE)"
    else
        print_error "Get current user succeeded but data invalid"
        echo "$BODY"
    fi
else
    print_error "Get current user failed (Status: $HTTP_CODE)"
    echo "$BODY"
fi

# ============================================
# Test 10: Get Current User - No Token
# ============================================
print_header "Test 10: Get Current User (No Token)"
print_info "GET /api/v1/auth/me (no auth header)"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/v1/auth/me)

if [ "$HTTP_CODE" = "403" ]; then
    print_success "No token correctly rejected (Status: $HTTP_CODE)"
else
    print_error "No token should return 403 (Got: $HTTP_CODE)"
fi

# ============================================
# Test 11: Get Current User - Invalid Token
# ============================================
print_header "Test 11: Get Current User (Invalid Token)"
print_info "GET /api/v1/auth/me (invalid token)"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  $BASE_URL/api/v1/auth/me \
  -H "Authorization: Bearer invalid_token_here")

if [ "$HTTP_CODE" = "401" ]; then
    print_success "Invalid token correctly rejected (Status: $HTTP_CODE)"
else
    print_error "Invalid token should return 401 (Got: $HTTP_CODE)"
fi

# ============================================
# Test 12: Refresh Token - Valid
# ============================================
print_header "Test 12: Refresh Token (Valid)"
print_info "POST /api/v1/auth/refresh"

REFRESH_DATA=$(cat <<EOF
{
  "refresh_token": "$REFRESH_TOKEN"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "$REFRESH_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "access_token"; then
        NEW_ACCESS_TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        print_success "Token refresh successful (Status: $HTTP_CODE)"
        print_info "New access token: ${NEW_ACCESS_TOKEN:0:20}..."
        # Update access token for next tests
        ACCESS_TOKEN=$NEW_ACCESS_TOKEN
    else
        print_error "Token refresh succeeded but tokens missing"
        echo "$BODY"
    fi
else
    print_error "Token refresh failed (Status: $HTTP_CODE)"
    echo "$BODY"
fi

# ============================================
# Test 13: Refresh Token - Invalid
# ============================================
print_header "Test 13: Refresh Token (Invalid)"
print_info "POST /api/v1/auth/refresh (invalid token)"

INVALID_REFRESH_DATA=$(cat <<EOF
{
  "refresh_token": "invalid_refresh_token"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "$INVALID_REFRESH_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    print_success "Invalid refresh token correctly rejected (Status: $HTTP_CODE)"
else
    print_error "Invalid refresh token should return 401 (Got: $HTTP_CODE)"
fi

# ============================================
# Test 14: Change Password - Valid
# ============================================
print_header "Test 14: Change Password (Valid)"
print_info "POST /api/v1/auth/change-password"

NEW_PASSWORD="NewPassword123"
CHANGE_PASSWORD_DATA=$(cat <<EOF
{
  "old_password": "$TEST_PASSWORD",
  "new_password": "$NEW_PASSWORD"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/change-password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CHANGE_PASSWORD_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "Password updated successfully"; then
        print_success "Password changed successfully (Status: $HTTP_CODE)"
        # Update password for next test
        TEST_PASSWORD=$NEW_PASSWORD
    else
        print_error "Password change succeeded but response invalid"
        echo "$BODY"
    fi
else
    print_error "Password change failed (Status: $HTTP_CODE)"
    echo "$BODY"
fi

# ============================================
# Test 15: Login with New Password
# ============================================
print_header "Test 15: Login with New Password"
print_info "POST /api/v1/auth/login (new password)"

NEW_LOGIN_DATA=$(cat <<EOF
{
  "email": "$TEST_EMAIL",
  "password": "$NEW_PASSWORD"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "$NEW_LOGIN_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Login with new password successful (Status: $HTTP_CODE)"
else
    print_error "Login with new password failed (Status: $HTTP_CODE)"
fi

# ============================================
# Test 16: Logout
# ============================================
print_header "Test 16: Logout"
print_info "POST /api/v1/auth/logout"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  $BASE_URL/api/v1/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "Logged out successfully"; then
        print_success "Logout successful (Status: $HTTP_CODE)"
    else
        print_error "Logout succeeded but response invalid"
        echo "$BODY"
    fi
else
    print_error "Logout failed (Status: $HTTP_CODE)"
    echo "$BODY"
fi

# ============================================
# Final Summary
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $TESTS_PASSED${NC}"
echo -e "${RED}Failed:       $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✨ All tests passed! ✨${NC}"
    echo ""
    echo "Your backend is working perfectly!"
    echo ""
    echo "Next steps:"
    echo "  1. Check API documentation: $BASE_URL/docs"
    echo "  2. Ready to build the frontend!"
    exit 0
else
    echo -e "${RED}${BOLD}⚠️  Some tests failed${NC}"
    echo ""
    echo "Please check the errors above and fix them."
    exit 1
fi
